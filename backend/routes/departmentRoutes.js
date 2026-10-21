const express = require('express');
const router = express.Router();
const { identifiers } = require('../middleware/validation');
router.use((req, res, next) => identifiers(req, res, next));
router.param('id', (req, res, next) => identifiers(req, res, next));
const { createDepartment, getDepartments } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createDepartment).get(protect, getDepartments);

module.exports = router;
