const moment = require('moment-timezone');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const locationSchema = new mongoose.Schema({
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
    default: () => moment().utc().toDate(),
  },
  formattedTimestamp: {
    type: String,
  },
  notes: {
    type: String,
    required: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Add index for faster querying
  },
  userFullName: {
    type: String,
  }
});

// Pre-save hook to format the timestamp before saving
locationSchema.pre('save', function (next) {
  this.timestamp = new Date();
  this.formattedTimestamp = moment(this.timestamp).tz('America/Los_Angeles').format('MM/DD/YYYY HH:mm');
  next();
});

const Location = model('Location', locationSchema);
module.exports = Location;