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
    });

    await newSession.save();
    user.sessions.push(newSession._id);
    await user.save();

    res.status(201).json({ message: 'New session started', sessionId });
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

    // Basic validation
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

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

    session.movements.push(movement);
    await session.save();

    const savedMovement = session.movements[session.movements.length - 1];
    res.status(201).json(savedMovement);
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

module.exports = {
  startNewSession,
  saveMovement,
  stopSession,
  getMovements,
};