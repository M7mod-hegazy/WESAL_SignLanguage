const mongoose = require('mongoose');

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
      // Return empty stories for now
      return res.status(200).json({
        success: true,
        stories: []
      });
    }

    if (req.method === 'POST') {
      // Create story - return success
      return res.status(200).json({
        success: true,
        story: {
          id: Date.now().toString(),
          media: req.body.media,
          author: { displayName: 'User' },
          createdAt: new Date()
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Stories API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
