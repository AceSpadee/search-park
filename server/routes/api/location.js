const express = require('express');
const { saveLocation, getLocations } = require('../../controllers/locationController');
const auth = require('../../utils/auth');  // JWT authentication middleware
const router = express.Router();

// POST request to save a new location (protected route)
router.post('/location', auth, saveLocation);

// GET request to fetch all locations for the user (protected route)
router.get('/locations', auth, getLocations);

module.exports = router;