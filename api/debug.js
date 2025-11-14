export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Check environment variables (without exposing sensitive data)
  const envCheck = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    MONGODB_URI_LENGTH: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    MONGODB_URI_STARTS_WITH: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT_SET',
    
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_PROJECT_ID_VALUE: process.env.FIREBASE_PROJECT_ID || 'NOT_SET',
    
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
    
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_CLIENT_EMAIL_VALUE: process.env.FIREBASE_CLIENT_EMAIL || 'NOT_SET',
    
    FIREBASE_CLIENT_ID: !!process.env.FIREBASE_CLIENT_ID,
    FIREBASE_PRIVATE_KEY_ID: !!process.env.FIREBASE_PRIVATE_KEY_ID,
    
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
    
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    VERCEL: !!process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_SET'
  };

  // Test MongoDB connection
  let mongoTest = { connected: false, error: null };
  try {
    const mongoose = require('mongoose');
    if (process.env.MONGODB_URI) {
      const connection = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      mongoTest.connected = true;
      mongoTest.dbName = connection.connection.db.databaseName;
      await mongoose.disconnect();
    } else {
      mongoTest.error = 'MONGODB_URI not set';
    }
  } catch (error) {
    mongoTest.error = error.message;
  }

  // Test Firebase Admin
  let firebaseTest = { initialized: false, error: null };
  try {
    const admin = require('firebase-admin');
    
    if (!admin.apps.length) {
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        firebaseTest.initialized = true;
      } else {
        firebaseTest.error = 'Missing Firebase environment variables';
      }
    } else {
      firebaseTest.initialized = true;
      firebaseTest.alreadyInitialized = true;
    }
  } catch (error) {
    firebaseTest.error = error.message;
  }

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: envCheck,
    mongodb: mongoTest,
    firebase: firebaseTest,
    message: 'Debug information collected'
  });
}
