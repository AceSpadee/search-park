// routes/index.js
const express = require('express');
const router = express.Router();

// Import API routes
const authRoutes = require('./api/auth');
const locationRoutes = require('./api/location');
const sessionRoutes = require('./api/session');
const movementRoutes = require('./api/movement');
const userRoutes = require('./api/users');

// Use the routes
router.use('/auth', authRoutes);
router.use('/location', locationRoutes);
router.use('/session', sessionRoutes);
router.use('/movement', movementRoutes);
router.use('/users', userRoutes);

module.exports = router;