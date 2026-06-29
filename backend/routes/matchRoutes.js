const express = require('express');
const router = express.Router();
const { createMatch, getMatches, updateMatch } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createMatch).get(protect, getMatches);
router.route('/:id').put(protect, updateMatch);

module.exports = router;
