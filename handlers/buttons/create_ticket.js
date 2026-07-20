import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
  customId: 'create_ticket',
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId('ticket_modal')
      .setTitle('📋 Crea un Nuovo Ticket');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('ticket_subject')
          .setLabel('Oggetto del Ticket')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Es: Problema con accesso al server')
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('ticket_description')
          .setLabel('Descrizione Dettagliata')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Descrivi il tuo problema nel dettaglio...'
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('ticket_priority')
          .setLabel('Priorità')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('low / medium / high / urgent')
          .setRequired(false)
      )
    );

    await interaction.showModal(modal);
  },
};
