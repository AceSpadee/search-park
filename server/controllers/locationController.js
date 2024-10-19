// controllers/locationController.js
const Location = require('../models/Location');
const User = require('../models/User');

// Save a new location
const saveLocation = async (req, res) => {
  try {
    const { lat, lng, notes } = req.body;

    // Basic validation
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Find the user by ID from the request
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the new location
    const location = new Location({
      lat,
      lng,
      notes: notes || '',
      user: user._id,
      userFullName: user.fullName,
      timestamp: new Date(),
    });

    // Save the location to the database
    const savedLocation = await location.save();

    // Update the user's locations array to include the new location
    user.locations.push(savedLocation._id);
    await user.save();

    // Respond with the saved location
    res.status(201).json(savedLocation);
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all locations for the authenticated user
const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ user: req.user.id }).populate('user', 'fullName');
    res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a location
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { newLat, newLng } = req.body;

    // Basic validation
    if (!newLat || !newLng) {
      return res.status(400).json({ message: 'New latitude and longitude are required' });
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { lat: newLat, lng: newLng },
      { new: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location updated successfully', updatedLocation });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a location
const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLocation = await Location.findByIdAndDelete(id);
    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  saveLocation,
  getLocations,
  updateLocation,
  deleteLocation,
};