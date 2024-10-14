// routes/api/session.js
const express = require('express');
const { startNewSession, saveMovement, stopSession } = require('../../controllers/locationController');
const auth = require('../../utils/auth');
const router = express.Router();

// POST request to start a new session (when Start Tracking is clicked)
router.post('/start', auth, startNewSession);

// POST request to save movement during a session
router.post('/movement', auth, saveMovement);

// POST request to stop a session (when Stop Tracking is clicked)
router.post('/stop', auth, stopSession);

module.exports = router;