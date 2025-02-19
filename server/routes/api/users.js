const express = require('express');
const { getUserProfile } = require('../../controllers/userController'); // Controller to handle the logic
const auth = require('../../utils/auth'); // Middleware to authenticate requests
const router = express.Router();

// Route to fetch the logged-in user's profile
router.get('/profile', auth, getUserProfile);

module.exports = router;