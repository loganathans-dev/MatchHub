const mongoose = require('mongoose');
const Match = require('./backend/models/Match');
const Department = require('./backend/models/Department');
require('dotenv').config({path: './backend/.env'});

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const matches = await Match.find({ status: 'Completed' }).populate('winner teamA teamB');
  console.log(matches[0]);
  process.exit(0);
}
run();
