const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  sportsList: [{ type: String }],
  status: { type: String, default: 'Upcoming', enum: ['Upcoming', 'Ongoing', 'Completed'] },
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
