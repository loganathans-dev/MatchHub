const express = require('express');
const router = express.Router();
const { identifiers } = require('../middleware/validation');
router.use((req, res, next) => identifiers(req, res, next));
router.param('id', (req, res, next) => identifiers(req, res, next));
const { createMatch, getMatches, updateMatch } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createMatch).get(protect, getMatches);
router.route('/:id').put(protect, updateMatch);

module.exports = router;
