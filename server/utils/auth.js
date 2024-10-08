const jwt = require('jsonwebtoken');

// Middleware function to verify the JWT token in incoming requests
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Decode the token
    console.log('Decoded payload:', decoded);  // Log the decoded payload to inspect it
    
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: 'Token is invalid, no user ID present' });
    }

    req.user = decoded.user;  // Attach the decoded user object to req.user
    next();  // Move to the next middleware or route handler
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Export the middleware function so it can be used in routes that require authentication
module.exports = auth;