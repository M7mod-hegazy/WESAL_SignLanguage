const Post = require('../models/Post');
const User = require('../models/User');
const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  const startTime = Date.now();
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('📡 [POSTS] Starting fetch...');
    
    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ [POSTS] MongoDB not connected! State:', mongoose.connection.readyState);
      return res.status(503).json({
        success: false,
        error: 'Database not connected',
        posts: []
      });
    }
    
    console.log('✅ [POSTS] MongoDB connected, querying...');
    const queryStart = Date.now();
    
    // Optimized query with lean() for faster performance
    const posts = await Post.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-comments') // Exclude comments array for faster loading
      .lean() // Convert to plain JS objects (faster)
      .maxTimeMS(2000); // 2 second max query time

    console.log(`⏱️ [POSTS] Query took ${Date.now() - queryStart}ms`);
    
    // Fast count without waiting
    const countStart = Date.now();
    const total = await Post.countDocuments({ isPublic: true }).maxTimeMS(1000);
    console.log(`⏱️ [POSTS] Count took ${Date.now() - countStart}ms`);
    
    console.log(`✅ [POSTS] Found ${posts.length} posts`);
    
    // Get user's MongoDB _id if they exist in database
    let currentUserId = null;
    if (req.user?.uid) {
      const userStart = Date.now();
      const user = await User.findOne({ firebaseUid: req.user.uid }).lean().maxTimeMS(1000);
      console.log(`⏱️ [POSTS] User lookup took ${Date.now() - userStart}ms`);
      currentUserId = user?._id || req.user.uid;
    }

    // Format posts manually since we used lean()
    const formattedPosts = posts.map(post => ({
      id: post._id,
      author: {
        id: post.author,
        name: post.authorName,
        photo: post.authorPhoto,
        firebaseUid: post.author
      },
      content: post.content,
      media: post.media || [],
      likeCount: post.likes?.length || 0,
      commentCount: post.comments?.length || 0,
      shareCount: post.shares || 0,
      saveCount: post.saves?.length || 0,
      isLiked: currentUserId ? (post.likes || []).some(likeId => 
        likeId.toString() === currentUserId.toString()
      ) : false,
      isSaved: currentUserId ? (post.saves || []).some(saveId => 
        saveId.toString() === currentUserId.toString()
      ) : false,
      comments: (post.comments || []).map(comment => ({
        id: comment._id,
        user: {
          id: comment.user,
          name: comment.username,
          photo: comment.userPhoto
        },
        text: comment.text,
        createdAt: comment.createdAt
      })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    const totalTime = Date.now() - startTime;
    console.log(`🎯 [POSTS] Total request time: ${totalTime}ms`);
    
    res.json({
      success: true,
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      _debug: {
        totalTime: `${totalTime}ms`,
        postCount: posts.length
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ [POSTS] Error after ${totalTime}ms:`, error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts',
      details: error.message,
      timeElapsed: `${totalTime}ms`
    });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const uploadMediaArray = async (mediaArray = [], userId = 'global') => {
  const uploads = [];

  for (const mediaItem of mediaArray) {
    if (!mediaItem || !mediaItem.url) {
      continue;
    }

    if (typeof mediaItem.url === 'string' && mediaItem.url.startsWith('http')) {
      uploads.push({
        type: mediaItem.type || 'image',
        url: mediaItem.url,
        publicId: mediaItem.publicId || null
      });
      continue;
    }

    if (!isCloudinaryConfigured) {
      console.warn('⚠️ Cloudinary not configured. Falling back to original media payload.');
      uploads.push(mediaItem);
      continue;
    }

    try {
      const resourceType = mediaItem.type === 'video' ? 'video' : 'image';
      const uploadResult = await cloudinary.uploader.upload(mediaItem.url, {
        folder: `signlanguage/${resourceType === 'video' ? 'videos' : 'images'}/${userId}`,
        resource_type: resourceType,
        transformation: resourceType === 'image' ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined
      });

      uploads.push({
        type: mediaItem.type || resourceType,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes
      });
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw error;
    }
  }

  return uploads;
};

exports.createPost = async (req, res) => {
  try {
    const { content, media } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Post content is required'
      });
    }

    // Get user from database or use Firebase data
    let user = await User.findOne({ firebaseUid: req.user.uid });
    const authorName = user?.displayName || req.user.name || req.user.email?.split('@')[0] || 'مستخدم';
    const authorPhoto = user?.photoURL || req.user.picture || null;

    // Upload media to Cloudinary when provided
    let mediaData = [];
    if (Array.isArray(media) && media.length > 0) {
      mediaData = await uploadMediaArray(media, user?._id || req.user.uid);
    }

    console.log('📝 Creating post:', {
      author: user?._id || req.user.uid,
      authorName,
      content: content.substring(0, 50) + '...',
      mediaCount: mediaData.length
    });

    const post = await Post.create({
      author: user?._id || req.user.uid,
      authorName,
      authorPhoto,
      content,
      media: mediaData // Store media references (IDs) instead of full base64
    });

    console.log('✅ Post created successfully:', post._id, 'with', mediaData.length, 'media references');

    res.status(201).json({
      success: true,
      post: post.toResponseFormat(req.user.uid)
    });
  } catch (error) {
    console.error('❌ Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    const userId = user?._id || req.user.uid;

    // Find if user already liked (check both ObjectId and string)
    const likeIndex = post.likes.findIndex(likeId => 
      likeId.toString() === userId.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      post: post.toResponseFormat(userId),
      isLiked: likeIndex === -1,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle like',
      details: error.message
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    const username = user?.displayName || req.user.name || req.user.email?.split('@')[0] || 'مستخدم';
    const userPhoto = user?.photoURL || req.user.picture || null;

    const comment = {
      user: user?._id || req.user.uid,
      username,
      userPhoto,
      text
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      success: true,
      post: post.toResponseFormat(user?._id || req.user.uid),
      comment: {
        id: post.comments[post.comments.length - 1]._id,
        user: {
          id: comment.user,
          name: username,
          photo: userPhoto
        },
        text: comment.text,
        createdAt: post.comments[post.comments.length - 1].createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment',
      details: error.message
    });
  }
};

// @desc    Save/Unsave a post
// @route   POST /api/posts/:id/save
// @access  Private
exports.toggleSave = async (req, res) => {
  try {
    console.log('💾 Toggle save for post:', req.params.id, 'by user:', req.user.uid);
    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log('❌ Post not found');
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    console.log('👤 User found:', user ? 'YES' : 'NO');
    
    // Use firebaseUid consistently
    const userId = req.user.uid;
    console.log('🔑 Using userId:', userId);

    // Find if user already saved (check both ObjectId and string)
    const saveIndex = post.saves.findIndex(saveId => 
      saveId.toString() === userId.toString()
    );

    if (saveIndex > -1) {
      // Unsave
      post.saves.splice(saveIndex, 1);
      
      // Also remove from user's savedPosts array
      if (user) {
        user.savedPosts = user.savedPosts || [];
        user.savedPosts = user.savedPosts.filter(postId => postId.toString() !== req.params.id);
        await user.save();
        console.log('💾 Removed from user savedPosts');
      }
    } else {
      // Save
      post.saves.push(userId);
      
      // Also add to user's savedPosts array
      if (user) {
        user.savedPosts = user.savedPosts || [];
        if (!user.savedPosts.includes(req.params.id)) {
          user.savedPosts.push(req.params.id);
          await user.save();
          console.log('💾 Added to user savedPosts');
        }
      }
    }

    await post.save();

    res.json({
      success: true,
      post: post.toResponseFormat(userId),
      isSaved: saveIndex === -1,
      saveCount: post.saves.length
    });
  } catch (error) {
    console.error('Toggle save error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle save',
      details: error.message
    });
  }
};

// @desc    Share a post (increment share count)
// @route   POST /api/posts/:id/share
// @access  Private
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    post.shares += 1;
    await post.save();

    res.json({
      success: true,
      shareCount: post.shares
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share post'
    });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const { content, media } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const postAuthorId = post.author.toString();
    const userId = user._id.toString();

    if (postAuthorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this post'
      });
    }

    if (typeof content === 'string' && content.trim().length > 0) {
      post.content = content.trim();
    }

    if (Array.isArray(media)) {
      if (media.length > 0) {
        post.media = await uploadMediaArray(media, userId);
      } else {
        post.media = [];
      }
    }

    await post.save();

    return res.json({
      success: true,
      post: post.toResponseFormat(req.user.uid)
    });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update post',
      details: error.message
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
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
    // post.author can be either ObjectId or string (MongoDB ID)
    const postAuthorId = post.author.toString();
    const userId = user._id.toString();
    
    console.log('🗑️ Delete check - Post author:', postAuthorId, 'User:', userId);
    
    if (postAuthorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
};

// All functions are already exported via exports.functionName above
// No need for additional module.exports
