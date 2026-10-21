const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  teamCaptain: { type: String, required: false },
  captainMobile: { type: String, required: false },
  registeredSports: [{ type: String }],
}, {
  timestamps: true
});

departmentSchema.index({ college: 1, event: 1, name: 1 });

module.exports = mongoose.model('Department', departmentSchema);
