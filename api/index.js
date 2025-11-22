const mongoose = require('mongoose');
const admin = require('firebase-admin');
const busboy = require('busboy');

// Load .env only in local development
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available on Vercel, which is fine
  }
}

// ============================================
// CONFIGURATION & INITIALIZATION
// ============================================

// MongoDB connection cache
let cachedConnection = null;

async function connectToDatabase() {
  // Return cached connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('♻️ Using cached MongoDB connection');
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not set');
    return null;
  }

  try {
    console.log('🔄 Establishing new MongoDB connection...');
    
    // Disconnect any existing connection first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect with optimized settings for Vercel
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4
    });
    
    cachedConnection = mongoose.connection;
    console.log('✅ MongoDB connected successfully');
    return cachedConnection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    cachedConnection = null;
    return null;
  }
}

// Firebase Admin setup
if (!admin.apps.length) {
  try {
    console.log('🔥 Initializing Firebase Admin...');
    console.log('📋 Firebase Project ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
    console.log('📋 Firebase Private Key:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    console.log('📋 Firebase Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
    
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
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.error('Stack:', error.stack);
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
  
  try {
    const authorPhoto = postDoc.authorPhoto || postDoc.author?.photoURL || '/pages/TeamPage/profile.png';
    const authorUid = typeof postDoc.author === 'string'
      ? postDoc.author
      : postDoc.author?.uid || postDoc.author?._id?.toString() || 'anonymous';
    const authorName = postDoc.authorName || postDoc.author?.displayName || postDoc.author?.name || 'مستخدم';
    
    const postId = postDoc._id ? (typeof postDoc._id === 'string' ? postDoc._id : postDoc._id.toString()) : 'unknown';
    
    return {
      id: postId,
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
  } catch (error) {
    console.error('❌ Error formatting post:', error.message);
    console.error('Post data:', postDoc);
    return null;
  }
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

// Helper function to format post response
function formatPost(post) {
  return {
    id: post._id?.toString() || post.id,
    content: post.content,
    media: post.media || [],
    author: {
      displayName: post.authorName || 'مستخدم',
      photoURL: post.authorPhoto || '/pages/TeamPage/profile.png'
    },
    createdAt: post.createdAt,
    likes: post.likes || [],
    saves: post.saves || [],
    shares: post.shares || 0,
    comments: post.comments || []
  };
}

// GET /api/posts - Get posts list
async function handleGetPosts(req, res) {
  try {
    console.log('📡 [Posts GET] Received request');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      console.log('⚠️ [Posts GET] No DB connection, returning empty');
      return res.status(200).json({
        success: true,
        posts: [],
        pagination: { page, limit, pages: 0 }
      });
    }

    console.log('🔍 [Posts GET] Querying posts...');
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('✅ [Posts GET] Found', posts.length, 'posts');
    const total = await Post.countDocuments();
    const pages = Math.ceil(total / limit);

    const formattedPosts = posts.map(post => {
      try {
        return formatPost(post);
      } catch (formatError) {
        console.error('❌ [Posts GET] Error formatting post:', formatError.message);
        return null;
      }
    }).filter(p => p !== null);

    console.log('✅ [Posts GET] Returning', formattedPosts.length, 'formatted posts');
    return res.status(200).json({
      success: true,
      posts: formattedPosts,
      pagination: { page, limit, pages, total }
    });
  } catch (error) {
    console.error('❌ [Posts GET] Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/posts - Create post
async function handleCreatePost(req, res) {
  try {
    console.log('📝 [Post Create] Received request');
    console.log('📋 [Post Create] Content-Type:', req.headers['content-type']);
    console.log('📋 [Post Create] Body keys:', Object.keys(req.body || {}));
    console.log('📋 [Post Create] Files keys:', Object.keys(req.files || {}));
    console.log('📋 [Post Create] Full body:', JSON.stringify(req.body));
    
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      console.error('❌ Database connection failed for POST /api/posts');
      return res.status(503).json({ 
        success: false, 
        error: 'Database unavailable',
        details: 'MongoDB connection failed. Check MONGODB_URI environment variable.'
      });
    }

    // Get user info from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    let authorName = 'مستخدم';
    let authorPhoto = '/pages/TeamPage/profile.png';
    let author = null;

    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        authorName = decodedToken.name || decodedToken.email?.split('@')[0] || 'مستخدم';
        authorPhoto = decodedToken.picture || '/pages/TeamPage/profile.png';
        author = decodedToken.uid;
        console.log('✅ [Post Create] User verified:', authorName);
      } catch (error) {
        console.warn('⚠️ [Post Create] Token verification failed:', error.message);
      }
    }

    const { content, media } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    console.log('📊 [Post Create] Media received:', media);

    const post = new Post({
      content,
      media: media || [],
      authorName: req.body.authorName || authorName,
      authorPhoto: req.body.authorPhoto || authorPhoto,
      author: req.body.author || author,
      likes: [],
      comments: [],
      saves: [],
      shares: 0
    });

    await post.save();
    console.log('✅ [Post Create] Post saved:', post._id, 'with media:', post.media);

    return res.status(201).json({
      success: true,
      post: formatPost(post)
    });
  } catch (error) {
    console.error('❌ [Post Create] Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// GET /api/stories - Get stories
async function handleGetStories(req, res) {
  try {
    console.log('📡 [Stories GET] Received request');
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      console.log('⚠️ [Stories GET] No DB connection, returning empty');
      return res.status(200).json({
        success: true,
        storyGroups: []
      });
    }

    console.log('🔍 [Stories GET] Querying stories...');
    const stories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log('✅ [Stories GET] Found', stories.length, 'stories');
    
    const storyGroups = stories.map(story => {
      try {
        return {
          id: story._id?.toString() || story.id,
          author: {
            displayName: story.authorName || 'مستخدم',
            photoURL: story.authorPhoto || '/pages/TeamPage/profile.png',
            photo: story.authorPhoto || '/pages/TeamPage/profile.png',
            name: story.authorName || 'مستخدم'
          },
          stories: [
            {
              id: story._id?.toString() || story.id,
              media: story.media && story.media.length > 0 ? story.media[0] : null,
              createdAt: story.createdAt,
              views: story.views || 0,
              likes: story.likes || []
            }
          ]
        };
      } catch (mapError) {
        console.error('❌ [Stories GET] Error mapping story:', mapError.message);
        return null;
      }
    }).filter(s => s !== null);

    console.log('✅ [Stories GET] Returning', storyGroups.length, 'story groups');
    return res.status(200).json({
      success: true,
      storyGroups
    });
  } catch (error) {
    console.error('❌ [Stories GET] Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// POST /api/stories - Create story
async function handleCreateStory(req, res) {
  try {
    console.log('📝 [Story Create] Received request');
    console.log('📋 [Story Create] Content-Type:', req.headers['content-type']);
    console.log('📋 [Story Create] Body keys:', Object.keys(req.body || {}));
    console.log('📋 [Story Create] Files keys:', Object.keys(req.files || {}));
    console.log('📋 [Story Create] Full body:', JSON.stringify(req.body));
    console.log('📋 [Story Create] Full files:', req.files ? Object.keys(req.files) : 'none');
    
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      console.error('❌ [Story Create] Database connection failed');
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    // Get user info from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    let authorName = 'مستخدم';
    let authorPhoto = '/pages/TeamPage/profile.png';
    let author = null;

    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        authorName = decodedToken.name || decodedToken.email?.split('@')[0] || 'مستخدم';
        authorPhoto = decodedToken.picture || '/pages/TeamPage/profile.png';
        author = decodedToken.uid;
        console.log('✅ [Story Create] User verified:', authorName);
      } catch (error) {
        console.warn('⚠️ [Story Create] Token verification failed:', error.message);
      }
    }

    // Handle file upload or base64 media
    let mediaData = [];
    
    // Check for files in req.files (multipart upload)
    if (req.files && Object.keys(req.files).length > 0) {
      console.log('📁 [Story Create] Files found:', Object.keys(req.files));
      
      // Get the first file (could be 'media' or any other field name)
      const fileKey = Object.keys(req.files)[0];
      const file = req.files[fileKey];
      
      console.log('📁 [Story Create] Processing file:', fileKey, 'Name:', file.name, 'Size:', file.size);
      
      // Convert file to base64
      const base64 = file.data.toString('base64');
      const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
      
      mediaData = [{
        type: mediaType,
        url: `data:${file.mimetype};base64,${base64}`,
        filename: file.name
      }];
      console.log('✅ [Story Create] Media converted to base64');
    } else if (req.body.media) {
      console.log('📋 [Story Create] Using body media');
      // Direct media data (base64 or URL)
      if (typeof req.body.media === 'string') {
        // Single media item as string
        mediaData = [{ url: req.body.media }];
      } else if (Array.isArray(req.body.media)) {
        // Array of media items
        mediaData = req.body.media;
      } else if (typeof req.body.media === 'object') {
        // Single media object
        mediaData = [req.body.media];
      }
      console.log('✅ [Story Create] Media from body:', mediaData);
    } else {
      console.warn('⚠️ [Story Create] No media found, creating story without media');
      // Allow story creation without media (will be empty array)
      mediaData = [];
    }

    console.log('📊 [Story Create] Final mediaData:', mediaData);

    const story = new Story({
      media: mediaData,
      authorName: req.body.authorName || authorName,
      authorPhoto: req.body.authorPhoto || authorPhoto,
      author: req.body.author || author,
      likes: [],
      views: 0
    });

    await story.save();
    console.log('✅ [Story Create] Story saved:', story._id);

    return res.status(201).json({
      success: true,
      story: {
        id: story._id.toString(),
        media: story.media || [],
        author: { 
          displayName: story.authorName || 'مستخدم', 
          photoURL: story.authorPhoto || '/pages/TeamPage/profile.png' 
        },
        createdAt: story.createdAt,
        views: 0,
        likes: []
      }
    });
  } catch (error) {
    console.error('❌ [Story Create] Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// ============================================
// MAIN HANDLER - ROUTER
// ============================================

module.exports = async (req, res) => {
  // Add polyfills for Node.js http.createServer compatibility
  if (typeof res.status !== 'function') {
    res.status = function(code) {
      res.statusCode = code;
      return res;
    };
  }
  
  if (typeof res.json !== 'function') {
    res.json = function(data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }

  enableCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Handle file uploads
    if (!req.files && req.method === 'POST') {
      // Use busboy to parse multipart/form-data
      const bb = busboy({ headers: req.headers });
      const files = {};
      const fields = {};

      bb.on('file', (fieldname, file, info) => {
        const chunks = [];
        file.on('data', (data) => {
          chunks.push(data);
        });
        file.on('end', () => {
          files[fieldname] = {
            data: Buffer.concat(chunks),
            mimetype: info.mimeType,
            name: info.filename,
            size: Buffer.concat(chunks).length
          };
        });
      });

      bb.on('field', (fieldname, val) => {
        fields[fieldname] = val;
      });

      await new Promise((resolve, reject) => {
        bb.on('finish', resolve);
        bb.on('error', reject);
        req.pipe(bb);
      });

      req.files = files;
      req.body = fields;
    }

    // Parse request body if needed
    let body = {};
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body && typeof req.body === 'string') {
        try {
          body = JSON.parse(req.body);
        } catch (e) {
          body = req.body;
        }
      } else {
        body = req.body || {};
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

    // Posts interaction routes (like, save, share)
    if (path.startsWith('/api/posts') && req.method === 'PUT') {
      // Handle like/save/share updates
      const url = new URL(`http://localhost${req.url}`);
      const postId = url.searchParams.get('id');
      const action = url.searchParams.get('action');
      
      if (!postId) {
        return res.status(400).json({ success: false, error: 'Post ID required' });
      }
      
      // For now, just return success - interactions are stored in localStorage
      return res.status(200).json({ 
        success: true, 
        message: `Post ${action || 'updated'} successfully`,
        postId 
      });
    }

    // 404
    console.warn(`⚠️ Endpoint not found: ${req.method} ${path}`);
    return res.status(404).json({ success: false, error: 'Endpoint not found', path });

  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Ensure we always return a valid response
    try {
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal Server Error',
        type: error.name,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    } catch (responseError) {
      console.error('Failed to send error response:', responseError);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
    }
  }
};

