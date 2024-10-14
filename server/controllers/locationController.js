const User = require('../models/User'); // Import User model
const Location = require('../models/Location'); // Import Location model
const { v4: uuidv4 } = require('uuid');  // Import uuid for session IDs
const moment = require('moment-timezone');  // Import moment for time formatting
const mongoose = require('mongoose');

// Controller to save movement during tracking
const saveLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the location document
    const location = new Location({
      lat: req.body.lat,
      lng: req.body.lng,
      notes: req.body.notes || '',
      user: user._id,
      userFullName: user.fullName,
      timestamp: new Date(),
    });

    const savedLocation = await location.save();

    // Add the location to the user's static locations array
    user.locations.push({
      lat: savedLocation.lat,
      lng: savedLocation.lng,
      formattedTimestamp: savedLocation.formattedTimestamp,
      notes: savedLocation.notes,
    });

    await user.save();  // Save the user with the updated locations array

    res.status(201).json(savedLocation);  // Send back the saved location with _id
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

// controllers/locationController.js
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;  // Get the location ID from the URL
    const { newLat, newLng } = req.body;  // Get the new coordinates from the request body

    // Find the location by ID and update its coordinates
    const updatedLocation = await Location.findByIdAndUpdate(
      id,  // Use the location ID to find the location
      { lat: newLat, lng: newLng },  // Update latitude and longitude
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

// Controller to start a new tracking session
const startNewSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new session with a unique sessionId
    const sessionId = uuidv4();
    const startTime = moment().tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm');

    const newSession = {
      sessionId,
      startTime,
      movements: [],  // Initially empty, will be populated as movements are tracked
    };

    user.sessions.push(newSession);
    await user.save();

    res.status(201).json({ message: 'New session started', sessionId });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller to save movement during tracking
const saveMovement = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const locationData = {
      lat: req.body.lat,
      lng: req.body.lng,
      timestamp: new Date(),
      formattedTimestamp: moment().tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm'),
      notes: req.body.notes || '',
      _id: new mongoose.Types.ObjectId(),  // Explicitly assign an _id to the movement
    };

    let updatedSession;

    // Add movement to the current session or create a new session
    if (user.sessions && user.sessions.length > 0) {
      updatedSession = user.sessions[user.sessions.length - 1];  // Get the latest session
      updatedSession.movements.push(locationData);  // Add the new movement
    } else {
      const newSession = {
        sessionId: uuidv4(),
        startTime: moment().tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm'),
        movements: [locationData],
      };
      user.sessions.push(newSession);
      updatedSession = newSession;  // Set this as the updated session
    }

    // Use findOneAndUpdate to prevent version conflicts
    await User.findOneAndUpdate(
      { _id: req.user.id },  // Find the user by their ID
      { $set: { sessions: user.sessions } },  // Set the updated sessions array
      { new: true, runValidators: true }  // Return the updated document
    );

    res.status(201).json(locationData);  // Respond with the saved movement data
  } catch (error) {
    console.error('Error saving movement:', error);  // Log the full error
    res.status(500).json({ message: 'Server error', error: error.message });  // Respond with the error details
  }
};

// Controller to stop a session
const stopSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { sessionId } = req.body;
    const endTime = moment().tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm');

    // Find the active session and set the endTime
    const session = user.sessions.find((s) => s.sessionId === sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.endTime = endTime;  // Set the end time when tracking stops

    await user.save();

    res.status(200).json({ message: 'Session stopped', session });
  } catch (error) {
    console.error('Error stopping session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export the controller functions so they can be used in routes
module.exports = {
  saveLocation,
  getLocations,
  updateLocation,
  deleteLocation,
  startNewSession,
  saveMovement,
  stopSession,
};