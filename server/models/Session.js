const { Schema, model } = require('mongoose');

// Schema for individual movement points
const movementSchema = new Schema({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,  // Use Date type for timestamps
    default: Date.now,
  },
  notes: {
    type: String,
    required: false,
  },
});

// Schema for grouping movements into sessions
const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,  // Ensure sessionId is unique for each session
  },
  startTime: {
    type: Date,  // The start time of the session
    required: true,
  },
  endTime: {
    type: Date,  // The end time of the session (optional, set when tracking stops)
  },
  movements: [movementSchema],  // Array of movement points during the session
});

const Session = model('Session', sessionSchema);
module.exports = Session;