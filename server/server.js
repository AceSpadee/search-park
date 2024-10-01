// server.js
// fix this later =================================================================
const express = require('express');
const connectDB = require('./config/connection');  // Import the connection function
const drawingRoutes = require('./routes/drawingRoutes');
const cors = require('cors');

const app = express();

// Connect to MongoDB
connectDB();  // Call the function to connect

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/drawings', drawingRoutes);  // Use the drawing routes

// Serve static files (if needed)
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));