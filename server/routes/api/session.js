const express = require('express');
const {
  startNewSession,
  saveMovement,
  stopSession,
  getMovements,
  getSessions,
  getAllSessions,
} = require('../../controllers/sessionController'); // Import from sessionController
const auth = require('../../utils/auth');
const router = express.Router();

// Start a new session
router.post('/start', auth, startNewSession);

// Save a movement for a specific session
router.post('/:sessionId/movement', auth, saveMovement);

// Stop a session
router.put('/:sessionId/stop', auth, stopSession);

// Route for all sessions
router.get('/all', getAllSessions); // Place `/all` before `/:sessionId?`

// Get all sessions with grouped movements
router.get('/', auth, getSessions);

// Get all sessions or movements for a specific session
router.get('/:sessionId?', auth, getMovements);

module.exports = router;