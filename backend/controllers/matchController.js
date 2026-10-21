const Match = require('../models/Match');
const Event = require('../models/Event');
const Department = require('../models/Department');
const { id, fail, handle } = require('../utils/http');
const createMatch = async (req, res) => {
  try {
    const { event, sportName, type, dateTime, teamA, teamB, participants } = req.body;
    if (!id(event) || !['team','individual','athletics'].includes(type) || typeof dateTime !== 'string' || !Number.isFinite(Date.parse(dateTime))) throw fail(400, 'Valid event, type and date are required');
    const parent = await Event.findOne({ _id: event, college: req.college._id });
    if (!parent) throw fail(404, 'Event not found');
    if (!parent.sportsList.includes(sportName)) throw fail(400, 'Sport must belong to the event');
    const end = new Date(parent.endDate);
    if (new Date(dateTime) < parent.startDate || new Date(dateTime) > end) throw fail(400, 'Match date must fall within the event timeline');
    const ids = type === 'team' ? [teamA, teamB] : participants;
    if (!Array.isArray(ids) || ids.length < 2 || !ids.every(id) || new Set(ids).size !== ids.length) throw fail(400, 'Select at least two distinct departments');
    const departments = await Department.find({ _id: { $in: ids }, event, college: req.college._id });
    if (departments.length !== ids.length || departments.some(d => !d.registeredSports.includes(sportName))) throw fail(400, 'All departments must be registered for this event and sport');
    const match = await Match.create({ event, sportName, type, dateTime, ...(type === 'team' ? { teamA, teamB } : { participants: ids }) });
    res.status(201).json(match);
  } catch (error) { handle(res, error); }
};
const getMatches = async (req, res) => {
  try {
    const events = await Event.find({ college: req.college._id, ...(req.query.eventId ? { _id: req.query.eventId } : {}) }).select('_id');
    const matches = await Match.find({ event: { $in: events.map(e => e._id) } })
      .populate('teamA teamB participants winner runner thirdPlace', 'name')
      .populate('event', 'title').sort({ dateTime: 1 });
    res.json(matches);
  } catch (error) { handle(res, error); }
};
const updateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match || !await Event.exists({ _id: match.event, college: req.college._id })) throw fail(404, 'Match not found');
    const { status = match.status, score = match.score } = req.body;
    if (!['Scheduled','In Progress','Completed'].includes(status) || typeof score !== 'string' || score.length > 300) throw fail(400, 'Invalid status or score');
    const placements = ['winner','runner','thirdPlace'].map(key => req.body[key] === undefined ? match[key] : req.body[key]);
    const allowed = (match.type === 'team' ? [match.teamA, match.teamB] : match.participants).map(String);
    const selected = placements.filter(Boolean).map(String);
    if (selected.some(value => !allowed.includes(value)) || new Set(selected).size !== selected.length) throw fail(400, 'Placements must be distinct participating departments');
    if (match.type === 'team' && placements[2]) throw fail(400, 'Team matches have no third place');
    if (status === 'Completed' && match.type !== 'team' && (!placements[0] || !placements[1])) throw fail(400, 'Winner and runner are required');
    if (status === 'Completed' && match.type === 'team') {
      if (!placements[0] && placements[1]) throw fail(400, 'A draw cannot have a runner');
      if (placements[0]) placements[1] = allowed.find(value => value !== String(placements[0]));
    }
    if (status !== 'Completed' && selected.length) throw fail(400, 'Placements require completed status; clear placements before reopening');
    [match.winner, match.runner, match.thirdPlace] = placements.map(value => value || undefined);
    match.status = status;
    match.score = score;
    res.json(await match.save());
  } catch (error) { handle(res, error); }
};
module.exports = { createMatch, getMatches, updateMatch };
