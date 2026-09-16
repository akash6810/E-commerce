const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-deletes after 10 minutes (600 seconds)
});

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);