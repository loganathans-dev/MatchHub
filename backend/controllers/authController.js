const College = require('../models/College');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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
        token: generateToken(college._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid college data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        token: generateToken(college._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB with 10 mins expiry
    college.resetPasswordOTP = otp;
    college.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await college.save();

    logger.info('Saved OTP for forgot-password', { email, otpSaved: true });

    // Get transporter (may throw if SMTP not configured)
    let transporter;
    try {
      transporter = await getTransporter();
    } catch (err) {
      logger.error('Failed to get SMTP transporter', { email, error: err.message });
      return res.status(500).json({ message: 'SMTP not configured or invalid credentials', detail: err.message });
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
      logger.warn('Primary email failed (likely needs App Password). Falling back to Ethereal Email.', { error: err.message });
      
      try {
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
        
        info = await testTransporter.sendMail({
          from: '"Sports Score System Fallback" <noreply@sportsscore.local>',
          to: email,
          subject: 'Password Reset OTP',
          text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
          html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
        });
        logger.info('Password reset email sent via Ethereal fallback', { messageId: info.messageId, to: email });
      } catch (fallbackErr) {
        logger.error('Failed to send OTP email even with fallback', { email, error: fallbackErr.message });
        return res.status(502).json({ message: 'Failed to send OTP email', detail: fallbackErr.message });
      }
    }

    // If a preview URL exists (dev transports), include it
    let previewUrl = null;
    if (nodemailer.getTestMessageUrl && info) {
      try {
        previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) logger.info('Preview email available', { previewUrl });
      } catch (e) {
        // ignore
      }
    }

    const responsePayload = { message: 'OTP Sent successfully' };
    if (previewUrl) responsePayload.previewUrl = previewUrl;

    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!college) {
      return res.status(400).json({ message: 'OTP is invalid or has expired' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!college) {
      return res.status(400).json({ message: 'OTP is invalid or has expired' });
    }

    // Set new password, the pre-save hook will hash it
    college.password = newPassword;
    college.resetPasswordOTP = undefined;
    college.resetPasswordExpires = undefined;
    
    await college.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerCollege,
  authCollege,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
