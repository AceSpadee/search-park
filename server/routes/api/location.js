// routes/api/location.js
const express = require('express');
const { saveLocation, getLocations } = require('../../controllers/locationController');
const auth = require('../../utils/auth');
const router = express.Router();

// POST request to save a new location
router.post('/', auth, saveLocation);

// GET request to fetch all locations for the user
router.get('/', auth, getLocations);

module.exports = router;