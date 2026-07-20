import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import Guild from '../models/Guild.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Configura il pannello di creazione ticket')
    .addStringOption(option =>
      option.setName('azione')
        .setDescription('Scegli un\'azione')
        .setRequired(true)
        .addChoices(
          { name: '➕ Crea Pannello', value: 'create' },
          { name: '⚙️ Configura', value: 'config' },
          { name: '📊 Info', value: 'info' }
        )
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.member.permissions.has('ManageGuild')) {
      return interaction.editReply('❌ Hai bisogno del permesso di Gestire il Server!');
    }

    const action = interaction.options.getString('azione');
    let guildData = await Guild.findOne({ guildId: interaction.guildId });

    if (!guildData) {
      guildData = new Guild({ guildId: interaction.guildId, guildName: interaction.guild.name });
      await guildData.save();
    }

    if (action === 'create') {
      const panelEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎫 Sistema Ticket Avanzato')
        .setDescription(
          '**Benvenuto nel nostro sistema ticket!**\n\n'
          + 'Clicca sul pulsante sottostante per creare un nuovo ticket.\n'
          + 'Il nostro team di supporto ti aiuterà al più presto.\n\n'
          + '⏰ Tempo medio di risposta: < 1 ora\n'
          + '📊 Ticket aperti oggi: 12'
        )
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: '🔔 Riceverai aggiornamenti in DM' })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('🎫 Crea Ticket')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎫'),
          new ButtonBuilder()
            .setCustomId('view_tickets')
            .setLabel('📋 I Miei Ticket')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📋')
        );

      const message = await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
      guildData.panelMessage = message.id;
      await guildData.save();

      return interaction.editReply('✅ Pannello creato con successo!');
    }

    if (action === 'config') {
      const modal = new ModalBuilder()
        .setCustomId('panel_config')
        .setTitle('⚙️ Configura Ticket System');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('prefix')
            .setLabel('Prefisso per i ticket')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(10)
            .setPlaceholder('Es: SUPPORT-')
            .setValue(guildData.prefix || '/')
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('ticket_category')
            .setLabel('ID Categoria Ticket')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Copia l\'ID della categoria')
            .setValue(guildData.ticketCategory || '')
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('logs_channel')
            .setLabel('ID Canale Log')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Canale dove verranno salvati i log')
            .setValue(guildData.logsChannel || '')
        )
      );

      await interaction.showModal(modal);
    }

    if (action === 'info') {
      const infoEmbed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('ℹ️ Configurazione Attuale')
        .addFields(
          { name: '🏷️ Prefisso', value: guildData.prefix || 'Non configurato', inline: true },
          { name: '📂 Categoria', value: guildData.ticketCategory || 'Non configurata', inline: true },
          { name: '📝 Canale Log', value: guildData.logsChannel || 'Non configurato', inline: true },
          { name: '📊 Ticket Totali', value: guildData.ticketCounter.toString(), inline: true }
        );

      return interaction.editReply({ embeds: [infoEmbed] });
    }
  },
};
