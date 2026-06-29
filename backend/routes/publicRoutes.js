const express = require('express');
const router = express.Router();
const {
  getColleges,
  getCollegeById,
  getEvents,
  getCollegeMatches,
  getCollegeDepartments,
} = require('../controllers/publicController');

router.get('/colleges', getColleges);
router.get('/colleges/:id', getCollegeById);
router.get('/events', getEvents);
router.get('/colleges/:id/matches', getCollegeMatches);
router.get('/colleges/:id/departments', getCollegeDepartments);

module.exports = router;
