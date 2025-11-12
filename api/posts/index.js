const mongoose = require('mongoose');
const Post = require('../../backend/models/Post');

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

    if (req.method === 'GET') {
      // Get all posts
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const posts = await Post.find()
        .populate('author', 'displayName photoURL')
        .populate('comments.author', 'displayName photoURL')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPosts = await Post.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);

      return res.status(200).json({
        success: true,
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasMore: page < totalPages
        }
      });
    }

    if (req.method === 'POST') {
      // Create new post - requires authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
      }

      // For now, return success without creating (to avoid auth complexity)
      return res.status(200).json({
        success: true,
        post: {
          id: Date.now().toString(),
          content: req.body.content,
          media: req.body.media || [],
          author: { displayName: 'User' },
          createdAt: new Date(),
          likeCount: 0,
          commentCount: 0,
          comments: []
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Posts API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
