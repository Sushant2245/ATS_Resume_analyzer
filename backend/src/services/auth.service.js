const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user
 */
const signup = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

/**
 * Authenticate user
 */
const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

module.exports = { signup, login };
