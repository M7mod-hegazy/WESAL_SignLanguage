const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

// @desc    Register or login user with Firebase
// @route   POST /api/auth/verify
// @access  Public
exports.verifyFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, provider, emailVerified, gender } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        error: 'Firebase UID and email are required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Update existing user
      user.lastLogin = Date.now();
      user.emailVerified = emailVerified || user.emailVerified;
      // Always update photoURL if provided (important for Google login)
      if (photoURL) {
        user.photoURL = photoURL;
      }
      user.displayName = displayName || user.displayName;
      // Update gender if provided and user doesn't have photoURL (not Google user)
      if (gender && !photoURL) {
        user.gender = gender;
      }
      await user.save();

      // Populate progress
      await user.populate('progress');

      return res.json({
        success: true,
        message: 'Login successful',
        user: user.toPublicProfile(),
        progress: user.progress
      });
    }

    // Create new user
    const username = email.split('@')[0]; // Generate username from email
    
    user = await User.create({
      firebaseUid,
      email,
      username,
      displayName: displayName || username,
      photoURL,
      gender: gender || 'male', // Default to male if not provided
      provider: provider || 'password',
      emailVerified: emailVerified || false
    });

    // Create user progress
    const progress = await UserProgress.create({
      username: user.username,
      totalCoins: 0,
      signsLearned: [],
      currentStreak: 0,
      bestStreak: 0
    });

    // Link progress to user
    user.progress = progress._id;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.toPublicProfile(),
      progress: progress.toResponseFormat()
    });

  } catch (error) {
    console.error('Auth error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // MongoDB not connected, return default data from Firebase token
      return res.json({
        success: true,
        displayName: req.user.name || req.user.email?.split('@')[0] || 'مستخدم',
        email: req.user.email,
        coins: 100,
        photoURL: req.user.picture || null,
        dbConnected: false
      });
    }

    let user = await User.findOne({ firebaseUid: req.user.uid })
      .populate('progress')
      .maxTimeMS(5000); // 5 second timeout

    if (!user) {
      // User doesn't exist in DB yet, return default data from Firebase token
      return res.json({
        success: true,
        displayName: req.user.name || req.user.email?.split('@')[0] || 'مستخدم',
        email: req.user.email,
        coins: 100, // Default coins for new users
        photoURL: req.user.picture || null,
        dbConnected: true
      });
    }

    const userProfile = user.toPublicProfile();
    console.log('📤 Sending user profile:', userProfile);
    
    res.json({
      success: true,
      user: userProfile,
      progress: user.progress ? user.progress.toResponseFormat() : null,
      dbConnected: true
    });

  } catch (error) {
    console.error('Get user error:', error);
    
    // If it's a timeout error, return default data instead of failing
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      return res.json({
        success: true,
        displayName: req.user.name || req.user.email?.split('@')[0] || 'مستخدم',
        email: req.user.email,
        coins: 100,
        photoURL: req.user.picture || null,
        dbConnected: false
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, photoURL, preferences } = req.body;

    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user gender
// @route   PUT /api/auth/update-gender
// @access  Private
exports.updateGender = async (req, res) => {
  try {
    const { gender } = req.body;
    
    if (!gender || !['male', 'female'].includes(gender)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gender value'
      });
    }
    
    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Don't allow gender change for users with Google photo
    if (user.photoURL) {
      return res.status(403).json({
        success: false,
        error: 'Cannot change gender for Google users'
      });
    }
    
    user.gender = gender;
    await user.save();
    
    res.json({
      success: true,
      message: 'Gender updated successfully',
      user: user.toPublicProfile()
    });
  } catch (error) {
    console.error('Update gender error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user progress
    if (user.progress) {
      await UserProgress.findByIdAndDelete(user.progress);
    }

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/auth/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .populate('progress');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const stats = {
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastLogin: user.lastLogin,
      totalCoins: user.progress ? user.progress.totalCoins : 0,
      signsLearned: user.progress ? user.progress.signsLearnedCount : 0,
      bestStreak: user.progress ? user.progress.bestStreak : 0,
      currentStreak: user.progress ? user.progress.currentStreak : 0
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
};

// @desc    Update user coins
// @route   POST /api/auth/update-coins
// @access  Private
exports.updateCoins = async (req, res) => {
  try {
    const { coins } = req.body;
    
    if (typeof coins !== 'number' || coins < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coins value'
      });
    }

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // MongoDB not connected, return success but don't save
      return res.json({
        success: true,
        coins: coins,
        dbConnected: false,
        message: 'Coins updated locally (database offline)'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      // User not in DB yet, return success
      return res.json({
        success: true,
        coins: coins,
        dbConnected: true,
        message: 'User not synced yet'
      });
    }

    user.coins = coins;
    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      dbConnected: true
    });

  } catch (error) {
    console.error('Update coins error:', error);
    // Return success even on error to not break the app
    res.json({
      success: true,
      coins: req.body.coins,
      dbConnected: false,
      message: 'Coins updated locally (database error)'
    });
  }
};

