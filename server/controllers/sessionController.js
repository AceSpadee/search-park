// controllers/sessionController.js
const Session = require('../models/Session');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Start a new tracking session
const startNewSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sessionId = uuidv4();

    const newSession = new Session({
      user: user._id,
      sessionId,
      startTime: new Date(),
      movements: [],
      pathColor: user.pathColor, // Use the user's pathColor
    });

    await newSession.save();
    user.sessions.push(newSession._id);
    await user.save();

    res.status(201).json({ message: 'New session started', sessionId, pathColor: user.pathColor });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save movement during a session
const saveMovement = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { lat, lng, notes } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Find the session by its sessionId
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const movement = {
      lat,
      lng,
      timestamp: new Date(),
      notes: notes || '',
    };

    // Add movement to the session's movements array
    session.movements.push(movement);
    await session.save();

    res.status(201).json({ message: 'Movement saved successfully', movement });
  } catch (error) {
    console.error('Error saving movement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Stop a session
const stopSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOneAndUpdate(
      { sessionId },
      { endTime: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.status(200).json({ message: 'Session stopped', session });
  } catch (error) {
    console.error('Error stopping session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get movements for a session or all movements for a user
const getMovements = async (req, res) => {
  console.log('getMovements function called');
  try {
    const { sessionId } = req.params;
    if (sessionId) {
      const session = await Session.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      return res.status(200).json(session.movements);
    }

    // Get all sessions for the authenticated user and extract movements
    const sessions = await Session.find({ user: req.user.id });
    const movements = sessions.flatMap(session => session.movements);

    // Optionally sort movements by timestamp
    movements.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.status(200).json(movements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all sessions with their movements for the authenticated user
const getSessions = async (req, res) => {
  console.log('getSessions function called');
  try {
    const userId = req.user.id; // The authenticated user's ID
    console.log('Fetching sessions for user:', userId);

    // Fetch all sessions for the authenticated user
    const sessions = await Session.find({ user: userId });

    if (!sessions || sessions.length === 0) {
      return res.status(200).json([]); // Return empty array if no sessions found
    }

    // Format each session with its movements
    const formattedSessions = sessions.map((session) => ({
      _id: session._id,
      sessionId: session.sessionId,
      startTime: session.startTime,
      formattedStartTime: session.formattedStartTime,
      endTime: session.endTime,
      formattedEndTime: session.formattedEndTime,
      movements: session.movements.map((movement) => ({
        lat: movement.lat,
        lng: movement.lng,
        timestamp: movement.timestamp,
        formattedTimestamp: movement.formattedTimestamp,
        notes: movement.notes,
      })),
      pathColor: session.pathColor, // Ensure the session's color is included
    }));

    console.log('Fetching sessions for user:', userId);
    console.log('Fetched sessions from DB:', sessions);
    console.log('Formatted sessions:', formattedSessions);

    // Return the formatted sessions grouped by session
    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllSessions = async (req, res) => {
  try {
    // This query fetches all sessions without filtering by user
    const sessions = await Session.find({}).populate('user', 'firstName lastName pathColor');
    
    if (!sessions || sessions.length === 0) {
      return res.status(200).json([]); // Return empty array if no sessions exist
    }

    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update the path color for a user
const updatePathColor = async (req, res) => {
  try {
    // Use req.user.id instead of req.user.userId
    const userId = req.user.id; 
    const { newColor } = req.body;

    if (!newColor) {
      return res.status(400).json({ message: 'New color is required' });
    }

    // Find the user and update their pathColor
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pathColor = newColor;
    await user.save();

    res.status(200).json({ message: 'Path color updated successfully', newColor });
  } catch (error) {
    console.error('Error updating path color:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  startNewSession,
  saveMovement,
  stopSession,
  getMovements,
  getSessions,
  getAllSessions,
  updatePathColor,
};