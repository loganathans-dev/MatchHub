// Using native fetch
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '/home/loganathan/sports_score/backend/.env' });

async function testApi() {
  try {
    const token = jwt.sign({ id: 'dummy', role: 'admin' }, process.env.JWT_SECRET || 'super_secret_jwt_key_for_sports_score', { expiresIn: '1d' });

    const response = await fetch('http://localhost:5000/api/matches/6a42024a3579b30e84f30982', {
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
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testApi();
