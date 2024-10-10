const mongoose = require('mongoose');
const mongoURL = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);  // Exit process with failure
  }
};

module.exports = connectDB;