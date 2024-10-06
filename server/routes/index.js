// routes/index.js
const express = require('express');
const router = express.Router();

// Import API routes
const authRoutes = require('./api/auth');
const locationRoutes = require('./api/location');
const userRoutes = require('./api/users');

// Use the routes
router.use('/auth', authRoutes);        // Maps to /api/auth/*
router.use('/location', locationRoutes);  // Maps to /api/location/*
router.use('/users', userRoutes);  // All user-related routes (e.g., profile) are under /api/users

module.exports = router;