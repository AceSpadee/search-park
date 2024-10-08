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

// Middleware
app.use(express.json());
app.use(cors());

// Use the API routes under the /api prefix
app.use('/api', apiRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});