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
  try {
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
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (authError) {
      console.error('Token verification error:', authError);
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    // Try to connect to database
    let dbConnection;
    try {
      dbConnection = await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Continue without database - return Firebase user data
    }

    // If database is available, try to find/create user
    if (dbConnection) {
      try {
        let user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
          // Create new user
          user = new User({
            firebaseUid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name || req.body.displayName,
            photoURL: decodedToken.picture || req.body.photoURL,
            coins: 100,
            gender: 'male',
            provider: 'google'
          });
          await user.save();
        } else {
          // Update existing user
          if (req.body.displayName) user.displayName = req.body.displayName;
          if (req.body.photoURL) user.photoURL = req.body.photoURL;
          if (req.body.email) user.email = req.body.email;
          await user.save();
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
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        // Fall through to Firebase-only response
      }
    }

    // Fallback: Return Firebase user data without database
    return res.status(200).json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || req.body.displayName || 'مستخدم',
        photoURL: decodedToken.picture || req.body.photoURL || '/pages/TeamPage/profile.png',
        coins: 100,
        gender: 'male'
      },
      _debug: {
        source: 'firebase_fallback',
        dbConnected: !!dbConnection
      }
    });

  } catch (error) {
    console.error('Auth verify error:', error);
    return res.status(200).json({ 
      success: true, 
      user: {
        uid: 'demo_user',
        email: 'demo@example.com',
        displayName: 'مستخدم تجريبي',
        photoURL: '/pages/TeamPage/profile.png',
        coins: 100,
        gender: 'male'
      },
      _debug: {
        error: error.message,
        fallback: true
      }
    });
  }
}
