import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  guildName: String,
  prefix: { type: String, default: '/' },
  ticketCategory: String,
  logsChannel: String,
  ticketsRole: [String],
  closeRole: [String],
  panelMessage: String,
  ticketCounter: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Guild', guildSchema);
