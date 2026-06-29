const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  collegeCode: { type: String, required: true },
  collegeType: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  coordinatorName: { type: String, required: true },
  coordinatorMobile: { type: String, required: true },
  coordinatorEmail: { type: String, required: true },
  collegeLogo: { type: String, default: '' },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
}, {
  timestamps: true
});

collegeSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

collegeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('College', collegeSchema);
