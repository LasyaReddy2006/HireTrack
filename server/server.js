const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// ====================================================================
// Middlewares
// ====================================================================
// Enable Cross-Origin Resource Sharing (CORS) so React frontend can call this API
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logger for easy debugging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ====================================================================
// Health Check Endpoint
// ====================================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'HireTrack API',
    timestamp: new Date().toISOString()
  });
});

// ====================================================================
// API Routes
// ====================================================================
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const jobRoutes = require('./routes/jobRoutes');
const profileRoutes = require('./routes/profileRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profile', profileRoutes);

// ====================================================================
// 404 Route Not Found Handler
// ====================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ====================================================================
// Global Error Handler Middleware
// ====================================================================
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

// ====================================================================
// Start Server and Test Database Connectivity
// ====================================================================
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 HireTrack Backend Server running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);

  // Verify connection to MySQL
  await testConnection();
});
