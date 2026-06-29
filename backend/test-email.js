require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing Gmail Authentication...');
console.log(`Using Email: ${process.env.EMAIL_USER}`);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('\n❌ GMAIL AUTHENTICATION FAILED!');
    console.error('Reason: Your Google Account is blocking the sign-in attempt.');
    console.error('Fix: You MUST use a 16-character "App Password", not your regular account password.');
    console.error('\nFollow these steps to generate an App Password:');
    console.error('1. Go to your Google Account (https://myaccount.google.com/)');
    console.error('2. Go to "Security" on the left menu.');
    console.error('3. Make sure "2-Step Verification" is turned ON.');
    console.error('4. Search for "App Passwords" in the search bar at the top.');
    console.error('5. Create a new App Password for "Other" and name it "Sports Score App".');
    console.error('6. Google will give you a 16-character code (e.g., abcd efgh ijkl mnop).');
    console.error('7. Open your backend/.env file and change EMAIL_PASS to this 16-character code (no spaces).');
    console.error('8. Run this script again: node test-email.js');
    console.error('\nError Details:', error.response);
  } else {
    console.log('\n✅ GMAIL AUTHENTICATION SUCCESSFUL!');
    console.log('The server is ready to send real emails to your inbox.');
    console.log('You can now go to your frontend, click "Forgot Password", and the OTP will go straight to your inbox!');
  }
});
