const { handle } = require('../utils/http');
const College = require('../models/College');
const Event = require('../models/Event');
const Match = require('../models/Match');
const Department = require('../models/Department');

// @desc    Get all colleges
// @route   GET /api/public/colleges
// @access  Public
const getColleges = async (req, res) => {
  try {
    const colleges = await College.find().select('collegeName collegeCode collegeType city district state collegeLogo');
    res.json(colleges);
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Get single college by ID
// @route   GET /api/public/colleges/:id
// @access  Public
const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id).select('collegeName collegeCode collegeType city district state collegeLogo');
    if (college) {
      res.json(college);
    } else {
      res.status(404).json({ message: 'College not found' });
    }
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Get all events (public)
// @route   GET /api/public/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find(req.query.collegeId ? { college: req.query.collegeId } : {}).populate('college', 'collegeName city').sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Get matches for a college
// @route   GET /api/public/colleges/:id/matches
// @access  Public
const getCollegeMatches = async (req, res) => {
  try {
    // 1. Get all events for this college
    const events = await Event.find({ college: req.params.id, ...(req.query.eventId ? { _id: req.query.eventId } : {}) }).select('_id');
    const eventIds = events.map(e => e._id);

    // 2. Get all matches for those events
    const matches = await Match.find({ event: { $in: eventIds } })
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('participants', 'name')
      .populate('winner', 'name')
      .populate('runner', 'name')
      .populate('thirdPlace', 'name')
      .populate('event', 'title')
      .sort({ dateTime: 1 });

    res.json(matches);
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Get departments for a college
// @route   GET /api/public/colleges/:id/departments
// @access  Public
const getCollegeDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ college: req.params.id, ...(req.query.eventId ? { event: req.query.eventId } : {}) }).select('name event college registeredSports').sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    handle(res, error);
  }
};

module.exports = {
  getColleges,
  getCollegeById,
  getEvents,
  getCollegeMatches,
  getCollegeDepartments,
};
