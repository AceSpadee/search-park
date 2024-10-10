const User = require('../models/User'); // Import User model
const Location = require('../models/Location'); // Import Location model

// Controller to save a new location for the user
// Controller to save a new location for the user
const saveLocation = async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Concatenate first and last name to create full name
    const userFullName = `${user.firstName} ${user.lastName}`;

    // Create and save the new location with user's full name
    const location = new Location({
      lat: req.body.lat,
      lng: req.body.lng,
      timestamp: req.body.timestamp || new Date(),
      notes: req.body.notes || '',
      userFullName: userFullName,  // Store the full name in the location
    });

    await location.save();
    res.status(201).json({ message: 'Location saved successfully', location });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller to get all locations for the authenticated user
const getLocations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('locations');  // Populate the user's locations

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the populated locations
    res.status(200).json(user.locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Export the controller functions so they can be used in routes
module.exports = {
  saveLocation,
  getLocations,
};