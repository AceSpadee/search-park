const User = require('../models/User'); // Import User model
const Location = require('../models/Location'); // Import Location model

// Controller to save a new location for the user
const saveLocation = async (req, res) => {
  try {
    console.log('req.user:', req.user);  // Log the user attached to the request
    const user = await User.findById(req.user.id);  // Ensure user ID exists
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new Location document
    const newLocation = new Location({
      lat: req.body.lat,
      lng: req.body.lng,
      timestamp: req.body.timestamp || new Date(),
      notes: req.body.notes || '',
      user: user._id,  // Link the location to the user
    });

    // Save the location to the database
    const savedLocation = await newLocation.save();

    // Push the new location's ID into the user's locations array
    user.locations.push(savedLocation._id);
    await user.save();  // Save the updated user document

    res.status(200).json({ msg: 'Location saved successfully', location: savedLocation });
  } catch (err) {
    console.error('Error saving location:', err);
    res.status(500).json({ msg: 'Server error' });
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