// server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/connection');
const cors = require('cors');
const app = express();
const apiRoutes = require('./routes');

// Connect to MongoDB
connectDB();

// Serve static files (if needed).
app.use(express.static('public'));

// CORS Configuration
const allowedOrigins = [process.env.RENDER_URL]; // Replace with your Render frontend URL

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
  console.log(`Server running on port ${PORT}`);
});