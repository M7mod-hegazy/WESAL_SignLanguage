const mongoose = require('mongoose');

// Import models and controllers
const Sign = require('../backend/models/Sign');
const { getRandomQuiz, checkAnswer } = require('../backend/controllers/signController');

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

// Auth middleware
async function authenticateUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Parse URL to get route
    const { query } = req;
    const path = query.signs || [];

    // Route handling
    if (req.method === 'GET' && path.length === 1 && path[0] === 'random_quiz') {
      // GET /api/signs/random_quiz
      return await getRandomQuiz(req, res);
    }

    if (req.method === 'POST' && path.length === 2 && path[1] === 'check_answer') {
      // POST /api/signs/:id/check_answer
      req.params = { id: path[0] };
      
      // Authenticate user for answer checking
      try {
        const user = await authenticateUser(req);
        req.user = user;
      } catch (error) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      return await checkAnswer(req, res);
    }

    return res.status(404).json({ success: false, error: 'Route not found' });

  } catch (error) {
    console.error('Signs API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
