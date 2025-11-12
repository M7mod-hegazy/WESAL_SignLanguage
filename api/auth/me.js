const mongoose = require('mongoose');
const User = require('../../backend/models/User');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = connection;
  return connection;
}

// Firebase Admin setup
const admin = require('firebase-admin');

if (!admin.apps.length) {
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
