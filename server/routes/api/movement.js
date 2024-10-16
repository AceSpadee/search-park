// routes/api/movement.js
const express = require('express');
const { saveMovement, getMovements } = require('../../controllers/locationController');
const auth = require('../../utils/auth');
const router = express.Router();

// POST request to save movement during a session
router.post('/', auth, saveMovement);

// Route to get all movements for the authenticated user
router.get('/', auth, getMovements);

module.exports = router;