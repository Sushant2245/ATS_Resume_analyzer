const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { PORT, FRONTEND_URL } = require('./config/env');
const errorMiddleware = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');

const app = express();

// --------------- Middleware ---------------
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --------------- Routes ---------------
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'ATS Resume Analyzer API is running.' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resume', resumeRoutes);

// --------------- Error Handler ---------------
app.use(errorMiddleware);

// --------------- Start Server ---------------
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.success(`Server running on port ${PORT}`);
    logger.info(`API Base URL: http://localhost:${PORT}/api/v1`);
  });
};

startServer();

module.exports = app;
