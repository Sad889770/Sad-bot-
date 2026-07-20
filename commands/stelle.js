import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Rating from '../models/Rating.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stelle')
    .setDescription('Mostra le stelle di un utente')
    .addUserOption(option =>
      option.setName('utente')
        .setDescription('L\'utente di cui visualizzare le stelle')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const user = interaction.options.getUser('utente');

    try {
      const ratings = await Rating.find({
        userId: user.id,
        guildId: interaction.guildId,
      });

      if (ratings.length === 0) {
        return interaction.editReply(`${user.username} non ha ancora ricevuto valutazioni!`);
      }

      const totalStars = ratings.reduce((acc, r) => acc + r.stars, 0);
      const avgStars = (totalStars / ratings.length).toFixed(2);

      let ratingsText = '';
      ratings.slice(0, 10).forEach((rating, index) => {
        ratingsText += `\n**Ticket ${index + 1}**: ${'⭐'.repeat(rating.stars)} (${rating.stars} stelle)`;
      });

      const stelleEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`⭐ Stelle di ${user.username}`)
        .addFields(
          { name: '📊 Totale Stelle', value: `${totalStars}⭐`, inline: true },
          { name: '📈 Media Voto', value: `${avgStars}⭐`, inline: true },
          { name: '🎫 Ticket Valutati', value: ratings.length.toString(), inline: true },
          { name: '📝 Ultimi Voti', value: ratingsText || 'Nessuno' }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      interaction.editReply({ embeds: [stelleEmbed] });
    } catch (error) {
      console.error('Stelle command error:', error);
      interaction.editReply(`❌ Errore: ${error.message}`);
    }
  },
};
