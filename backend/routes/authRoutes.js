const express = require('express');
const router = express.Router();
const { registerCollege, authCollege, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

router.post('/register', registerCollege);
router.post('/login', authCollege);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
