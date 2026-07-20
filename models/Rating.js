import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: String,
  ticketId: String,
  stars: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  givenBy: String,
  createdAt: { type: Date, default: Date.now },
});

ratingSchema.index({ userId: 1, guildId: 1 });

export default mongoose.model('Rating', ratingSchema);
