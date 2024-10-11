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

    // Create a new location document
    const location = new Location({
      lat: req.body.lat,
      lng: req.body.lng,
      notes: req.body.notes || '',
      user: user._id,
      userFullName: user.fullName,  // Assuming fullName is defined in the User model
      timestamp: moment().utc().toDate(),  // Store the current timestamp in UTC
    });

    await location.save();

    // Push the location's _id into the user's locations array
    user.locations.push({
      _id: location._id,  // Store the location's _id
      lat: req.body.lat,
      lng: req.body.lng,
      formattedTimestamp: location.formattedTimestamp,  // Use the pre-saved formatted timestamp
    });

    await user.save();  // Save the updated user document

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

    // Return the locations as is since they already contain the formattedTimestamp
    res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const updateLocation = async (req, res) => {
  try {
    const { originalLat, originalLng, newLat, newLng } = req.body;  // Get lat/lng from the request body

    // Find the location by original lat and lng and update it with new coordinates
    const updatedLocation = await Location.findOneAndUpdate(
      { lat: originalLat, lng: originalLng },  // Find the location by its original coordinates
      { lat: newLat, lng: newLng },  // Update with new coordinates
      { new: true }  // Return the updated document
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location updated successfully', updatedLocation });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller to delete a location by lat/lng
const deleteLocation = async (req, res) => {
  try {
    const { locationId } = req.body; // Get locationId from the request body

    // Find the location by its _id and delete it
    const deletedLocation = await Location.findByIdAndDelete(locationId);

    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Remove the location from the User's locations array using the location's _id
    await User.updateMany(
      { 'locations._id': locationId },  // Match the location's _id in the user's locations array
      { $pull: { locations: { _id: locationId } } }  // Pull the matching location from locations array
    );

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export the controller functions so they can be used in routes
module.exports = {
  saveLocation,
  getLocations,
  updateLocation,
  deleteLocation,
};