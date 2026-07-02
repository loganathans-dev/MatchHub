const mongoose = require('mongoose');
const Match = require('./models/Match');
const Department = require('./models/Department');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const matches = await Match.find({ status: 'Completed' }).populate('winner teamA teamB');
  console.log(JSON.stringify(matches[0], null, 2));
  process.exit(0);
}
run();
