const mongoose = require('mongoose');
const admin = require('firebase-admin');
const busboy = require('busboy');
const cloudinary = require('cloudinary').v2;

// Load .env only in local development
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available on Vercel, which is fine
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✓ (dzqiwtiul)' : '✗',
  api_key: process.env.CLOUDINARY_API_KEY ? '✓' : '✗',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✓' : '✗'
});
console.log('⏰ API Started at:', new Date().toISOString());

// ============================================
// CONFIGURATION & INITIALIZATION
// ============================================

// MongoDB connection cache
let cachedConnection = null;
let connectionPromise = null;

async function connectToDatabase() {
  // Return cached connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('♻️ Using cached MongoDB connection');
    return cachedConnection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    console.log('⏳ Waiting for MongoDB connection in progress...');
    return await connectionPromise;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not set');
    return null;
  }

  // Create a promise for this connection attempt
  connectionPromise = (async () => {
    try {
      console.log('🔄 Establishing new MongoDB connection...');
      
      // Don't disconnect - just try to connect
      // Mongoose will reuse existing connection if available
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 10000,
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
    } finally {
      connectionPromise = null;
    }
  })();

  return await connectionPromise;
}

// Firebase Admin setup
console.log('🔥 Checking Firebase Admin initialization...');
console.log('📋 Firebase Project ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
console.log('📋 Firebase Private Key:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : '❌ Missing');
console.log('📋 Firebase Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
console.log('📋 Firebase Client ID:', process.env.FIREBASE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('📋 Firebase Private Key ID:', process.env.FIREBASE_PRIVATE_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('📋 Admin apps already initialized:', admin.apps.length);

if (!admin.apps.length) {
  try {
    console.log('🔥 Initializing Firebase Admin...');
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('Missing required Firebase environment variables');
    }
    
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "key-id",
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || "client-id",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
    };

    console.log('📋 Service Account:', {
      project_id: serviceAccount.project_id,
      client_email: serviceAccount.client_email,
      private_key_length: serviceAccount.private_key.length
    });

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Environment variables check:');
    console.error('  FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
    console.error('  FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
    console.error('  FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
  }
} else {
  console.log('✅ Firebase Admin already initialized');
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

// Add TTL index: Auto-delete stories after 12 hours (43200 seconds)
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 43200 });

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

// Upload file to Cloudinary and return URL
async function uploadToCloudinary(fileBuffer, filename, mimetype) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        public_id: `wesal/${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        folder: 'wesal'
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error.message);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload success:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

function formatPost(postDoc, requesterId = 'anonymous') {
  if (!postDoc) return null;
  
  try {
    // Use authorName directly if it exists and is not empty
    let authorName = postDoc.authorName;
    if (!authorName || authorName === 'مستخدم') {
      // Only fall back if authorName is missing or is the default
      authorName = postDoc.author?.displayName || postDoc.author?.name || 'مستخدم';
    }
    
    const authorPhoto = postDoc.authorPhoto || postDoc.author?.photoURL || '/pages/TeamPage/profile.png';
    const authorUid = typeof postDoc.author === 'string'
      ? postDoc.author
      : postDoc.author?.uid || postDoc.author?._id?.toString() || 'anonymous';
    
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

    // Get user info from token AND body
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Start with body data (frontend sends this)
    let authorName = req.body.authorName || 'مستخدم';
    let authorPhoto = req.body.authorPhoto || '/pages/TeamPage/profile.png';
    let author = req.body.author || null;

    // Use stderr for guaranteed output visibility
    process.stderr.write('\n\n');
    process.stderr.write('╔═══════════════════════════════════════════════════════════╗\n');
    process.stderr.write('║ 🔐 [Post Create] AUTHENTICATION DEBUG                     ║\n');
    process.stderr.write('╚═══════════════════════════════════════════════════════════╝\n');
    process.stderr.write(`📨 RECEIVED FROM FRONTEND:\n`);
    process.stderr.write(`   authorName: ${req.body.authorName}\n`);
    process.stderr.write(`   authorPhoto: ${req.body.authorPhoto ? 'YES' : 'NO'}\n`);
    process.stderr.write(`   author (UID): ${req.body.author}\n`);
    process.stderr.write(`   token: ${token ? `YES (${token.length} chars)` : 'NO'}\n`);

    // Try to verify token and override with token data if available
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        process.stderr.write('✅ TOKEN VERIFIED\n');
        process.stderr.write(`   name: ${decodedToken.name}\n`);
        process.stderr.write(`   email: ${decodedToken.email}\n`);
        process.stderr.write(`   picture: ${decodedToken.picture ? 'YES' : 'NO'}\n`);
        process.stderr.write(`   uid: ${decodedToken.uid}\n`);
        
        // Prefer token data over body data
        authorName = decodedToken.name || decodedToken.email?.split('@')[0] || req.body.authorName || 'مستخدم';
        authorPhoto = decodedToken.picture || req.body.authorPhoto || '/pages/TeamPage/profile.png';
        author = decodedToken.uid;
      } catch (error) {
        process.stderr.write(`❌ TOKEN VERIFICATION FAILED: ${error.message}\n`);
        process.stderr.write('   Using body data instead\n');
      }
    } else {
      process.stderr.write('⚠️ NO TOKEN - Using body data\n');
    }
    
    process.stderr.write('📝 FINAL VALUES TO SAVE:\n');
    process.stderr.write(`   authorName: ${authorName}\n`);
    process.stderr.write(`   authorPhoto: ${authorPhoto ? 'YES' : 'NO'}\n`);
    process.stderr.write(`   author: ${author}\n`);
    process.stderr.write('╔═══════════════════════════════════════════════════════════╗\n');
    process.stderr.write('║ END AUTH DEBUG                                            ║\n');
    process.stderr.write('╚═══════════════════════════════════════════════════════════╝\n');
    process.stderr.write('\n\n');

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    // Handle file uploads to Cloudinary
    let mediaData = [];
    
    console.log('🔍 [Post Create] DEBUG - Checking media sources:');
    console.log('   req.files exists:', !!req.files);
    console.log('   req.files keys:', req.files ? Object.keys(req.files) : 'N/A');
    
    // Check for files in req.files (multipart upload)
    if (req.files && Object.keys(req.files).length > 0) {
      console.log('✅ [Post Create] Files found in req.files:', Object.keys(req.files));
      
      // Process all media files and upload to Cloudinary
      for (const fileKey of Object.keys(req.files)) {
        const file = req.files[fileKey];
        const fileArray = Array.isArray(file) ? file : [file];
        
        for (const f of fileArray) {
          try {
            console.log('📁 [Post Create] Processing file:', fileKey, 'Name:', f.name, 'Size:', f.size, 'Type:', f.mimetype);
            
            // Upload to Cloudinary
            const cloudinaryUrl = await uploadToCloudinary(f.data, f.name, f.mimetype);
            const mediaType = f.mimetype.startsWith('image/') ? 'image' : 'video';
            
            mediaData.push({
              type: mediaType,
              url: cloudinaryUrl,
              filename: f.name,
              mimetype: f.mimetype
            });
            console.log('☁️ [Post Create] File uploaded to Cloudinary:', cloudinaryUrl);
          } catch (uploadError) {
            console.error('❌ [Post Create] Cloudinary upload failed for', f.name, ':', uploadError.message);
            // Fallback to base64 if Cloudinary fails
            const base64 = f.data.toString('base64');
            const mediaType = f.mimetype.startsWith('image/') ? 'image' : 'video';
            mediaData.push({
              type: mediaType,
              url: `data:${f.mimetype};base64,${base64}`,
              filename: f.name,
              mimetype: f.mimetype
            });
            console.log('⚠️ [Post Create] Fallback to base64 for', f.name);
          }
        }
      }
      console.log('✅ [Post Create] Media processed, count:', mediaData.length);
    } else {
      console.warn('⚠️ [Post Create] No media files found in req.files');
    }

    console.log('📊 [Post Create] Final mediaData count:', mediaData.length);
    console.log('💾 [Post Create] SAVING WITH authorName:', authorName);

    const post = new Post({
      content,
      media: mediaData,
      authorName: authorName,
      authorPhoto: authorPhoto,
      author: author,
      likes: [],
      comments: [],
      saves: [],
      shares: 0
    });

    await post.save();
    console.log('✅ [Post Create] Post saved:', post._id);
    console.log('✅ [Post Create] Saved authorName:', post.authorName);
    console.log('✅ [Post Create] Media count:', post.media.length);

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
              authorName: story.authorName || 'مستخدم',
              author: {
                uid: story.author,
                displayName: story.authorName || 'مستخدم',
                photoURL: story.authorPhoto || '/pages/TeamPage/profile.png'
              },
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

    // Get user info from token AND body
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Start with body data (frontend sends this)
    let authorName = req.body.authorName || 'مستخدم';
    let authorPhoto = req.body.authorPhoto || '/pages/TeamPage/profile.png';
    let author = req.body.author || null;

    // Use stderr for guaranteed output visibility
    process.stderr.write('\n\n');
    process.stderr.write('╔═══════════════════════════════════════════════════════════╗\n');
    process.stderr.write('║ 🔐 [Story Create] AUTHENTICATION DEBUG                    ║\n');
    process.stderr.write('╚═══════════════════════════════════════════════════════════╝\n');
    process.stderr.write(`📨 RECEIVED FROM FRONTEND:\n`);
    process.stderr.write(`   authorName: ${req.body.authorName}\n`);
    process.stderr.write(`   authorPhoto: ${req.body.authorPhoto ? 'YES' : 'NO'}\n`);
    process.stderr.write(`   author (UID): ${req.body.author}\n`);
    process.stderr.write(`   token: ${token ? `YES (${token.length} chars)` : 'NO'}\n`);

    // Try to verify token and override with token data if available
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        process.stderr.write('✅ TOKEN VERIFIED\n');
        process.stderr.write(`   name: ${decodedToken.name}\n`);
        process.stderr.write(`   email: ${decodedToken.email}\n`);
        process.stderr.write(`   picture: ${decodedToken.picture ? 'YES' : 'NO'}\n`);
        process.stderr.write(`   uid: ${decodedToken.uid}\n`);
        
        // Prefer token data over body data
        authorName = decodedToken.name || decodedToken.email?.split('@')[0] || req.body.authorName || 'مستخدم';
        authorPhoto = decodedToken.picture || req.body.authorPhoto || '/pages/TeamPage/profile.png';
        author = decodedToken.uid;
      } catch (error) {
        process.stderr.write(`❌ TOKEN VERIFICATION FAILED: ${error.message}\n`);
        process.stderr.write('   Using body data instead\n');
      }
    } else {
      process.stderr.write('⚠️ NO TOKEN - Using body data\n');
    }
    
    process.stderr.write('📝 FINAL VALUES TO SAVE:\n');
    process.stderr.write(`   authorName: ${authorName}\n`);
    process.stderr.write(`   authorPhoto: ${authorPhoto ? 'YES' : 'NO'}\n`);
    process.stderr.write(`   author: ${author}\n`);
    process.stderr.write('╔═══════════════════════════════════════════════════════════╗\n');
    process.stderr.write('║ END AUTH DEBUG                                            ║\n');
    process.stderr.write('╚═══════════════════════════════════════════════════════════╝\n');
    process.stderr.write('\n\n');

    // Handle file upload to Cloudinary or base64 media
    let mediaData = [];
    
    console.log('🔍 [Story Create] DEBUG - Checking media sources:');
    console.log('   req.files exists:', !!req.files);
    console.log('   req.files keys:', req.files ? Object.keys(req.files) : 'N/A');
    
    // Check for files in req.files (multipart upload)
    if (req.files && Object.keys(req.files).length > 0) {
      console.log('✅ [Story Create] Files found in req.files:', Object.keys(req.files));
      
      // Get the first file (could be 'media' or any other field name)
      const fileKey = Object.keys(req.files)[0];
      const file = req.files[fileKey];
      
      try {
        console.log('📁 [Story Create] Processing file:', fileKey, 'Name:', file.name, 'Size:', file.size);
        
        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(file.data, file.name, file.mimetype);
        const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        
        mediaData = [{
          type: mediaType,
          url: cloudinaryUrl,
          filename: file.name,
          mimetype: file.mimetype
        }];
        console.log('☁️ [Story Create] File uploaded to Cloudinary:', cloudinaryUrl);
      } catch (uploadError) {
        console.error('❌ [Story Create] Cloudinary upload failed:', uploadError.message);
        // Fallback to base64 if Cloudinary fails
        const base64 = file.data.toString('base64');
        const mediaType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        mediaData = [{
          type: mediaType,
          url: `data:${file.mimetype};base64,${base64}`,
          filename: file.name,
          mimetype: file.mimetype
        }];
        console.log('⚠️ [Story Create] Fallback to base64');
      }
    } else {
      console.warn('⚠️ [Story Create] No media files found in req.files');
      // Allow story creation without media (will be empty array)
      mediaData = [];
    }

    console.log('📊 [Story Create] Final mediaData:', {
      count: mediaData.length,
      items: mediaData.map((m, i) => ({
        index: i,
        hasUrl: !!m.url,
        urlLength: m.url ? m.url.length : 0,
        type: m.type || 'unknown'
      }))
    });

    const story = new Story({
      media: mediaData,
      authorName: authorName,
      authorPhoto: authorPhoto,
      author: author,
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

    // Shared posts route (alias for posts)
    if (path === '/api/shared-posts' && req.method === 'GET') {
      return await handleGetPosts(req, res);
    }

    // PUT /api/posts/:id - Edit a post
    if (path.startsWith('/api/posts/') && req.method === 'PUT' && !req.url.includes('?')) {
      const postId = path.split('/').pop();
      console.log('✏️ [Post Edit] Received edit request for post:', postId);
      
      if (!postId) {
        return res.status(400).json({ success: false, error: 'Post ID required' });
      }
      
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        // Verify token
        let decodedToken;
        try {
          decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
          return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        
        const dbConnection = await connectToDatabase();
        if (!dbConnection) {
          return res.status(503).json({ success: false, error: 'Database unavailable' });
        }
        
        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
          console.error('❌ [Post Edit] Post not found:', postId);
          return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        // Check if user is the post owner
        const postAuthorId = typeof post.author === 'string' ? post.author : post.author?.uid;
        if (postAuthorId !== decodedToken.uid) {
          console.error('❌ [Post Edit] Not authorized. Post author:', postAuthorId, 'User:', decodedToken.uid);
          return res.status(403).json({ success: false, error: 'Not authorized to edit this post' });
        }
        
        // Update post content
        if (req.body.content) {
          console.log('📝 [Post Edit] Updating content');
          post.content = req.body.content;
        }
        
        // Handle media updates - only if new files are provided
        if (req.files && Object.keys(req.files).length > 0) {
          console.log('📁 [Post Edit] Processing new media files');
          let mediaData = [];
          
          // Process new media files
          for (const fileKey of Object.keys(req.files)) {
            const file = req.files[fileKey];
            const fileArray = Array.isArray(file) ? file : [file];
            
            for (const f of fileArray) {
              try {
                const cloudinaryUrl = await uploadToCloudinary(f.data, f.name, f.mimetype);
                const mediaType = f.mimetype.startsWith('image/') ? 'image' : 'video';
                mediaData.push({
                  type: mediaType,
                  url: cloudinaryUrl,
                  filename: f.name,
                  mimetype: f.mimetype
                });
                console.log('✅ [Post Edit] File uploaded:', f.name);
              } catch (uploadError) {
                console.error('❌ Cloudinary upload failed:', uploadError.message);
                // Fallback to base64
                const base64 = f.data.toString('base64');
                const mediaType = f.mimetype.startsWith('image/') ? 'image' : 'video';
                mediaData.push({
                  type: mediaType,
                  url: `data:${f.mimetype};base64,${base64}`,
                  filename: f.name,
                  mimetype: f.mimetype
                });
              }
            }
          }
          post.media = mediaData;
          console.log('📊 [Post Edit] Media updated, count:', mediaData.length);
        } else {
          console.log('📋 [Post Edit] No new media files, keeping existing media');
        }
        
        // Save updated post
        const savedPost = await post.save();
        console.log('✅ [Post Edit] Post saved successfully:', postId);
        console.log('✅ [Post Edit] Saved content:', savedPost.content);
        console.log('✅ [Post Edit] Saved media count:', savedPost.media?.length || 0);
        
        // Refresh from DB to ensure we have the latest data
        const refreshedPost = await Post.findById(postId);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Post updated successfully',
          post: formatPost(refreshedPost)
        });
      } catch (error) {
        console.error('❌ [Post Edit] Error:', error.message);
        console.error('❌ [Post Edit] Stack:', error.stack);
        return res.status(500).json({ success: false, error: error.message });
      }
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

    // DELETE /api/stories/:id - Delete a story
    if (path.startsWith('/api/stories/') && req.method === 'DELETE') {
      const storyId = path.split('/').pop();
      
      if (!storyId) {
        return res.status(400).json({ success: false, error: 'Story ID required' });
      }
      
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        // Verify token
        let decodedToken;
        try {
          decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
          return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        
        const dbConnection = await connectToDatabase();
        if (!dbConnection) {
          return res.status(503).json({ success: false, error: 'Database unavailable' });
        }
        
        // Find the story
        const story = await Story.findById(storyId);
        if (!story) {
          return res.status(404).json({ success: false, error: 'Story not found' });
        }
        
        // Check if user is the story owner
        const storyAuthorId = typeof story.author === 'string' ? story.author : story.author?.uid;
        if (storyAuthorId !== decodedToken.uid) {
          return res.status(403).json({ success: false, error: 'Not authorized to delete this story' });
        }
        
        // Delete the story
        await Story.findByIdAndDelete(storyId);
        console.log('✅ [Story Delete] Story deleted:', storyId);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Story deleted successfully',
          storyId 
        });
      } catch (error) {
        console.error('❌ [Story Delete] Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    // DELETE /api/posts/:id - Delete a post
    if (path.startsWith('/api/posts/') && req.method === 'DELETE') {
      const postId = path.split('/').pop();
      
      if (!postId) {
        return res.status(400).json({ success: false, error: 'Post ID required' });
      }
      
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        // Verify token
        let decodedToken;
        try {
          decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
          return res.status(401).json({ success: false, error: 'Invalid token' });
        }
        
        const dbConnection = await connectToDatabase();
        if (!dbConnection) {
          return res.status(503).json({ success: false, error: 'Database unavailable' });
        }
        
        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
          return res.status(404).json({ success: false, error: 'Post not found' });
        }
        
        // Check if user is the post owner
        const postAuthorId = typeof post.author === 'string' ? post.author : post.author?.uid;
        if (postAuthorId !== decodedToken.uid) {
          return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
        }
        
        // Delete the post
        await Post.findByIdAndDelete(postId);
        console.log('✅ [Post Delete] Post deleted:', postId);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Post deleted successfully',
          postId 
        });
      } catch (error) {
        console.error('❌ [Post Delete] Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
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

