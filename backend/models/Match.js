const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  sportName: { type: String, required: true },
  type: { type: String, enum: ['team', 'individual', 'athletics'], required: true },
  dateTime: { type: Date, required: true },
  
  // For team and individual sports
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  
  // For athletics (multiple participants)
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  
  status: { type: String, default: 'Scheduled', enum: ['Scheduled', 'In Progress', 'Completed'] },
  
  // Results
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  runner: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  thirdPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  score: { type: String, default: '' },
}, {
  timestamps: true
});

matchSchema.index({ event: 1, dateTime: 1 });

module.exports = mongoose.model('Match', matchSchema);
