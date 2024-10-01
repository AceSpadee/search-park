// testing this. change later
const mongoose = require('mongoose');

const drawingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,  // Reference to the User model
    ref: 'User',
    required: true
  },
  majorLocation: {
    name: { type: String, required: true },  // e.g., "Home", "Work"
    coordinates: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true }
    }
  },
  drawings: [
    {
      type: { type: String, enum: ['polygon', 'polyline'], required: true },
      coordinates: { type: Array, required: true }  // Stores an array of lat/lon coordinates
    }
  ],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Drawing', drawingSchema);