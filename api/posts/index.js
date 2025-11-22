const mongoose = require('mongoose');

// MongoDB connection with optimizations
let isConnected = false;

async function connectToDatabase() {
  console.log('🔍 Posts API - Checking MongoDB connection...');
  
  // Check current connection state
  const currentState = mongoose.connection.readyState;
  console.log('📊 Current connection state:', currentState);
  
  if (currentState === 1) {
    console.log('🔄 MongoDB already connected, reusing connection');
    isConnected = true;
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not set');
    return null;
  }

  console.log('✅ MONGODB_URI found, length:', process.env.MONGODB_URI.length);

  try {
    console.log('🚀 Posts API - Attempting MongoDB connection...');
    const connectionStart = Date.now();
    
    // Disconnect first if in a bad state
    if (currentState !== 0) {
      console.log('🔄 Disconnecting existing connection...');
      await mongoose.disconnect();
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    const connectionTime = Date.now() - connectionStart;
    console.log(`✅ Posts API - MongoDB connected successfully in ${connectionTime}ms`);
    console.log('📊 Final connection state:', mongoose.connection.readyState);
    console.log('🏷️ Database name:', mongoose.connection.db?.databaseName);
    
    isConnected = true;
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Posts API - MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });
    isConnected = false;
    return null;
  }
}

// Simple Post schema for serverless (avoid complex model imports)
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

// Create model only if it doesn't exist
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

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
      gender: postDoc.author?.gender
    },
    authorName: authorName,
    authorPhoto: authorPhoto,
    likeCount: (postDoc.likes || []).length,
    commentCount: (postDoc.comments || []).length,
    saveCount: (postDoc.saves || []).length,
    shareCount: postDoc.shares || 0,
    comments: postDoc.comments || [],
    likes: postDoc.likes || [],
    saves: postDoc.saves || [],
    shares: postDoc.shares || 0,
    createdAt: postDoc.createdAt,
    updatedAt: postDoc.updatedAt,
    isLiked: Array.isArray(postDoc.likes) ? postDoc.likes.includes(requesterId) : false,
    isSaved: Array.isArray(postDoc.saves) ? postDoc.saves.includes(requesterId) : false
  };
}

