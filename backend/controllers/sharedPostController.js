const SharedPost = require('../models/SharedPost');
const Post = require('../models/Post');

// @desc    Create a shared post
// @route   POST /api/shared-posts
// @access  Private
exports.createSharedPost = async (req, res) => {
  try {
    const { originalPostId, caption } = req.body;
    
    if (!originalPostId) {
      return res.status(400).json({
        success: false,
        error: 'Original post ID is required'
      });
    }

    // Get original post
    const originalPost = await Post.findById(originalPostId);
    if (!originalPost) {
      return res.status(404).json({
        success: false,
        error: 'Original post not found'
      });
    }

    // Create shared post
    const sharedPost = await SharedPost.create({
      originalPostId,
      sharedBy: {
        firebaseUid: req.user.uid,
        name: req.user.name || req.user.email?.split('@')[0],
        photoURL: req.user.photoURL
      },
      caption: caption || '',
      originalPost: {
        content: originalPost.content,
        media: originalPost.media,
        author: originalPost.author
      }
    });

    // Increment share count on original post
    originalPost.shares += 1;
    await originalPost.save();

    res.status(201).json({
      success: true,
      sharedPost: sharedPost.toResponseFormat(req.user.uid)
    });

  } catch (error) {
    console.error('Create shared post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create shared post'
    });
  }
};

// @desc    Get all shared posts
// @route   GET /api/shared-posts
// @access  Private
exports.getSharedPosts = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const sharedPosts = await SharedPost.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const formattedPosts = sharedPosts.map(post => 
      post.toResponseFormat(req.user.uid)
    );

    res.json({
      success: true,
      sharedPosts: formattedPosts,
      count: formattedPosts.length
    });

  } catch (error) {
    console.error('Get shared posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shared posts'
    });
  }
};

// @desc    Get user's shared posts
// @route   GET /api/shared-posts/user/:firebaseUid
// @access  Private
exports.getUserSharedPosts = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const sharedPosts = await SharedPost.find({
      'sharedBy.firebaseUid': firebaseUid,
      isActive: true
    }).sort({ createdAt: -1 });

    const formattedPosts = sharedPosts.map(post => 
      post.toResponseFormat(req.user.uid)
    );

    res.json({
      success: true,
      sharedPosts: formattedPosts,
      count: formattedPosts.length
    });

  } catch (error) {
    console.error('Get user shared posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user shared posts'
    });
  }
};

// @desc    Like a shared post
// @route   POST /api/shared-posts/:id/like
// @access  Private
exports.likeSharedPost = async (req, res) => {
  try {
    const sharedPost = await SharedPost.findById(req.params.id);
    
    if (!sharedPost) {
      return res.status(404).json({
        success: false,
        error: 'Shared post not found'
      });
    }

    // Add like if not already liked
    if (!sharedPost.likes.includes(req.user.uid)) {
      sharedPost.likes.push(req.user.uid);
      await sharedPost.save();
    }

    res.json({
      success: true,
      sharedPost: sharedPost.toResponseFormat(req.user.uid)
    });

  } catch (error) {
    console.error('Like shared post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like shared post'
    });
  }
};

// @desc    Unlike a shared post
// @route   POST /api/shared-posts/:id/unlike
// @access  Private
exports.unlikeSharedPost = async (req, res) => {
  try {
    const sharedPost = await SharedPost.findById(req.params.id);
    
    if (!sharedPost) {
      return res.status(404).json({
        success: false,
        error: 'Shared post not found'
      });
    }

    // Remove like
    sharedPost.likes = sharedPost.likes.filter(uid => uid !== req.user.uid);
    await sharedPost.save();

    res.json({
      success: true,
      sharedPost: sharedPost.toResponseFormat(req.user.uid)
    });

  } catch (error) {
    console.error('Unlike shared post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike shared post'
    });
  }
};

// @desc    Save a shared post
// @route   POST /api/shared-posts/:id/save
// @access  Private
exports.saveSharedPost = async (req, res) => {
  try {
    const sharedPost = await SharedPost.findById(req.params.id);
    
    if (!sharedPost) {
      return res.status(404).json({
        success: false,
        error: 'Shared post not found'
      });
    }

    // Add save if not already saved
    if (!sharedPost.saves.includes(req.user.uid)) {
      sharedPost.saves.push(req.user.uid);
      await sharedPost.save();
    }

    res.json({
      success: true,
      sharedPost: sharedPost.toResponseFormat(req.user.uid)
    });

  } catch (error) {
    console.error('Save shared post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save shared post'
    });
  }
};

// @desc    Unsave a shared post
// @route   POST /api/shared-posts/:id/unsave
// @access  Private
exports.unsaveSharedPost = async (req, res) => {
  try {
    const sharedPost = await SharedPost.findById(req.params.id);
    
    if (!sharedPost) {
      return res.status(404).json({
        success: false,
        error: 'Shared post not found'
      });
    }

    // Remove save
    sharedPost.saves = sharedPost.saves.filter(uid => uid !== req.user.uid);
    await sharedPost.save();

    res.json({
      success: true,
      sharedPost: sharedPost.toResponseFormat(req.user.uid)
    });

  } catch (error) {
    console.error('Unsave shared post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsave shared post'
    });
  }
};

// @desc    Delete a shared post
// @route   DELETE /api/shared-posts/:id
// @access  Private
exports.deleteSharedPost = async (req, res) => {
  try {
    const sharedPost = await SharedPost.findById(req.params.id);
    
    if (!sharedPost) {
      return res.status(404).json({
        success: false,
        error: 'Shared post not found'
      });
    }

    // Check if user owns this shared post
    if (sharedPost.sharedBy.firebaseUid !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this shared post'
      });
    }

    // Soft delete
    sharedPost.isActive = false;
    await sharedPost.save();

    res.json({
      success: true,
      message: 'Shared post deleted successfully'
    });

  } catch (error) {
    console.error('Delete shared post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete shared post'
    });
  }
};
