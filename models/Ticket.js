import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  guildId: String,
  channelId: String,
  userId: String,
  userName: String,
  ticketNumber: Number,
  status: { type: String, enum: ['open', 'closed', 'on-hold'], default: 'open' },
  subject: String,
  description: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
  closedAt: Date,
  closedBy: String,
  closeReason: String,
  rating: { type: Number, min: 1, max: 5 },
  messages: Number,
  assignedTo: [String],
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
});

export default mongoose.model('Ticket', ticketSchema);
