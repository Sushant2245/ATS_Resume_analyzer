const Resume = require('../models/Resume');
const parserService = require('../services/parser.service');
const aiService = require('../services/ai.service');
const { success, error } = require('../utils/responseHandler');

/**
 * POST /api/v1/resume/upload
 * Uploads a file, extracts text, returns extracted text
 */
const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded. Please upload a PDF or DOCX file.', 400);
    }

    const extractedText = await parserService.extractText(
      req.file.path,
      req.file.mimetype
    );

    if (!extractedText || extractedText.length < 50) {
      return error(res, 'Could not extract sufficient text from the file. Please try a different file.', 400);
    }

    return success(res, {
      fileId: req.file.filename,
      fileName: req.file.originalname,
      extractedText,
    }, 'File uploaded and text extracted successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/resume/analyze
 * Runs AI analysis on extracted text vs job description
 */
const analyze = async (req, res, next) => {
  try {
    const { jobDescription, extractedText, fileName } = req.body;

    if (!jobDescription || !extractedText) {
      return error(res, 'Job description and extracted text are required.', 400);
    }

    const analysisResult = await aiService.analyzeResume(
      extractedText,
      jobDescription
    );

    // Save to database
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: fileName || 'Untitled Resume',
      jobDescription,
      extractedText,
      atsScore: analysisResult.atsScore,
      analysisReport: {
        missingKeywords: analysisResult.missingKeywords,
        matchPercentage: analysisResult.matchPercentage,
        skillMatch: analysisResult.skillMatch,
        formatSuggestions: analysisResult.formatSuggestions,
        recommendations: analysisResult.recommendations,
      },
    });

    return success(res, {
      id: resume._id,
      atsScore: analysisResult.atsScore,
      missingKeywords: analysisResult.missingKeywords,
      matchPercentage: analysisResult.matchPercentage,
      skillMatch: analysisResult.skillMatch,
      formatSuggestions: analysisResult.formatSuggestions,
      recommendations: analysisResult.recommendations,
    }, 'Analysis complete.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/resume/history
 * Returns analysis history for the authenticated user
 */
const getHistory = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('fileName jobDescription atsScore createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const history = resumes.map((r) => ({
      id: r._id,
      fileName: r.fileName,
      jobDescriptionSnippet: r.jobDescription.substring(0, 100) + '...',
      atsScore: r.atsScore,
      createdAt: r.createdAt,
    }));

    return success(res, history, 'History retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/resume/history/:id
 * Returns a single detailed analysis report
 */
const getHistoryById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!resume) {
      return error(res, 'Analysis report not found.', 404);
    }

    return success(res, resume, 'Report retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, analyze, getHistory, getHistoryById };
