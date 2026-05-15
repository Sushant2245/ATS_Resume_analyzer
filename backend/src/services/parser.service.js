const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const logger = require('../utils/logger');

/**
 * Extract text from uploaded file based on its mime type
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted raw text
 */
const extractText = async (filePath, mimeType) => {
  try {
    let text = '';

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      throw new Error('Unsupported file format.');
    }

    // Clean up the temp file
    cleanupFile(filePath);

    return text.trim();
  } catch (error) {
    cleanupFile(filePath);
    logger.error(`Text extraction failed: ${error.message}`);
    throw new Error('Failed to extract text from the uploaded file.');
  }
};

/**
 * Remove temporary uploaded file
 */
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.warn(`Failed to clean up file: ${filePath}`);
  }
};

module.exports = { extractText };
