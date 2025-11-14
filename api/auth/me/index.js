const mongoose = require('mongoose');

// Simple User schema for serverless
const userSchema = new mongoose.Schema({
  firebaseUid: String,
  email: String,
  displayName: String,
  photoURL: String,
  coins: { type: Number, default: 100 },
  gender: { type: String, default: 'male' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
  });

  return mongoose.connection;
}

// Firebase Admin setup
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    console.log('🔥 Initializing Firebase Admin in auth/me...');
    
    // Handle private key formatting properly
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    console.log('🔍 Private key exists:', !!privateKey);
    console.log('🔍 Private key length:', privateKey?.length || 0);
    console.log('🔍 Private key preview:', privateKey?.substring(0, 50) + '...');
    
    if (privateKey) {
      // Handle different possible formats
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Remove any extra quotes that might be added by environment variables
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      
      // Ensure proper PEM format
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        // If it's just the key content without headers
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
      
      console.log('🔍 Formatted private key preview:', privateKey.substring(0, 50) + '...');
    } else {
      console.error('❌ FIREBASE_PRIVATE_KEY environment variable is missing');
    }
    
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin initialized successfully in auth/me');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error in auth/me:', error.message);
  }
} else {
  console.log('🔄 Firebase Admin already initialized in auth/me');
}

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

  try {
    // Authenticate user
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Check if Firebase Admin is available
    if (!admin.apps.length) {
      console.log('⚠️ Firebase Admin not available, returning basic user info');
      return res.status(200).json({
        success: true,
        user: {
          uid: 'anonymous',
          email: 'user@example.com',
          displayName: 'مستخدم',
          photoURL: '/pages/TeamPage/profile.png',
          coins: 100,
          gender: 'male'
        },
        _debug: { firebaseAdmin: false, fallback: true }
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Connect to database
    await connectToDatabase();

    // Try to get user from MongoDB
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // Return Firebase user data as fallback
      return res.status(200).json({
        success: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
          coins: 100,
          gender: 'male'
        }
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        uid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        coins: user.coins || 100,
        gender: user.gender || 'male'
      }
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
