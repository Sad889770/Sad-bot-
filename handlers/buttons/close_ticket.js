import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
  customId: 'close_ticket',
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId('close_ticket_modal')
      .setTitle('🔒 Chiudi Ticket');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('close_reason')
          .setLabel('Motivo della chiusura')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Es: Problema risolto')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('close_notes')
          .setLabel('Note aggiuntive')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Aggiungi delle note per il team di supporto...'
          .setRequired(false)
      )
    );

    await interaction.showModal(modal);
  },
};
