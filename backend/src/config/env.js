const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ats_analyzer',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  JWT_EXPIRES_IN: '24h',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
