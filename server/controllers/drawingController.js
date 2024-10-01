const Drawing = require('../models/Drawing');

// Create a new drawing
exports.createDrawing = async (req, res) => {
  const { userId, majorLocation, drawings } = req.body;
  try {
    const newDrawing = new Drawing({
      user: userId,
      majorLocation,
      drawings
    });
    await newDrawing.save();
    res.status(201).json({ message: 'Drawing saved successfully', drawing: newDrawing });
  } catch (err) {
    res.status(500).json({ error: 'Error saving drawing' });
  }
};

// Get all drawings for a user
exports.getDrawings = async (req, res) => {
  const { userId } = req.params;
  try {
    const drawings = await Drawing.find({ user: userId });
    res.status(200).json(drawings);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving drawings' });
  }
};