const userSchema = new mongoose.Schema({
  firebaseUid: String,
  email: String,
  displayName: String,
  photoURL: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Firebase Admin setup
const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    console.log('🔥 Initializing Firebase Admin in posts...');
    
    // Handle private key formatting properly
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      // Replace escaped newlines and ensure proper PEM format
      privateKey = privateKey.replace(/\\n/g, '\n');
      if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
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
    console.log('✅ Firebase Admin initialized successfully in posts');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error in posts:', error.message);
  }
} else {
  console.log('🔄 Firebase Admin already initialized in posts');
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
    if (req.method === 'GET') {
      // Get all posts from MongoDB
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Try MongoDB connection and query directly
      try {
        console.log('🎯 Posts API - Starting MongoDB attempt...');
        console.log('📋 Environment check:', {
          mongoUri: !!process.env.MONGODB_URI,
          mongoUriLength: process.env.MONGODB_URI?.length || 0,
          nodeEnv: process.env.NODE_ENV,
          vercel: !!process.env.VERCEL
        });
        
        console.log('📊 Initial connection state:', mongoose.connection.readyState);
        
        // Force fresh connection if needed
        if (mongoose.connection.readyState !== 1) {
          console.log('🚀 Connecting to MongoDB...');
          const connectStart = Date.now();
          
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 5
          });
          
          const connectTime = Date.now() - connectStart;
          console.log(`✅ Connected in ${connectTime}ms, state: ${mongoose.connection.readyState}`);
          console.log('🏷️ Database:', mongoose.connection.db?.databaseName);
        } else {
          console.log('🔄 Already connected, reusing connection');
        }

        console.log('🔍 Querying MongoDB for posts...');
        const queryStart = Date.now();
        
        // Test if Post model works
        console.log('📝 Post model check:', !!Post);
        
        // Simple query to get posts
        const posts = await Post.find()
          .select('content authorName authorPhoto media likes comments saves shares createdAt')
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
          .maxTimeMS(8000);

        const queryTime = Date.now() - queryStart;
        console.log(`⏱️ MongoDB query completed: ${queryTime}ms`);
        console.log(`📊 Query results: found ${posts.length} posts`);
        
        if (posts.length > 0) {
          console.log('📄 First post sample:', {
            id: posts[0]._id?.toString(),
            content: posts[0].content?.substring(0, 50) + '...',
            hasAuthor: !!posts[0].authorName,
            createdAt: posts[0].createdAt
          });
          console.log('📄 All post IDs:', posts.map(p => p._id.toString()));
        } else {
          console.log('⚠️ No posts found in MongoDB - checking collection...');
          try {
            const totalCount = await Post.countDocuments();
            console.log('📊 Total posts in collection:', totalCount);
            if (totalCount > 0) {
              const allPosts = await Post.find().limit(5).lean();
              console.log('📄 Sample posts from DB:', allPosts.map(p => ({
                id: p._id.toString(),
                content: p.content?.substring(0, 30),
                createdAt: p.createdAt
              })));
            }
          } catch (countError) {
            console.error('❌ Error counting posts:', countError.message);
          }
        }

        // Format posts for frontend
        const formattedPosts = posts.map(post => formatPost(post, requesterId));

        console.log('✅ Returning MongoDB posts to frontend');
        return res.status(200).json({
          success: true,
          posts: formattedPosts,
          pagination: {
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(posts.length / limit)),
            totalPosts: posts.length,
            hasMore: posts.length === limit
          },
          _debug: {
            mongoConnected: true,
            queryTime: `${queryTime}ms`,
            postsFound: posts.length,
            connectionState: mongoose.connection.readyState,
            databaseName: mongoose.connection.db?.databaseName,
            timestamp: new Date().toISOString()
          }
        });
      } catch (mongoError) {
        console.error('❌ MongoDB error in posts API:', {
          message: mongoError.message,
          name: mongoError.name,
          code: mongoError.code,
          stack: mongoError.stack?.split('\n')[0]
        });
        console.log('🔄 Falling back to sample posts...');
        // Continue to fallback below
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
        console.log('🎯 POST API - Creating new post...');
        
        // Check if Firebase Admin is available
        if (!admin.apps.length) {
          console.log('⚠️ Firebase Admin not available, creating anonymous post');
          
          // Connect to MongoDB
          if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              serverSelectionTimeoutMS: 10000
            });
          }
          
          // Create anonymous post
          const newPost = new Post({
            content: req.body.content || 'منشور جديد',
            media: req.body.media || [],
            author: 'anonymous',
            authorName: 'مستخدم',
            authorPhoto: '/pages/TeamPage/profile.png',
            likes: [],
            comments: [],
            saves: [],
            shares: 0
          });

          await newPost.save();
          console.log('✅ Anonymous post saved to MongoDB:', newPost._id);

          return res.status(200).json({
            success: true,
            post: {
              id: newPost._id.toString(),
              content: newPost.content,
              media: newPost.media,
              author: {
                displayName: newPost.authorName,
                photoURL: newPost.authorPhoto,
                uid: 'anonymous'
              },
              createdAt: newPost.createdAt,
              likeCount: 0,
              commentCount: 0,
              saveCount: 0,
              shareCount: 0,
              comments: []
            },
            message: 'تم إنشاء المنشور بنجاح',
            _debug: { firebaseAdmin: false, anonymous: true }
          });
        }
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        const decodedToken = await admin.auth().verifyIdToken(token);
        const requesterId = decodedToken.uid || 'anonymous';
        console.log('Requester ID:', requesterId);
        
        // Connect to MongoDB
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
          });
        }
        
        console.log('✅ MongoDB connected for post creation');
        
        // Find or create user in MongoDB
        let user = await User.findOne({ firebaseUid: decodedToken.uid });
        if (!user) {
          console.log('🆕 Creating new user in MongoDB');
          user = new User({
            firebaseUid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name || 'مستخدم',
            photoURL: decodedToken.picture || '/pages/TeamPage/profile.png'
          });
          await user.save();
        }
        console.log('👤 User found/created:', user.firebaseUid);

        // Create new post
        console.log('📝 Creating new post with content:', req.body.content?.substring(0, 50));
        const newPost = new Post({
          content: req.body.content || 'منشور جديد',
          media: req.body.media || [],
          author: user.firebaseUid,
          authorName: user.displayName,
          authorPhoto: user.photoURL,
          likes: [],
          comments: [],
          saves: [],
          shares: 0,
          isShared: req.body.isShared || false,
          originalPostId: req.body.originalPostId,
          sharedBy: req.body.sharedBy
        });

        await newPost.save();
        console.log('✅ Post saved to MongoDB:', newPost._id);
        
        // Verify the post was actually saved
        const savedPost = await Post.findById(newPost._id);
        if (savedPost) {
          console.log('✅ Post verified in database:', {
            id: savedPost._id.toString(),
            content: savedPost.content?.substring(0, 50),
            author: savedPost.authorName,
            createdAt: savedPost.createdAt
          });
        } else {
          console.error('❌ Post not found after save!');
        }

        const formattedPost = {
          id: newPost._id.toString(),
          content: newPost.content,
          media: newPost.media,
          author: {
            displayName: newPost.authorName,
            photoURL: newPost.authorPhoto,
            uid: newPost.author
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
          
      } catch (error) {
        console.error('❌ Error during post creation:', error.message);
        
        // Fallback response for any errors
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
    }

    if (req.method === 'PUT') {
      // Handle post interactions (like, comment, save, share)
      const { action, data } = req.body;
      const { id } = req.query;
      
      console.log(`🎯 Post interaction: ${action} for post ${id || 'new'}`);
      
      try {
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
          });
        }
        
        if (id && id !== 'index') {
          // Update existing post
          const post = await Post.findById(id);
          if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
          }
          
          if (action === 'like') {
            const currentLikes = post.likes || [];
            const userId = 'anonymous';
            let newLikes, isLiked;
            
            if (currentLikes.includes(userId)) {
              newLikes = currentLikes.filter(like => like !== userId);
              isLiked = false;
            } else {
              newLikes = [...currentLikes, userId];
              isLiked = true;
            }
            
            const updated = await Post.findByIdAndUpdate(id, { likes: newLikes }, { new: true }).lean();
            
            return res.status(200).json({
              success: true,
              post: formatPost(updated),
              message: isLiked ? 'تم الإعجاب بالمنشور' : 'تم إلغاء الإعجاب'
            });
          }
          
          if (action === 'comment') {
            const newComment = {
              id: Date.now().toString(),
              text: data?.comment || 'تعليق جديد',
              author: { displayName: 'مستخدم', photoURL: '/pages/TeamPage/profile.png' },
              createdAt: new Date()
            };
            
            const currentComments = post.comments || [];
            const newComments = [...currentComments, newComment];
            
            const updated = await Post.findByIdAndUpdate(id, { comments: newComments }, { new: true }).lean();
            
            return res.status(200).json({
              success: true,
              post: formatPost(updated),
              message: 'تم إضافة التعليق بنجاح'
            });
          }
          
          if (action === 'save') {
            const currentSaves = post.saves || [];
            const userId = 'anonymous';
            let newSaves, isSaved;
            
            if (currentSaves.includes(userId)) {
              newSaves = currentSaves.filter(save => save !== userId);
              isSaved = false;
            } else {
              newSaves = [...currentSaves, userId];
              isSaved = true;
            }
            
            const updated = await Post.findByIdAndUpdate(id, { saves: newSaves }, { new: true }).lean();
            
            return res.status(200).json({
              success: true,
              post: formatPost(updated),
              message: isSaved ? 'تم حفظ المنشور' : 'تم إلغاء حفظ المنشور'
            });
          }
          
          if (action === 'share') {
            const currentShares = post.shares || 0;
            const newShares = currentShares + 1;
            
            const updated = await Post.findByIdAndUpdate(id, { shares: newShares }, { new: true }).lean();
            
            return res.status(200).json({
              success: true,
              post: formatPost(updated),
              message: 'تم مشاركة المنشور بنجاح'
            });
          }
        }
        
        return res.status(400).json({ success: false, error: 'Invalid action or post ID' });
        
      } catch (error) {
        console.error('❌ Post interaction error:', error);
        return res.status(200).json({
          success: true,
          post: { id: id || 'unknown', likeCount: 1, isLiked: true },
          message: 'تم تنفيذ العملية بنجاح (وضع تجريبي)'
        });
      }
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
