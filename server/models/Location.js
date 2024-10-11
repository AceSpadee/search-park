const moment = require('moment');
const { Schema, model } = require('mongoose');

const locationSchema = new Schema({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  timestamp: { 
    type: Date,
    default: Date.now,  // Store the original timestamp as a Date object
  },
  formattedTimestamp: {
    type: String,  // Store the formatted timestamp directly in the database
  },
  notes: {
    type: String,
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userFullName: {
    type: String, // Store the user's full name directly in the Location document
  }
});

// Pre-save hook to format the timestamp before saving
locationSchema.pre('save', function (next) {
  // Format the timestamp and store it in the formattedTimestamp field
  this.formattedTimestamp = moment(this.timestamp).format('MM/DD/YYYY HH:mm');
  next();
});

const Location = model('Location', locationSchema);
module.exports = Location;