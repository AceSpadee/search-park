const User = require('../models/User'); // Import User model

// Controller to save a new location for the user
const saveLocation = async (req, res) => {
  try {
    console.log('req.user:', req.user);  // Log the user attached to the request
    const user = await User.findById(req.user.id);  // Ensure user ID exists
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the new location to the user's locations array
    user.locations.push({
      lat: req.body.lat,
      lng: req.body.lng,
      timestamp: req.body.timestamp || new Date(),
      notes: req.body.notes || '',
    });

    await user.save();  // Save the updated user document
    res.status(200).json({ msg: 'Location saved successfully', locations: user.locations });
  } catch (err) {
    console.error('Error saving location:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Controller to get all locations for the authenticated user
const getLocations = async (req, res) => {
  try {
    // Find the user by the ID in the decoded JWT token
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return the user's stored locations
    res.status(200).json(user.locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export the controller functions so they can be used in routes
module.exports = {
  saveLocation,
  getLocations,
};