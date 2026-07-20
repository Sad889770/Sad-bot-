import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  guildId: String,
  ticketId: String,
  action: String, // 'created', 'closed', 'rated', 'reopened'
  userId: String,
  userName: String,
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

logSchema.index({ guildId: 1, createdAt: -1 });

export default mongoose.model('Log', logSchema);
