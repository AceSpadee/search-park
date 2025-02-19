const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Function to generate an access token
const generateAccessToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Function to generate a refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Function to generate a unique color for the user
const generateUniqueColor = async () => {
  let uniqueColor;
  let isUnique = false;

  while (!isUnique) {
    uniqueColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Generate a random color
    const existingUser = await User.findOne({ pathColor: uniqueColor }); // Check if color already exists
    isUnique = !existingUser; // Repeat until a unique color is found
  }

  return uniqueColor;
};

const register = async (req, res) => {
  try {
    const normalizedUserName = req.body.userName.trim().toLowerCase();
    const existingUser = await User.findOne({ userName: normalizedUserName });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Generate a unique color for the user
    const pathColor = await generateUniqueColor();

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: normalizedUserName,
      password: req.body.password,
      pathColor, // Assign the unique color to the user
    });

    await user.save();

    // Generate tokens after registration
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save the refresh token to the user's database record
    user.refreshToken = refreshToken;
    await user.save();

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ message: 'User registered successfully', accessToken, pathColor });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Controller function for logging in a user
const login = async (req, res) => {
  try {
    const user = await User.findOne({ userName: new RegExp('^' + req.body.userName + '$', 'i') });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(req.body.password.trim(), user.password.trim());

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens after successful login
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save the refresh token to the user's database record
    user.refreshToken = refreshToken;
    await user.save();

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Refresh token route
const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate a new access and refresh token
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Save the new refresh token in the database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Update the refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// Logout function to clear the refresh token
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.refreshToken = null; // Clear the refresh token from the database
      await user.save();
    }

    res.clearCookie('refreshToken'); // Clear the refresh token cookie
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Export the functions so they can be used in routes
module.exports = {
  register,
  login,
  refresh,
  logout,
};