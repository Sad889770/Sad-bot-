import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import Ticket from '../../models/Ticket.js';
import Guild from '../../models/Guild.js';
import Log from '../../models/Log.js';

export default {
  customId: 'ticket_modal',
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const subject = interaction.fields.getTextInputValue('ticket_subject');
    const description = interaction.fields.getTextInputValue('ticket_description');
    const priority = interaction.fields.getTextInputValue('ticket_priority') || 'medium';

    const guildData = await Guild.findOne({ guildId: interaction.guildId });
    if (!guildData || !guildData.ticketCategory) {
      return interaction.editReply('❌ Ticket system non configurato correttamente!');
    }

    try {
      const category = await interaction.guild.channels.fetch(guildData.ticketCategory);
      if (!category) throw new Error('Categoria non trovata');

      guildData.ticketCounter += 1;
      const ticketNumber = guildData.ticketCounter;
      const ticketId = `ticket-${ticketNumber}`;

      // Create ticket channel
      const ticketChannel = await interaction.guild.channels.create({
        name: `${guildData.prefix}${ticketNumber}`,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: interaction.guildId,
            deny: ['ViewChannel'],
          },
          {
            id: interaction.user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
          },
        ],
      });

      // Create ticket embed
      const ticketEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎫 Ticket #${ticketNumber}`)
        .setDescription(description)
        .addFields(
          { name: '👤 Aperto da', value: `<@${interaction.user.id}>`, inline: true },
          { name: '⏰ Data', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
          { name: '🎯 Priorità', value: `**${priority.toUpperCase()}**`, inline: true },
          { name: '📌 Oggetto', value: subject, inline: false }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `ID Ticket: ${ticketId}` });

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('❌ Chiudi Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ embeds: [ticketEmbed], components: [closeButton] });

      // Save to DB
      const newTicket = new Ticket({
        ticketId,
        guildId: interaction.guildId,
        channelId: ticketChannel.id,
        userId: interaction.user.id,
        userName: interaction.user.username,
        ticketNumber,
        subject,
        description,
        priority,
        status: 'open',
      });
      await newTicket.save();
      await guildData.save();

      // Log
      const log = new Log({
        guildId: interaction.guildId,
        ticketId,
        action: 'created',
        userId: interaction.user.id,
        userName: interaction.user.username,
        description: `Ticket creato: ${subject}`,
      });
      await log.save();

      return interaction.editReply(`✅ Ticket creato: <#${ticketChannel.id}>`);
    } catch (error) {
      console.error('Ticket creation error:', error);
      return interaction.editReply(`❌ Errore: ${error.message}`);
    }
  },
};
