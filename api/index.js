const mongoose = require('mongoose');
const admin = require('firebase-admin');

// ============================================
// CONFIGURATION & INITIALIZATION
// ============================================

// MongoDB connection cache
let isConnected = false;

async function connectToDatabase() {
  const currentState = mongoose.connection.readyState;
  
  if (currentState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not set');
    return null;
  }

  try {
    if (currentState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    isConnected = true;
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    isConnected = false;
    return null;
  }
}

// Firebase Admin setup
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

// ============================================
// SCHEMAS & MODELS
// ============================================

const postSchema = new mongoose.Schema({
  content: String,
  author: mongoose.Schema.Types.Mixed,
  authorName: String,
  authorPhoto: String,
  media: Array,
  likes: Array,
  comments: Array,
  saves: Array,
  shares: { type: Number, default: 0 },
  isShared: { type: Boolean, default: false },
  originalPostId: String,
  sharedBy: Object
}, { timestamps: true });

const storySchema = new mongoose.Schema({
  media: Array,
  author: String,
  authorName: String,
  authorPhoto: String,
  likes: Array,
  views: { type: Number, default: 0 }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  firebaseUid: String,
  email: String,
  displayName: String,
  photoURL: String,
  coins: { type: Number, default: 100 },
  gender: { type: String, default: 'male' },
  provider: String
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

// ============================================
// UTILITY FUNCTIONS
// ============================================

function enableCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function formatPost(postDoc, requesterId = 'anonymous') {
  if (!postDoc) return null;
  const authorPhoto = postDoc.authorPhoto || postDoc.author?.photoURL || '/pages/TeamPage/profile.png';
  const authorUid = typeof postDoc.author === 'string'
    ? postDoc.author
    : postDoc.author?.uid || postDoc.author?._id?.toString() || 'anonymous';
  const authorName = postDoc.authorName || postDoc.author?.displayName || postDoc.author?.name || 'مستخدم';
  
  return {
    id: postDoc._id.toString(),
    content: postDoc.content || 'منشور من قاعدة البيانات',
    media: postDoc.media || [],
    author: {
      displayName: authorName,
      name: authorName,
      photoURL: authorPhoto,
      photo: authorPhoto,
      uid: authorUid,
      gender: postDoc.author?.gender || 'male'
    },
    likes: postDoc.likes || [],
    likeCount: (postDoc.likes || []).length,
    comments: postDoc.comments || [],
    saves: postDoc.saves || [],
    shares: postDoc.shares || 0,
    isLiked: (postDoc.likes || []).includes(requesterId),
    isSaved: (postDoc.saves || []).includes(requesterId),
    isShared: postDoc.isShared || false,
    originalPostId: postDoc.originalPostId,
    sharedBy: postDoc.sharedBy,
    createdAt: postDoc.createdAt,
    updatedAt: postDoc.updatedAt
  };
}

// ============================================
// ROUTE HANDLERS
// ============================================

// GET /api/auth/me - Get current user
async function handleAuthMe(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (authError) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    let dbConnection;
    try {
      dbConnection = await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
    }

    if (dbConnection) {
      try {
        let user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
          user = new User({
            firebaseUid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name || 'مستخدم',
            photoURL: decodedToken.picture,
            coins: 100,
            gender: 'male',
            provider: 'google'
          });
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
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || 'مستخدم',
        photoURL: decodedToken.picture || '/pages/TeamPage/profile.png',
        coins: 100,
        gender: 'male'
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/auth/verify - Verify user token
async function handleAuthVerify(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (authError) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    let dbConnection;
    try {
      dbConnection = await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
    }

    if (dbConnection) {
      try {
        let user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
          user = new User({
            firebaseUid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name || req.body?.displayName || 'مستخدم',
            photoURL: decodedToken.picture || req.body?.photoURL,
            coins: 100,
            gender: 'male',
            provider: 'google'
          });
          await user.save();
        } else {
          if (req.body?.displayName) user.displayName = req.body.displayName;
          if (req.body?.photoURL) user.photoURL = req.body.photoURL;
          if (req.body?.email) user.email = req.body.email;
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
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || req.body?.displayName || 'مستخدم',
        photoURL: decodedToken.picture || req.body?.photoURL || '/pages/TeamPage/profile.png',
        coins: 100,
        gender: 'male'
      }
    });

  } catch (error) {
    console.error('Auth verify error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/posts - Get posts list
async function handleGetPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      return res.status(200).json({
        success: true,
        posts: [],
        pagination: { page, limit, pages: 0 }
      });
    }

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments();
    const pages = Math.ceil(total / limit);

    const formattedPosts = posts.map(post => formatPost(post));

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
      pagination: { page, limit, pages, total }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/posts - Create post
async function handleCreatePost(req, res) {
  try {
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    const { content, media, authorName, authorPhoto, author } = req.body;

    const post = new Post({
      content,
      media: media || [],
      authorName,
      authorPhoto,
      author,
      likes: [],
      comments: [],
      saves: [],
      shares: 0
    });

    await post.save();

    return res.status(201).json({
      success: true,
      post: formatPost(post)
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/stories - Get stories
async function handleGetStories(req, res) {
  try {
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      return res.status(200).json({
        success: true,
        storyGroups: []
      });
    }

    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const storyGroups = stories.map(story => ({
      id: story._id.toString(),
      media: story.media || [],
      author: {
        displayName: story.authorName || 'مستخدم',
        photoURL: story.authorPhoto || '/pages/TeamPage/profile.png'
      },
      createdAt: story.createdAt,
      views: story.views || 0,
      likes: story.likes || []
    }));

    return res.status(200).json({
      success: true,
      storyGroups
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/stories - Create story
async function handleCreateStory(req, res) {
  try {
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    const { media, authorName, authorPhoto, author } = req.body;

    const story = new Story({
      media: media || [],
      authorName,
      authorPhoto,
      author,
      likes: [],
      views: 0
    });

    await story.save();

    return res.status(201).json({
      success: true,
      story: {
        id: story._id.toString(),
        media: story.media,
        author: { displayName: authorName, photoURL: authorPhoto },
        createdAt: story.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ============================================
// MAIN HANDLER - ROUTER
// ============================================

module.exports = async (req, res) => {
  enableCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Parse request body if needed
    let body = {};
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      }
      req.body = body;
    }

    const url = req.url || '';
    const path = url.split('?')[0]; // Remove query string

    console.log(`📍 API Request: ${req.method} ${path}`);

    // Health check
    if (path === '/api/health') {
      return res.status(200).json({ 
        success: true, 
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    }

    // Auth routes
    if (path === '/api/auth/me') {
      return await handleAuthMe(req, res);
    }
    if (path === '/api/auth/verify') {
      return await handleAuthVerify(req, res);
    }

    // Posts routes
    if (path === '/api/posts' && req.method === 'GET') {
      return await handleGetPosts(req, res);
    }
    if (path === '/api/posts' && req.method === 'POST') {
      return await handleCreatePost(req, res);
    }

    // Stories routes
    if (path === '/api/stories' && req.method === 'GET') {
      return await handleGetStories(req, res);
    }
    if (path === '/api/stories' && req.method === 'POST') {
      return await handleCreateStory(req, res);
    }

    // 404
    console.warn(`⚠️ Endpoint not found: ${req.method} ${path}`);
    return res.status(404).json({ success: false, error: 'Endpoint not found', path });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
};
