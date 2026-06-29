const Department = require('../models/Department');

// @desc    Register a new department
// @route   POST /api/departments
// @access  Private
const createDepartment = async (req, res) => {
  try {
    const { name, teamCaptain, captainMobile, registeredSports, eventId } = req.body;

    const departmentExists = await Department.findOne({ name, college: req.college._id, event: eventId });

    if (departmentExists) {
      return res.status(400).json({ message: 'Department already registered' });
    }

    const department = await Department.create({
      name,
      teamCaptain,
      captainMobile,
      registeredSports,
      college: req.college._id,
      event: eventId,
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
};
