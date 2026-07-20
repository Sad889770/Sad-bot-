import Rating from '../../models/Rating.js';
import Ticket from '../../models/Ticket.js';
import Log from '../../models/Log.js';
import { EmbedBuilder } from 'discord.js';

export default {
  customId: 'rate_',
  async execute(interaction, client) {
    const stars = parseInt(interaction.customId.split('_')[1]);

    try {
      const channelName = interaction.channel.name;
      const ticketNumber = channelName.split('-').pop();
      const ticket = await Ticket.findOne({ ticketNumber: parseInt(ticketNumber) });

      if (!ticket) {
        return interaction.reply({ content: '❌ Ticket non trovato!', ephemeral: true });
      }

      // Save rating
      const rating = new Rating({
        userId: interaction.user.id,
        guildId: interaction.guildId,
        ticketId: ticket.ticketId,
        stars,
        givenBy: interaction.user.username,
      });
      await rating.save();

      // Update ticket rating
      ticket.rating = stars;
      await ticket.save();

      // Log
      const log = new Log({
        guildId: interaction.guildId,
        ticketId: ticket.ticketId,
        action: 'rated',
        userId: interaction.user.id,
        userName: interaction.user.username,
        description: `Ticket valutato: ${stars} stelle`,
      });
      await log.save();

      const rateEmbed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle('⭐ Grazie per la Valutazione!')
        .setDescription(`Hai dato ${stars} stella${stars > 1 ? 's' : ''} al nostro servizio.`);

      await interaction.reply({ embeds: [rateEmbed], ephemeral: true });
    } catch (error) {
      console.error('Rating error:', error);
      interaction.reply({ content: `❌ Errore: ${error.message}`, ephemeral: true });
    }
  },
};
