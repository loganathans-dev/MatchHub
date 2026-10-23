const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.disable('x-powered-by');
const allowedOrigins = new Set([
  'http://localhost:5173',
  'https://match-hub.netlify.app',
  ...(process.env.CLIENT_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean),
]);
app.use(cors({ origin: (origin, callback) => callback(null, allowedOrigins.has(origin)) }));
app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && (!req.body || Array.isArray(req.body))) return res.status(400).json({ message: 'A JSON object body is required' });
  next();
});

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Sports Score Backend API is running');
});

app.use((req, res) => res.status(404).json({ message: 'API route not found' }));
app.use((err, req, res, next) => {
  require('./utils/http').handle(res, err);
});

const start = async () => {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === 'your_jwt_secret_here') {
    throw new Error('Set MONGODB_URI and a JWT_SECRET of at least 32 characters');
  }
  await connectDB();
  return app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};
if (require.main === module) start().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { app, start };
