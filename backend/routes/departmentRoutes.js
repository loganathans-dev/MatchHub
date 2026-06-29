const express = require('express');
const router = express.Router();
const { createDepartment, getDepartments } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createDepartment).get(protect, getDepartments);

module.exports = router;
