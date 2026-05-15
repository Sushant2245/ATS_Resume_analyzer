const authService = require('../services/auth.service');
const { success, error } = require('../utils/responseHandler');

/**
 * POST /api/v1/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signup(name, email, password);
    return success(res, result, 'User registered successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return success(res, result, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login };
