console.log('🚀 [STARTUP] Starting backend server...');
console.log('📍 [STARTUP] Current directory:', __dirname);

require('dotenv').config();
console.log('✅ [STARTUP] .env file loaded');
console.log('📋 [STARTUP] Environment variables:');
console.log('  - PORT:', process.env.PORT || '8000');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('  - CORS_ORIGIN:', process.env.CORS_ORIGIN || 'http://localhost:3000');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

console.log('✅ [STARTUP] Dependencies loaded');

let connectDB;
try {
  connectDB = require('./config/database');
  console.log('✅ [STARTUP] Database config loaded');
} catch (error) {
  console.error('❌ [STARTUP] Failed to load database config:', error.message);
  process.exit(1);
}

// Initialize Firebase Admin
console.log('🔥 [STARTUP] Initializing Firebase Admin...');
const admin = require('firebase-admin');
let serviceAccount;
try {
  serviceAccount = require('./firebase-admin-key.json');
  console.log('✅ [STARTUP] Firebase key loaded');
} catch (error) {
  console.error('❌ [STARTUP] Failed to load firebase-admin-key.json:', error.message);
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ [STARTUP] Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ [STARTUP] Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

// Import routes
console.log('📦 [STARTUP] Loading routes...');
let signRoutes, progressRoutes, authRoutes, postRoutes, storyRoutes;
try {
  signRoutes = require('./routes/signRoutes');
  progressRoutes = require('./routes/progressRoutes');
  authRoutes = require('./routes/authRoutes');
  postRoutes = require('./routes/postRoutes');
  storyRoutes = require('./routes/storyRoutes');
  console.log('✅ [STARTUP] All routes loaded successfully');
} catch (error) {
  console.error('❌ [STARTUP] Failed to load routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Initialize Express app
console.log('🔧 [STARTUP] Initializing Express app...');
const app = express();
console.log('✅ [STARTUP] Express app created');

// Connect to MongoDB
console.log('🗄️  [STARTUP] Connecting to MongoDB...');
connectDB().then(() => {
  console.log('✅ [STARTUP] MongoDB connected');
}).catch((error) => {
  console.error('❌ [STARTUP] MongoDB connection failed:', error.message);
  console.error('Stack:', error.stack);
});

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
console.log('🎯 [STARTUP] Attempting to start server on port:', PORT);

const server = app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ 🚀 SERVER STARTED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ [SERVER ERROR] Server failed to start:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️  Port ${PORT} is already in use. Try a different port.`);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ [UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [UNHANDLED REJECTION]', reason);
});

module.exports = app;
