const mongoose = require('mongoose');
const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../backend/config/cloudinary');

// Import models and controllers
const Post = require('../backend/models/Post');
const User = require('../backend/models/User');
const { getAllPosts, createPost, toggleLike, addComment, toggleSave, sharePost, updatePost, deletePost } = require('../backend/controllers/postController');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Parse URL to get route
    const { query } = req;
    const path = query.posts || [];

    // Authenticate user for protected routes
    let user = null;
    if (req.method !== 'GET' || path.includes('me')) {
      try {
        user = await authenticateUser(req);
        req.user = user;
      } catch (error) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
    }

    // Route handling
    if (req.method === 'GET' && path.length === 0) {
      // GET /api/posts
      return await getAllPosts(req, res);
    }

    if (req.method === 'POST' && path.length === 0) {
      // POST /api/posts
      return await createPost(req, res);
    }

    if (req.method === 'POST' && path.length === 2 && path[1] === 'like') {
      // POST /api/posts/:id/like
      req.params = { id: path[0] };
      return await toggleLike(req, res);
    }

    if (req.method === 'POST' && path.length === 2 && path[1] === 'comment') {
      // POST /api/posts/:id/comment
      req.params = { id: path[0] };
      return await addComment(req, res);
    }

    if (req.method === 'POST' && path.length === 2 && path[1] === 'save') {
      // POST /api/posts/:id/save
      req.params = { id: path[0] };
      return await toggleSave(req, res);
    }

    if (req.method === 'POST' && path.length === 2 && path[1] === 'share') {
      // POST /api/posts/:id/share
      req.params = { id: path[0] };
      return await sharePost(req, res);
    }

    if (req.method === 'PUT' && path.length === 1) {
      // PUT /api/posts/:id
      req.params = { id: path[0] };
      return await updatePost(req, res);
    }

    if (req.method === 'DELETE' && path.length === 1) {
      // DELETE /api/posts/:id
      req.params = { id: path[0] };
      return await deletePost(req, res);
    }

    return res.status(404).json({ success: false, error: 'Route not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
