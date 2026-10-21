const express = require('express');
const router = express.Router();
const { authInput, rateLimit } = require('../middleware/validation');
router.use(rateLimit(), authInput);
const { registerCollege, authCollege, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

router.post('/register', registerCollege);
router.post('/login', authCollege);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
