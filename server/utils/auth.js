const jwt = require('jsonwebtoken');

// Middleware function to verify the JWT access token
const auth = (req, res, next) => {
  console.log('Headers:', req.headers);

  // Extract token from Authorization header or x-auth-token
  let token = req.headers['authorization']?.split(' ')[1]; // Extract from "Authorization: Bearer <token>"
  if (!token) {
    token = req.headers['x-auth-token']; // Fallback to x-auth-token
  }

  console.log('Extracted token:', token); // Log the token

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    console.log('Decoded token:', decoded); // Log the decoded token
    req.user = decoded.user; // Attach user info to request
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expired. Please refresh your session.' });
    }
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;