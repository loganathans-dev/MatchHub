const jwt = require('jsonwebtoken');
const College = require('../models/College');
const Admin = require('../models/Admin');
const authenticate = (Model, role, property) => async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required' });
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (decoded.role !== role) return res.status(403).json({ message: 'Access denied' });
    const account = await Model.findById(decoded.id).select('-password -resetPasswordOTP -resetPasswordExpires');
    if (!account) return res.status(401).json({ message: 'Account no longer exists' });
    if (role === 'college' && (decoded.version || 0) !== (account.tokenVersion || 0)) return res.status(401).json({ message: 'Session expired. Sign in again.' });
    req[property] = account;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
};
module.exports = { protect: authenticate(College, 'college', 'college'), protectAdmin: authenticate(Admin, 'admin', 'admin') };
