const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    analysisReport: {
      missingKeywords: [String],
      matchPercentage: {
        type: Number,
        default: 0,
      },
      skillMatch: {
        found: [String],
        missing: [String],
      },
      formatSuggestions: [String],
      recommendations: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
