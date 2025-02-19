const { Schema, model } = require('mongoose');
const moment = require('moment-timezone');

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
}, { versionKey: false });

// Pre-save hook to format the timestamp for movements
movementSchema.pre('save', function (next) {
  if (!this.formattedTimestamp) {
    this.formattedTimestamp = moment(this.timestamp)
      .tz('America/Los_Angeles')
      .format('MM/DD/YYYY HH:mm');
  }
  next();
});

// Schema for grouping movements into sessions
const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  formattedStartTime: {
    type: String,
  },
  endTime: {
    type: Date,
  },
  formattedEndTime: {
    type: String,
  },
  movements: [movementSchema],
  pathColor: {
    type: String,
    required: true,
  },
}, { versionKey: false });

// Pre-save hook to format startTime and endTime
sessionSchema.pre('save', function (next) {
  if (this.startTime && !this.formattedStartTime) {
    this.formattedStartTime = moment(this.startTime)
      .tz('America/Los_Angeles')
      .format('MM/DD/YYYY HH:mm');
  }

  if (this.endTime && !this.formattedEndTime) {
    this.formattedEndTime = moment(this.endTime)
      .tz('America/Los_Angeles')
      .format('MM/DD/YYYY HH:mm');
  }

  next();
});

const Session = model('Session', sessionSchema);
module.exports = Session;