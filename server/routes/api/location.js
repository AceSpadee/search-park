// routes/api/location.js
const express = require('express');
const { saveLocation, getLocations, updateLocation, deleteLocation } = require('../../controllers/locationController');
const auth = require('../../utils/auth');
const router = express.Router();

// POST request to save a new location
router.post('/', auth, saveLocation);

// GET request to fetch all locations for the user
router.get('/', auth, getLocations);

// Define the route to update a location
router.put('/:id', auth, updateLocation);

// Define the route to delete a location
router.delete('/', auth, deleteLocation); 

module.exports = router;