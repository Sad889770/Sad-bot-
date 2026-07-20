import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  customId: 'rate_ticket',
  async execute(interaction, client) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rate_1')
          .setLabel('⭐')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rate_2')
          .setLabel('⭐⭐')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rate_3')
          .setLabel('⭐⭐⭐')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rate_4')
          .setLabel('⭐⭐⭐⭐')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rate_5')
          .setLabel('⭐⭐⭐⭐⭐')
          .setStyle(ButtonStyle.Success)
      );

    await interaction.reply({
      content: '**Valuta il nostro servizio di supporto!**',
      components: [row],
      ephemeral: true,
    });
  },
};
