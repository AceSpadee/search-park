const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema for storing individual locations
const userLocationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  formattedTimestamp: {
    type: String,  // Store the formatted timestamp for each location
  },
  notes: {
    type: String,
    required: false,  // Optional field for location notes
  },
});

// Schema for individual movement points
const movementSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: String,  // Store the formatted timestamp for each movement point
  },
});

// Schema for grouping movements into sessions
const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,  // Ensure sessionId is unique for each session
  },
  startTime: {
    type: String,  // The start time of the session
    required: true,
  },
  endTime: {
    type: String,  // The end time of the session (optional, set when tracking stops)
  },
  movements: [movementSchema],  // Array of movement points during the session
});

// Main User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  locations: {
    type: [userLocationSchema],  // This ensures locations is always initialized as an array
    default: [],  // Automatically set to an empty array if not provided
  },
  sessions: [sessionSchema],  // Array to store session data if applicable
});

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
});

// Virtual property to combine firstName and lastName
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);
module.exports = User;