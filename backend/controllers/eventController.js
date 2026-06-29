const Event = require('../models/Event');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (College Admin)
const createEvent = async (req, res) => {
  try {
    const { title, startDate, endDate, description, sportsList } = req.body;

    const event = await Event.create({
      title,
      startDate,
      endDate,
      description,
      sportsList,
      college: req.college._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
};
