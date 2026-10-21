const { id, text } = require('../utils/http');
const emailValid = value => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const passwordValid = value => typeof value === 'string' && value.length >= 8 && Buffer.byteLength(value) <= 72;
const authInput = (req, res, next) => {
  const body = req.body;
  if (!body || !emailValid(body.email)) return res.status(400).json({ message: 'A valid email is required' });
  body.email = body.email.trim().toLowerCase();
  if (req.path === '/login' && (!text(body.password) || Buffer.byteLength(body.password) > 72)) return res.status(400).json({ message: 'Password is required (maximum 72 bytes)' });
  if (req.path === '/register') {
    const fields = ['collegeName','collegeCode','collegeType','mobileNumber','address','city','district','state','pincode','coordinatorName','coordinatorMobile'];
    if (!fields.every(key => text(body[key]) && body[key].length <= 300) || !emailValid(body.coordinatorEmail) || !passwordValid(body.password)) return res.status(400).json({ message: 'Complete all registration fields; password must be 8–72 bytes' });
  }
  if (['/verify-otp','/reset-password'].includes(req.path) && (typeof body.otp !== 'string' || !/^\d{6}$/.test(body.otp))) return res.status(400).json({ message: 'Enter a six-digit OTP' });
  if (req.path === '/reset-password' && !passwordValid(body.newPassword)) return res.status(400).json({ message: 'Password must contain at least 8 characters and at most 72 bytes' });
  next();
};
const identifiers = (req, res, next) => {
  for (const value of [...Object.values(req.params), req.query.eventId, req.query.collegeId].filter(value => value !== undefined)) {
    if (!id(value)) return res.status(400).json({ message: 'Invalid identifier' });
  }
  next();
};
// Per-process protection; distributed deployments need a shared rate-limit store.
const rateLimit = ({ limit = 20, windowMs = 15 * 60 * 1000 } = {}) => {
  const entries = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, entry] of entries) if (entry.until <= now) entries.delete(key);
    const key = req.ip;
    const entry = entries.get(key) || { count: 0, until: now + windowMs };
    entries.set(key, entry);
    if (++entry.count > limit) return res.status(429).json({ message: 'Too many attempts. Try again later.' });
    next();
  };
};
module.exports = { authInput, identifiers, rateLimit };
