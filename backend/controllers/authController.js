const { handle } = require('../utils/http');
const College = require('../models/College');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const otpHash = otp => crypto.createHash('sha256').update(otp + process.env.JWT_SECRET).digest('hex');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env for real email delivery.');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const generateToken = (id, version = 0) => {
  return jwt.sign({ id, role: 'college', version }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new college
// @route   POST /api/auth/register
// @access  Public
const registerCollege = async (req, res) => {
  try {
    const { email, password, collegeName, collegeCode, collegeType, mobileNumber, address, city, district, state, pincode, coordinatorName, coordinatorMobile, coordinatorEmail } = req.body;

    const collegeExists = await College.findOne({ email });

    if (collegeExists) {
      return res.status(400).json({ message: 'College already registered with this email' });
    }

    const college = await College.create({
      email, password, collegeName, collegeCode, collegeType, mobileNumber, address, city, district, state, pincode, coordinatorName, coordinatorMobile, coordinatorEmail
    });

    if (college) {
      res.status(201).json({
        _id: college._id,
        email: college.email,
        collegeName: college.collegeName,
        token: generateToken(college._id, college.tokenVersion),
      });
    } else {
      res.status(400).json({ message: 'Invalid college data' });
    }
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authCollege = async (req, res) => {
  try {
    const { email, password } = req.body;

    const college = await College.findOne({ email });

    if (college && (await college.matchPassword(password))) {
      res.json({
        _id: college._id,
        email: college.email,
        collegeName: college.collegeName,
        token: generateToken(college._id, college.tokenVersion),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const college = await College.findOne({ email });

    if (!college) {
      return res.status(404).json({ message: 'No college registered with this email' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Save to DB with 10 mins expiry
    college.resetPasswordOTP = otpHash(otp);
    college.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await college.save();

    logger.info('Saved OTP for forgot-password', { email, otpSaved: true });

    // Get transporter (may throw if SMTP not configured)
    let transporter;
    try {
      transporter = await getTransporter();
    } catch (err) {
      logger.error('Failed to get SMTP transporter', { email, error: err.message });
      college.resetPasswordOTP = undefined;
      college.resetPasswordExpires = undefined;
      await college.save();
      return res.status(503).json({ message: 'Password reset email is unavailable' });
    }

    let info;
    try {
      info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Sports Score System" <noreply@sportsscore.local>',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
      });
      logger.info('Password reset email sent', { messageId: info.messageId, to: email });
    } catch (err) {
      college.resetPasswordOTP = undefined;
      college.resetPasswordExpires = undefined;
      await college.save();
      logger.error('Password reset delivery failed', { error: err.message });
      return res.status(502).json({ message: 'Unable to deliver reset email. Try again later.' });
    }
    res.status(200).json({ message: 'OTP Sent successfully' });
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const college = await College.findOne({
      email,
      resetPasswordOTP: otpHash(otp),
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!college) {
      return res.status(400).json({ message: 'OTP is invalid or has expired' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const college = await College.findOne({
      email,
      resetPasswordOTP: otpHash(otp),
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!college) {
      return res.status(400).json({ message: 'OTP is invalid or has expired' });
    }

    // Hash explicitly because findOneAndUpdate does not run save middleware.
    const password = await require('bcryptjs').hash(newPassword, 10);
    const updated = await College.findOneAndUpdate({
      _id: college._id, resetPasswordOTP: otpHash(otp), resetPasswordExpires: { $gt: Date.now() }
    }, { $set: { password }, $unset: { resetPasswordOTP: '', resetPasswordExpires: '' }, $inc: { tokenVersion: 1 } });
    if (!updated) return res.status(400).json({ message: 'OTP is invalid or has expired' });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    handle(res, error);
  }
};

module.exports = {
  registerCollege,
  authCollege,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
