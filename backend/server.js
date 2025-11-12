require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');

// Initialize Firebase Admin
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('🔥 Firebase Admin initialized');

// Import routes
const signRoutes = require('./routes/signRoutes');
const progressRoutes = require('./routes/progressRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const storyRoutes = require('./routes/storyRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Debug middleware - Log ALL incoming requests
app.use((req, res, next) => {
  console.log(`🌐 Incoming: ${req.method} ${req.url}`);
  next();
});

// API Routes
console.log('📍 Mounting /api/auth routes...');
app.use('/api/auth', authRoutes);
console.log('✅ /api/auth routes mounted');
app.use('/api/signs', signRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/shared-posts', require('./routes/sharedPostRoutes'));
app.use('/api/simulations', require('./routes/simulationRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sign Language API is running',
    timestamp: new Date().toISOString(),
    serverRestarted: 'YES_AT_5_30PM' // Change this each restart to verify
  });
});

// TEMPORARY TEST - Direct increment route
const User = require('./models/User');
app.post('/api/auth/increment-challenges-direct', async (req, res) => {
  try {
    console.log('🔥 DIRECT ROUTE HIT!');
    // For now, just return success
    res.json({ success: true, message: 'Direct route works!', challengesCompleted: 1 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🤟 Sign Language Learning Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      signs: '/api/signs',
      progress: '/api/progress',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
