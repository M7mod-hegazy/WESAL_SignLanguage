const mongoose = require('mongoose');

const connectDB = async () => {
  const startTime = Date.now();
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/signlanguage';
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('🔗 Connection string:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
    
    // Set connection timeout with better options
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Reduced to 10s for faster failure
      socketTimeoutMS: 45000, // Reduced to 45s
      connectTimeoutMS: 10000, // Reduced to 10s
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true
    });

    const connectionTime = Date.now() - startTime;
    console.log(`✅ MongoDB connected successfully in ${connectionTime}ms`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌍 Host: ${mongoose.connection.host}`);
    console.log(`⚡ Connection state: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Server will continue without database (limited functionality)');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check MongoDB Atlas Network Access (allow 0.0.0.0/0)');
    console.error('   2. Verify internet connection');
    console.error('   3. Check .env file has correct MONGODB_URI');
    // Don't exit - let server run without DB
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

module.exports = connectDB;
