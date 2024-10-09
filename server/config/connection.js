const mongoose = require('mongoose');
const mongoURL = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL || 'mongodb://127.0.0.1:27017/searchParks');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);  // Exit process with failure
  }
};

module.exports = connectDB;