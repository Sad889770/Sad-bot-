import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Rating from '../models/Rating.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Mostra la leaderboard delle stelle'),

  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const ratings = await Rating.aggregate([
        { $match: { guildId: interaction.guildId } },
        { $group: { _id: '$userId', totalStars: { $sum: '$stars' }, count: { $sum: 1 } } },
        { $sort: { totalStars: -1 } },
        { $limit: 10 },
      ]);

      if (ratings.length === 0) {
        return interaction.editReply('📊 Nessuna valutazione ancora!');
      }

      let leaderboardText = '';
      for (let i = 0; i < ratings.length; i++) {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        leaderboardText += `${medal} <@${ratings[i]._id}> - ${ratings[i].totalStars}⭐ (${ratings[i].count} ticket)\n`;
      }

      const leaderboardEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Leaderboard Stelle')
        .setDescription(leaderboardText)
        .setTimestamp();

      interaction.editReply({ embeds: [leaderboardEmbed] });
    } catch (error) {
      console.error('Leaderboard error:', error);
      interaction.editReply(`❌ Errore: ${error.message}`);
    }
  },
};
