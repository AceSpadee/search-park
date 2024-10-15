// routes/api/movement.js
const express = require('express');
const { saveMovement } = require('../../controllers/locationController');
const auth = require('../../utils/auth');
const router = express.Router();

// POST request to save movement during a session
router.post('/', auth, saveMovement);

module.exports = router;