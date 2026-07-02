const Match = require('../models/Match');
const Event = require('../models/Event');

// @desc    Schedule a new match
// @route   POST /api/matches
// @access  Private
const createMatch = async (req, res) => {
  try {
    const { event, sportName, type, dateTime, teamA, teamB, participants } = req.body;

    const parentEvent = await Event.findById(event);
    if (!parentEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const matchDate = new Date(dateTime);
    const eventStart = new Date(parentEvent.startDate);
    const eventEnd = new Date(parentEvent.endDate);

    if (matchDate < eventStart || matchDate > eventEnd) {
      return res.status(400).json({ message: 'Match date must fall within the event timeline.' });
    }

    const match = await Match.create({
      event,
      sportName,
      type,
      dateTime,
      teamA,
      teamB,
      participants,
    });

    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all matches
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res) => {
  try {
    // Ideally filter by events belonging to the logged-in college
    // Simplified for now: get all matches, populate references
    const filter = {};
    if (req.query.eventId) {
      filter.event = req.query.eventId;
    }
    const matches = await Match.find(filter)
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('participants', 'name')
      .populate('winner', 'name')
      .populate('event', 'title')
      .sort({ dateTime: 1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update match status/results
// @route   PUT /api/matches/:id
// @access  Private
const updateMatch = async (req, res) => {
  try {
    const { status, winner, runner, thirdPlace, score } = req.body;

    const match = await Match.findById(req.params.id);

    if (match) {
      match.status = status || match.status;
      if (winner !== undefined) match.winner = winner;
      if (runner !== undefined) match.runner = runner;
      if (thirdPlace !== undefined) match.thirdPlace = thirdPlace;
      match.score = score || match.score;

      const updatedMatch = await match.save();
      res.json(updatedMatch);
    } else {
      res.status(404).json({ message: 'Match not found' });
    }
  } catch (error) {
    require('fs').appendFileSync('error.log', new Date().toISOString() + '\\n' + error.stack + '\\n');
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMatch,
  getMatches,
  updateMatch,
};
