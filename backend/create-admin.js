require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
(async () => {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL || '') || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 || Buffer.byteLength(ADMIN_PASSWORD) > 72) throw new Error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD (12 characters minimum, 72 bytes maximum)');
  await mongoose.connect(MONGODB_URI);
  await Admin.create({ email: ADMIN_EMAIL.trim().toLowerCase(), password: ADMIN_PASSWORD });
  console.log('Administrator created');
})().catch(error => { console.error(error.code === 11000 ? 'Administrator already exists' : error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
