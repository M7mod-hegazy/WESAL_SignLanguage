const mongoose = require('mongoose');

// Simple Story schema for serverless
const storySchema = new mongoose.Schema({
  media: Array,
  author: String,
  authorName: String,
  authorPhoto: String,
  views: { type: Number, default: 0 }
}, { timestamps: true });

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
  });

  return mongoose.connection;
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
    if (req.method === 'GET') {
      // Get stories from MongoDB
      try {
        console.log('🎯 Stories API - Fetching stories from MongoDB...');
        
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
          });
        }

        const stories = await Story.find()
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();

        const formattedStories = stories.map(story => ({
          id: story._id.toString(),
          media: story.media || [],
          author: {
            displayName: story.authorName || 'مستخدم',
            photoURL: story.authorPhoto || '/pages/TeamPage/profile.png'
          },
          createdAt: story.createdAt,
          views: story.views || 0
        }));

        console.log(`✅ Found ${stories.length} stories in MongoDB`);
        
        if (stories.length === 0) {
          console.log('⚠️ No stories found - checking collection...');
          try {
            const totalCount = await Story.countDocuments();
            console.log('📊 Total stories in collection:', totalCount);
            if (totalCount > 0) {
              const allStories = await Story.find().limit(3).lean();
              console.log('📄 Sample stories from DB:', allStories.map(s => ({
                id: s._id.toString(),
                author: s.authorName,
                createdAt: s.createdAt
              })));
            }
          } catch (countError) {
            console.error('❌ Error counting stories:', countError.message);
          }
        }
        
        return res.status(200).json({
          success: true,
          stories: formattedStories,
          _debug: {
            mongoConnected: true,
            storiesFound: stories.length,
            timestamp: new Date().toISOString()
          }
        });
      } catch (mongoError) {
        console.error('❌ MongoDB error in stories:', mongoError.message);
        // Return empty stories as fallback
        return res.status(200).json({
          success: true,
          stories: [],
          _debug: {
            mongoConnected: false,
            fallback: true,
            error: mongoError.message
          }
        });
      }
    }

    if (req.method === 'POST') {
      // Create new story
      try {
        console.log('🎯 Stories API - Creating new story...');
        
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
          });
        }

        const newStory = new Story({
          media: req.body.media || [],
          author: 'anonymous',
          authorName: 'مستخدم',
          authorPhoto: '/pages/TeamPage/profile.png',
          views: 0
        });

        await newStory.save();
        console.log('✅ Story saved to MongoDB:', newStory._id);
        
        // Verify the story was actually saved
        const savedStory = await Story.findById(newStory._id);
        if (savedStory) {
          console.log('✅ Story verified in database:', {
            id: savedStory._id.toString(),
            author: savedStory.authorName,
            mediaCount: savedStory.media?.length || 0,
            createdAt: savedStory.createdAt
          });
        } else {
          console.error('❌ Story not found after save!');
        }

        return res.status(200).json({
          success: true,
          story: {
            id: newStory._id.toString(),
            media: newStory.media,
            author: {
              displayName: newStory.authorName,
              photoURL: newStory.authorPhoto
            },
            createdAt: newStory.createdAt,
            views: 0
          },
          message: 'تم إنشاء القصة بنجاح'
        });
      } catch (mongoError) {
        console.error('❌ MongoDB error creating story:', mongoError.message);
        // Return fallback success
        return res.status(200).json({
          success: true,
          story: {
            id: Date.now().toString(),
            media: req.body.media || [],
            author: { displayName: 'مستخدم' },
            createdAt: new Date(),
            views: 0
          },
          message: 'تم إنشاء القصة بنجاح (وضع تجريبي)'
        });
      }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Stories API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
