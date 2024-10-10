const { Schema, model } = require('mongoose');

const locationSchema = new Schema({
  lat: Number,
  lng: Number,
  timestamp: { 
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    required: false,
  },
  // Store user's full name directly
  userFullName: {
    type: String,
    required: true,
  },
});

// Add virtual property to format the timestamp
locationSchema.virtual('formattedTimestamp').get(function() {
  return new Date(this.timestamp).toLocaleString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
});

const Location = model('Location', locationSchema);

module.exports = Location;