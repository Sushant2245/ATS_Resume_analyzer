const { validationResult } = require('express-validator');
const { error } = require('../utils/responseHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => err.msg);
    return error(res, extractedErrors[0], 400, extractedErrors);
  }
  next();
};

module.exports = validate;
