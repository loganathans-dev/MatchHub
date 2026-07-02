const mongoose = require('mongoose');
const Match = require('./models/Match');
const Department = require('./models/Department');
const College = require('./models/College');
const Event = require('./models/Event');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const mit = await College.findOne({ collegeCode: 'MIT01' });
  const departments = await Department.find({ college: mit._id });
  const matches = await Match.find({ event: { $in: await Event.find({ college: mit._id }) } })
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('participants', 'name')
      .populate('winner', 'name')
      .populate('event', 'title');

  const deptsJson = JSON.parse(JSON.stringify(departments));
  const matchesJson = JSON.parse(JSON.stringify(matches));

  const idToNormName = {};
  const deptPoints = deptsJson.reduce((acc, dept) => {
    const normName = dept.name.trim().toLowerCase();
    idToNormName[dept._id] = normName;
    if (!acc[normName]) acc[normName] = { ...dept, name: dept.name.trim(), totalPoints: 0 };
    return acc;
  }, {});

  matchesJson.forEach(match => {
    if (match.status !== 'Completed') return;
    if (match.type === 'team') {
      const winnerId = match.winner?._id || match.winner;
      let runnerId = match.runner?._id || match.runner;
      const teamAId = match.teamA?._id || match.teamA;
      const teamBId = match.teamB?._id || match.teamB;

      if (!runnerId) {
        if (winnerId === teamAId) runnerId = teamBId;
        else if (winnerId === teamBId) runnerId = teamAId;
      }
      
      const winnerName = idToNormName[winnerId];
      const runnerName = idToNormName[runnerId];
      if (winnerName && deptPoints[winnerName]) deptPoints[winnerName].totalPoints += 10;
      if (runnerName && deptPoints[runnerName]) deptPoints[runnerName].totalPoints += 5;
    } else {
      const winnerId = match.winner?._id || match.winner;
      const runnerId = match.runner?._id || match.runner;
      const thirdPlaceId = match.thirdPlace?._id || match.thirdPlace;
      const winnerName = idToNormName[winnerId];
      const runnerName = idToNormName[runnerId];
      const thirdPlaceName = idToNormName[thirdPlaceId];
      if (winnerName && deptPoints[winnerName]) deptPoints[winnerName].totalPoints += 10;
      if (runnerName && deptPoints[runnerName]) deptPoints[runnerName].totalPoints += 5;
      if (thirdPlaceName && deptPoints[thirdPlaceName]) deptPoints[thirdPlaceName].totalPoints += 3;
    }
  });
  const res = Object.values(deptPoints).sort((a, b) => b.totalPoints - a.totalPoints);
  console.log(res.map(d => `${d.name}: ${d.totalPoints}`));
  process.exit(0);
}
run();
