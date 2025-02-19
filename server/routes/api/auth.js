// routes/api/auth.js
const express = require('express');
const { register, login, refresh, logout } = require('../../controllers/authController');
const auth = require('../../utils/auth'); // Assuming you have an auth middleware
const router = express.Router();

// Define routes
router.post('/register', register); // User registration
router.post('/login', login);       // User login
router.post('/refresh', refresh);  // Refresh access token using refresh token
router.post('/logout', auth, logout); // Logout (requires authentication)

module.exports = router;