const mongoose = require('mongoose');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const testResults = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      mongodbUriExists: !!process.env.MONGODB_URI,
      mongodbUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      mongodbUriPreview: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'NOT_SET'
    },
    connectionTest: {
      attempted: false,
      success: false,
      error: null,
      connectionTime: null,
      connectionState: null,
      databaseName: null
    }
  };

  if (process.env.MONGODB_URI) {
    try {
      console.log('🧪 Testing MongoDB connection (index.js route)...');
      const connectionStart = Date.now();

      testResults.connectionTest.attempted = true;

      const connection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 1
      });

      testResults.connectionTest.connectionTime = Date.now() - connectionStart;
      testResults.connectionTest.success = true;
      testResults.connectionTest.connectionState = mongoose.connection.readyState;
      testResults.connectionTest.databaseName = mongoose.connection.db?.databaseName;

      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        testResults.connectionTest.collections = collections.map(c => c.name);
        testResults.connectionTest.collectionCount = collections.length;
      } catch (queryError) {
        testResults.connectionTest.queryError = queryError.message;
      }

      await mongoose.disconnect();
      console.log('✅ MongoDB connection test successful (index.js route)');
    } catch (error) {
      testResults.connectionTest.success = false;
      testResults.connectionTest.error = {
        message: error.message,
        name: error.name,
        code: error.code,
        codeName: error.codeName
      };
      console.error('❌ MongoDB connection test failed (index.js route):', error.message);
    }
  }

  return res.status(200).json({
    success: true,
    testResults,
    message: 'MongoDB connection test completed'
  });
};
