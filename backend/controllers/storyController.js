const Story = require('../models/Story');
const User = require('../models/User');
const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Get all active stories
// @route   GET /api/stories
// @access  Public
exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    const currentUserId = req.user?.uid;

    // Group stories by author
    const groupedStories = {};
    stories.forEach(story => {
      const authorId = story.author.toString();
      if (!groupedStories[authorId]) {
        groupedStories[authorId] = {
          author: {
            id: story.author,
            name: story.authorName,
            photo: story.authorPhoto
          },
          stories: []
        };
      }
      groupedStories[authorId].stories.push(story.toResponseFormat(currentUserId));
    });

    res.json({
      success: true,
      storyGroups: Object.values(groupedStories)
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stories'
    });
  }
};

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
exports.createStory = async (req, res) => {
  try {
    const { media, caption } = req.body;

    if (!media || !media.type || !media.url) {
      return res.status(400).json({
        success: false,
        error: 'Story media is required'
      });
    }

    let mediaPayload = media;

    // If Cloudinary is configured and media looks like base64, upload it
    if (isCloudinaryConfigured && typeof media.url === 'string' && !media.url.startsWith('http')) {
      try {
        const resourceType = media.type === 'video' ? 'video' : 'image';
        const uploadResult = await cloudinary.uploader.upload(media.url, {
          folder: `signlanguage/stories/${req.user.uid}`,
          resource_type: resourceType,
          transformation: resourceType === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined
        });

        mediaPayload = {
          type: media.type || resourceType,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes
        };
      } catch (error) {
        console.error('❌ Story media upload failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload story media',
          details: error.message
        });
      }
    }

    // Get user from database or use Firebase data
    let user = await User.findOne({ firebaseUid: req.user.uid });
    const authorName = user?.displayName || req.user.name || req.user.email?.split('@')[0] || 'مستخدم';
    const authorPhoto = user?.photoURL || req.user.picture || null;

    const story = await Story.create({
      author: user?._id || req.user.uid,
      authorName,
      authorPhoto,
      media: mediaPayload,
      caption: caption || ''
    });

    res.status(201).json({
      success: true,
      story: story.toResponseFormat(req.user.uid)
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create story'
    });
  }
};

// @desc    Mark story as viewed
// @route   POST /api/stories/:id/view
// @access  Private
exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    const userId = user?._id || req.user.uid;

    if (!story.views.includes(userId)) {
      story.views.push(userId);
      await story.save();
    }

    res.json({
      success: true,
      viewCount: story.views.length
    });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark story as viewed'
    });
  }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Private
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user is the author
    const storyAuthorId = story.author.toString();
    const userId = user._id.toString();
    
    console.log('🗑️ Delete story check - Author:', storyAuthorId, 'User:', userId);
    
    if (storyAuthorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this story'
      });
    }

    await story.deleteOne();

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete story'
    });
  }
};

// All functions are already exported via exports.functionName above
// No need for additional module.exports