// @desc    Add coins to user
// @route   POST /api/auth/add-coins
// @access  Private
exports.addCoins = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.coins += amount;
    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      added: amount
    });

  } catch (error) {
    console.error('Add coins error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add coins'
    });
  }
};

// @desc    Subtract coins from user
// @route   POST /api/auth/subtract-coins
// @access  Private
exports.subtractCoins = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.coins = Math.max(0, user.coins - amount);
    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      subtracted: amount
    });

  } catch (error) {
    console.error('Subtract coins error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subtract coins'
    });
  }
};

// @desc    Increment challenges completed
// @route   POST /api/auth/increment-challenges
// @access  Private
exports.incrementChallenges = async (req, res) => {
  console.log('🎯 incrementChallenges controller called!');
  console.log('User:', req.user);
  try {
    console.log('🔍 Looking for user with firebaseUid:', req.user.uid);
    let user = await User.findOne({ firebaseUid: req.user.uid });
    console.log('🔍 User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('⚠️ User not found, creating new user...');
      // Create user if doesn't exist
      user = await User.create({
        firebaseUid: req.user.uid,
        email: req.user.email,
        username: req.user.name || req.user.email?.split('@')[0] || 'User',
        displayName: req.user.name,
        photoURL: req.user.picture,
        emailVerified: req.user.emailVerified,
        challengesCompleted: 0,
        coins: 100
      });
      console.log('✅ New user created!');
    }

    console.log('✅ Current challenges:', user.challengesCompleted);
    user.challengesCompleted += 1;
    await user.save();
    console.log('✅ Updated challenges:', user.challengesCompleted);

    console.log('✅ Sending success response');
    return res.json({
      success: true,
      challengesCompleted: user.challengesCompleted
    });

  } catch (error) {
    console.error('❌ Increment challenges error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to increment challenges'
    });
  }
};

// @desc    Like a story
// @route   POST /api/auth/like-story
// @access  Private
exports.likeStory = async (req, res) => {
  try {
    const { storyId } = req.body;
    
    if (!storyId) {
      return res.status(400).json({
        success: false,
        error: 'Story ID is required'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add story to liked stories if not already liked
    if (!user.likedStories.includes(storyId)) {
      user.likedStories.push(storyId);
      await user.save();
    }

    res.json({
      success: true,
      likedStories: user.likedStories
    });

  } catch (error) {
    console.error('Like story error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like story'
    });
  }
};

// @desc    Unlike a story
// @route   POST /api/auth/unlike-story
// @access  Private
exports.unlikeStory = async (req, res) => {
  try {
    const { storyId } = req.body;
    
    if (!storyId) {
      return res.status(400).json({
        success: false,
        error: 'Story ID is required'
      });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove story from liked stories
    user.likedStories = user.likedStories.filter(id => id !== storyId);
    await user.save();

    res.json({
      success: true,
      likedStories: user.likedStories
    });

  } catch (error) {
    console.error('Unlike story error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike story'
    });
  }
};
