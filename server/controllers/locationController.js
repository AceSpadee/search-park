const User = require('../models/User'); // Import User model
const Location = require('../models/Location'); // Import Location model
const moment = require('moment');

// Controller to save a new location for the user
const saveLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const location = new Location({
      lat: req.body.lat,
      lng: req.body.lng,
      notes: req.body.notes || '',
      user: user._id,  // Store the user's ObjectId in the Location document
      userFullName: user.fullName, // Store the user's full name directly
      formattedTimestamp: moment().format('MM/DD/YYYY HH:mm'), // Manually format the timestamp before saving
    });

    await location.save();

    user.locations.push({
      lat: req.body.lat,
      lng: req.body.lng,
      formattedTimestamp: moment().format('MM/DD/YYYY HH:mm')  // Store formatted timestamp in user's locations
    });

    await user.save(); // Save the updated user document

    res.status(201).json({ message: 'Location saved successfully', location });
  } catch (error) {
    console.error('Error saving location:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller to get all locations for the authenticated user
const getLocations = async (req, res) => {
  try {
    // Find all locations for the user
    const locations = await Location.find({ user: req.user.id })
      .populate('user', 'fullName');

    // Add formattedTimestamp manually to each location
    const formattedLocations = locations.map(location => ({
      ...location.toObject(),
      formattedTimestamp: moment(location.timestamp).format('MM/DD/YYYY HH:mm')
    }));

    res.status(200).json(formattedLocations);
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