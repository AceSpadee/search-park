// Import necessary libraries and modules
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Controller function for registering a new user
const register = async (req, res) => {
  try {
    // Check if the user with the same userName already exists
    const existingUser = await User.findOne({ userName: req.body.userName });

    if (existingUser) {
      // If userName already exists, respond with a 400 Bad Request and a message
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user instance using the User model
    const user = new User({
      firstName: req.body.firstName,   // Assign first name from the request
      lastName: req.body.lastName,     // Assign last name from the request
      userName: req.body.userName,     // Assing user name from the request
      password: req.body.password,     // Assign plain password (hashed in the pre-save hook)
    });

    // Save the new user to the database
    await user.save();

    // Respond with a success message and status code 201 (Created)
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Handle MongoDB duplicate key error (e.g., for unique fields like userName)
    if (error.code === 11000) {
      // Respond with a 400 Bad Request and a message
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