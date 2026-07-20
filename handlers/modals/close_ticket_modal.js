import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Ticket from '../../models/Ticket.js';
import Log from '../../models/Log.js';

export default {
  customId: 'close_ticket_modal',
  async execute(interaction, client) {
    await interaction.deferReply();

    const reason = interaction.fields.getTextInputValue('close_reason');
    const notes = interaction.fields.getTextInputValue('close_notes') || 'Nessuna nota';

    try {
      // Extract ticket ID from channel name
      const channelName = interaction.channel.name;
      const ticketNumber = channelName.split('-').pop();
      const ticket = await Ticket.findOne({ ticketNumber: parseInt(ticketNumber) });

      if (!ticket) {
        return interaction.editReply('❌ Ticket non trovato!');
      }

      ticket.status = 'closed';
      ticket.closedAt = new Date();
      ticket.closedBy = interaction.user.username;
      ticket.closeReason = reason;
      await ticket.save();

      // Log action
      const log = new Log({
        guildId: interaction.guildId,
        ticketId: ticket.ticketId,
        action: 'closed',
        userId: interaction.user.id,
        userName: interaction.user.username,
        description: `Ticket chiuso: ${reason}`,
        metadata: { notes },
      });
      await log.save();

      // Send close embed
      const closeEmbed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🔒 Ticket Chiuso')
        .addFields(
          { name: 'Motivo', value: reason },
          { name: 'Chiuso da', value: interaction.user.username },
          { name: 'Note', value: notes }
        )
        .setTimestamp();

      const ratingButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('rate_ticket')
          .setLabel('⭐ Valuta il Servizio')
          .setStyle(ButtonStyle.Success)
      );

      await interaction.editReply({ embeds: [closeEmbed], components: [ratingButton] });

      // Delete channel after 10 seconds
      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 10000);
    } catch (error) {
      console.error('Close ticket error:', error);
      interaction.editReply(`❌ Errore: ${error.message}`);
    }
  },
};
