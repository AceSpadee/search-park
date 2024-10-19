// Import necessary libraries and modules
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Controller function for registering a new user
const register = async (req, res) => {
  try {
    // Normalize the username to lowercase to avoid case sensitivity issues
    const normalizedUserName = req.body.userName.trim().toLowerCase();

    // Check if the user with the same userName already exists
    const existingUser = await User.findOne({ userName: normalizedUserName });

    if (existingUser) {
      // If userName already exists, respond with a 400 Bad Request and a message
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user instance using the User model
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: normalizedUserName,
      password: req.body.password, // Will be hashed in the pre-save hook
    });

    // Save the new user to the database
    await user.save();

    // After saving, generate a JWT token to log the user in immediately
    const payload = {
      user: {
        id: user._id,  // Include the user's id in the token payload
      },
    };

    // Generate the JWT token with a 1-hour expiration time
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Respond with the token and a success message
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    // Handle MongoDB duplicate key error (e.g., for unique fields like userName)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // If it's any other error, log the error and respond with status code 500 (Server Error)
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Controller function for logging in a user
const login = async (req, res) => {
  try {
    // Find the user by their userName (case-insensitive search)
    const user = await User.findOne({ userName: new RegExp('^' + req.body.userName + '$', 'i') });
    
    // If no user is found, return a 404 (Not Found) response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the plain-text password from the request with the hashed password from the database
    const isMatch = await bcrypt.compare(req.body.password.trim(), user.password.trim());

    // If passwords don't match, return a 401 (Unauthorized) response
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If the password is valid, generate a JWT token
    const payload = { 
      user: { 
        id: user._id  // Ensure the token payload contains user.id inside "user"
      }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });  // Token expires in 1 hour

    // Respond with the generated token and status code 200 (OK)
    res.status(200).json({ token });
  } catch (error) {
    // If there's any error during login, log the error and respond with status code 500
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Export the register and login functions so they can be used in route handlers
module.exports = {
  register,
  login,
};