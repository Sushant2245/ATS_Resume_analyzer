const express = require('express');
const { body } = require('express-validator');
const resumeController = require('../controllers/resume.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limit on analysis to prevent API cost exhaustion
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many analysis requests. Please try again later.',
  },
});

// All resume routes require authentication
router.use(authMiddleware);

// Upload a resume file
router.post('/upload', upload.single('file'), resumeController.upload);

// Analyze resume against JD
router.post(
  '/analyze',
  analyzeLimiter,
  [
    body('jobDescription')
      .trim()
      .notEmpty()
      .withMessage('Job description is required')
      .isLength({ min: 20 })
      .withMessage('Job description must be at least 20 characters'),
    body('extractedText')
      .trim()
      .notEmpty()
      .withMessage('Extracted text is required'),
  ],
  validate,
  resumeController.analyze
);

// Get analysis history
router.get('/history', resumeController.getHistory);

// Get single analysis report
router.get('/history/:id', resumeController.getHistoryById);

module.exports = router;
