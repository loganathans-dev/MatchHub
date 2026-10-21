const { handle } = require('../utils/http');
const Event = require('../models/Event');
const { id, text, strings, fail } = require('../utils/http');
const Department = require('../models/Department');

// @desc    Register a new department
// @route   POST /api/departments
// @access  Private
const createDepartment = async (req, res) => {
  try {
    const { name, teamCaptain, captainMobile, registeredSports, eventId } = req.body;

    if (!id(eventId) || !text(name) || !strings(registeredSports)) throw fail(400, 'Name, event and sports are required');
    const event = await Event.findOne({ _id: eventId, college: req.college._id });
    if (!event) throw fail(404, 'Event not found');
    if (registeredSports.some(sport => !event.sportsList.includes(sport))) throw fail(400, 'Sports must belong to the event');
    const departmentExists = await Department.findOne({ name: name.trim(), college: req.college._id, event: eventId });

    if (departmentExists) {
      return res.status(400).json({ message: 'Department already registered' });
    }

    const department = await Department.create({
      name: name.trim(),
      teamCaptain,
      captainMobile,
      registeredSports,
      college: req.college._id,
      event: eventId,
    });

    res.status(201).json(department);
  } catch (error) {
    handle(res, error);
  }
};

// @desc    Get all departments for a college
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    const filter = { college: req.college._id };
    if (req.query.eventId) {
      filter.event = req.query.eventId;
    }
    const departments = await Department.find(filter).sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    handle(res, error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
};
