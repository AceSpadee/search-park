// routes/api/location.js
const express = require('express');
const { saveLocation, getLocations, updateLocation, deleteLocation } = require('../../controllers/locationController');
const auth = require('../../utils/auth');
const router = express.Router();

// Define the routes with callback functions
router.post('/', auth, saveLocation);
router.get('/', auth, getLocations);
router.put('/:id', auth, updateLocation);
router.delete('/:id', auth, deleteLocation);

module.exports = router;