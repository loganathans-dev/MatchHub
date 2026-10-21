const express = require('express');
const router = express.Router();
const { authInput, rateLimit } = require('../middleware/validation');
const { protectAdmin } = require('../middleware/authMiddleware');
router.get('/colleges', protectAdmin, require('../controllers/publicController').getColleges);
const { authAdmin } = require('../controllers/adminController');

router.post('/login', rateLimit(), authInput, authAdmin);

module.exports = router;
