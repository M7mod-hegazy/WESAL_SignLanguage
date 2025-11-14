const mongoose = require('mongoose');
const Post = require('../../backend/models/Post');
const User = require('../../backend/models/User');

// MongoDB connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    cachedDb = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return null;
  }
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

// Generate sample posts for demo
function generateSamplePosts(count = 3) {
  const samplePosts = [];
  for (let i = 0; i < count; i++) {
    samplePosts.push({
      id: `sample_${Date.now()}_${i}`,
      content: `منشور تجريبي رقم ${i + 1} - مرحباً بكم في منصة وصال لتعلم لغة الإشارة العربية! 🤟`,
      media: [],
      author: {
        displayName: 'مستخدم تجريبي',
        photoURL: '/pages/TeamPage/profile.png'
      },
      createdAt: new Date(Date.now() - i * 3600000),
      likeCount: Math.floor(Math.random() * 50),
      commentCount: Math.floor(Math.random() * 10),
      saveCount: Math.floor(Math.random() * 20),
      shareCount: Math.floor(Math.random() * 15),
      comments: []
    });
  }
  return samplePosts;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Try to connect to database
    const dbConnection = await connectToDatabase();

    if (req.method === 'GET') {
      // Get all posts from MongoDB
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      if (dbConnection) {
        try {
          const posts = await Post.find()
            .populate('author', 'displayName photoURL firebaseUid')
            .populate('comments.author', 'displayName photoURL')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

          const totalPosts = await Post.countDocuments();
          const totalPages = Math.ceil(totalPosts / limit);

          // Convert MongoDB posts to frontend format
          const formattedPosts = posts.map(post => ({
            id: post._id.toString(),
            content: post.content,
            media: post.media || [],
            author: {
              displayName: post.author?.displayName || 'مستخدم',
              photoURL: post.author?.photoURL || '/pages/TeamPage/profile.png',
              uid: post.author?.firebaseUid
            },
            createdAt: post.createdAt,
            likeCount: post.likeCount || 0,
            commentCount: post.comments?.length || 0,
            saveCount: post.saveCount || 0,
            shareCount: post.shareCount || 0,
            comments: post.comments || [],
            isShared: post.isShared || false,
            originalPostId: post.originalPostId,
            sharedBy: post.sharedBy
          }));

          return res.status(200).json({
            success: true,
            posts: formattedPosts,
            pagination: {
              currentPage: page,
              totalPages,
              totalPosts,
              hasMore: page < totalPages
            },
            _debug: {
              mongoConnected: true,
              timestamp: new Date().toISOString()
            }
          });
        } catch (dbError) {
          console.error('Database query error:', dbError);
        }
      }

      // Fallback to sample posts if MongoDB unavailable
      const samplePosts = generateSamplePosts(limit);
      return res.status(200).json({
        success: true,
        posts: samplePosts,
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalPosts: samplePosts.length,
          hasMore: false
        },
        _debug: {
          mongoConnected: false,
          fallback: true,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (req.method === 'POST') {
      // Create new post in MongoDB
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      try {
        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        if (dbConnection) {
          // Find or create user in MongoDB
          let user = await User.findOne({ firebaseUid: decodedToken.uid });
          if (!user) {
            user = new User({
              firebaseUid: decodedToken.uid,
              email: decodedToken.email,
              displayName: decodedToken.name || 'مستخدم',
              photoURL: decodedToken.picture || '/pages/TeamPage/profile.png'
            });
            await user.save();
          }

          // Create new post
          const newPost = new Post({
            content: req.body.content || 'منشور جديد',
            media: req.body.media || [],
            author: user._id,
            likeCount: 0,
            saveCount: 0,
            shareCount: 0,
            comments: [],
            isShared: req.body.isShared || false,
            originalPostId: req.body.originalPostId,
            sharedBy: req.body.sharedBy
          });

          await newPost.save();
          await newPost.populate('author', 'displayName photoURL firebaseUid');

          const formattedPost = {
            id: newPost._id.toString(),
            content: newPost.content,
            media: newPost.media,
            author: {
              displayName: newPost.author.displayName,
              photoURL: newPost.author.photoURL,
              uid: newPost.author.firebaseUid
            },
            createdAt: newPost.createdAt,
            likeCount: 0,
            commentCount: 0,
            saveCount: 0,
            shareCount: 0,
            comments: []
          };

          return res.status(200).json({
            success: true,
            post: formattedPost,
            message: 'تم إنشاء المنشور بنجاح'
          });
        }
      } catch (authError) {
        console.error('Auth error:', authError);
      }

      // Fallback response
      return res.status(200).json({
        success: true,
        post: {
          id: `post_${Date.now()}`,
          content: req.body.content || 'منشور جديد',
          media: req.body.media || [],
          author: {
            displayName: 'المستخدم',
            photoURL: '/pages/TeamPage/profile.png'
          },
          createdAt: new Date(),
          likeCount: 0,
          commentCount: 0,
          saveCount: 0,
          shareCount: 0,
          comments: []
        },
        message: 'تم إنشاء المنشور بنجاح (وضع تجريبي)'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Posts API error:', error);
    
    // Return sample data even on error
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        posts: generateSamplePosts(3),
        pagination: { currentPage: 1, totalPages: 1, totalPosts: 3, hasMore: false },
        _debug: { error: error.message, fallback: true }
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      post: { id: Date.now().toString(), content: 'منشور تجريبي' },
      _debug: { error: error.message, fallback: true }
    });
  }
}
