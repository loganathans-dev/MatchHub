const { handle } = require('../utils/http');
const { text, strings, fail } = require('../utils/http');
const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (College Admin)
const createEvent = async (req, res) => {
  try {
    const { title, startDate, endDate, description, sportsList } = req.body;
    const eventTitle = title || req.body.eventTitle || req.body.eventName || req.body.name;

    if (!text(eventTitle)) {
      return res.status(400).json({ message: 'Event title is required' });
    }

    if (typeof startDate !== 'string' || typeof endDate !== 'string' || !Number.isFinite(Date.parse(startDate)) || !Number.isFinite(Date.parse(endDate)) || new Date(endDate) <= new Date(startDate)) throw fail(400, 'Provide a valid event date range');
    if (!strings(sportsList)) throw fail(400, 'Select at least one sport');
    const event = await Event.create({
      title: eventTitle.trim(),
      startDate,
      endDate,
      description,
      sportsList,
      college: req.college._id,
    });

    res.status(201).json(event);
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Get all events for a college
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ college: req.college._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    handle(res, error);
  }
};

module.exports = {
  createEvent,
  getEvents,
};
