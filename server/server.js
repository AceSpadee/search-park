// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/connection');
const cors = require('cors');
const app = express();
const apiRoutes = require('./routes');

// Determine if we are in production mode
const isProduction = process.env.NODE_ENV === 'production';

// MongoDB connection based on environment
const MONGODB_URI = isProduction ? process.env.PROD_MONGODB_URI : process.env.MONGODB_URI;

// Connect to MongoDB
connectDB(MONGODB_URI);

// Serve static files (if needed).
app.use(express.static('public'));

// CORS Configuration
const CLIENT_URL = isProduction ? process.env.PROD_CLIENT_URL : process.env.CLIENT_URL;
const allowedOrigins = [CLIENT_URL]; // Replace with your Render frontend URL

// Middleware
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Enable credentials (if you're using cookies or JWTs with credentials)
}));

// Use the API routes under the /api prefix
app.use('/api', apiRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})