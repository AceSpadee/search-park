// might remove this later
// routes/api/users.js
const express = require('express');
const router = express.Router();

// Example user-related routes
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile route' });
});

module.exports = router;