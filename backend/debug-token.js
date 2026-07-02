const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/home/loganathan/sports_score/backend/.env' });
const College = require('./models/College');
// Using native fetch

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find any college
    const college = await College.findOne();
    if (!college) {
      console.log('No college found to impersonate');
      return;
    }
    
    const token = jwt.sign({ id: college._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Generated token for college:', college.name);
    
    // Now make the fetch request
    const response = await global.fetch('http://localhost:5000/api/matches/6a42024a3579b30e84f30982', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'Completed',
        winner: '6a4201d73579b30e84f30980',
        score: '100 - 120'
      })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
