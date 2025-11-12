const UserProgress = require('../models/UserProgress');

// @desc    Get all user progress (for leaderboard)
// @route   GET /api/progress
// @access  Public
exports.getAllProgress = async (req, res) => {
  try {
    const progressList = await UserProgress.find()
      .sort({ totalCoins: -1 })
      .populate('signsLearned', 'word difficulty');
    
    res.json({
      success: true,
      count: progressList.length,
      data: progressList.map(p => p.toResponseFormat())
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
};

// @desc    Get current user's progress (demo: returns first user)
// @route   GET /api/progress/my_progress
// @access  Public
exports.getMyProgress = async (req, res) => {
  try {
    // In production, use req.user from authentication middleware
    // For demo, get or create a default user
    let progress = await UserProgress.findOne({ username: 'demo_user' });
    
    if (!progress) {
      // Create default user if doesn't exist
      progress = await UserProgress.create({
        username: 'demo_user',
        totalCoins: 0,
        signsLearned: [],
        currentStreak: 0,
        bestStreak: 0
      });
    }
    
    res.json(progress.toResponseFormat());
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
};

// @desc    Get progress by username
// @route   GET /api/progress/:username
// @access  Public
exports.getProgressByUsername = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ username: req.params.username })
      .populate('signsLearned', 'word difficulty');
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'User progress not found'
      });
    }
    
    res.json({
      success: true,
      data: progress.toResponseFormat()
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
};

// @desc    Add coins to user progress
// @route   POST /api/progress/add_coins
// @access  Public
exports.addCoins = async (req, res) => {
  try {
    const { amount, username = 'demo_user' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid coin amount is required'
      });
    }
    
    let progress = await UserProgress.findOne({ username });
    
    if (!progress) {
      // Create new progress if doesn't exist
      progress = await UserProgress.create({
        username,
        totalCoins: amount,
        signsLearned: [],
        currentStreak: 0,
        bestStreak: 0
      });
    } else {
      await progress.addCoins(amount);
    }
    
    res.json(progress.toResponseFormat());
  } catch (error) {
    console.error('Error adding coins:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add coins'
    });
  }
};

// @desc    Increment streak
// @route   POST /api/progress/increment_streak
// @access  Public
exports.incrementStreak = async (req, res) => {
  try {
    const { username = 'demo_user' } = req.body;
    
    let progress = await UserProgress.findOne({ username });
    
    if (!progress) {
      progress = await UserProgress.create({
        username,
        totalCoins: 0,
        signsLearned: [],
        currentStreak: 1,
        bestStreak: 1
      });
    } else {
      await progress.incrementStreak();
    }
    
    res.json(progress.toResponseFormat());
  } catch (error) {
    console.error('Error incrementing streak:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to increment streak'
    });
  }
};

// @desc    Reset streak
// @route   POST /api/progress/reset_streak
// @access  Public
exports.resetStreak = async (req, res) => {
  try {
    const { username = 'demo_user' } = req.body;
    
    const progress = await UserProgress.findOne({ username });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'User progress not found'
      });
    }
    
    await progress.resetStreak();
    
    res.json(progress.toResponseFormat());
  } catch (error) {
    console.error('Error resetting streak:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset streak'
    });
  }
};

// @desc    Add learned sign
// @route   POST /api/progress/add_learned_sign
// @access  Public
exports.addLearnedSign = async (req, res) => {
  try {
    const { signId, username = 'demo_user' } = req.body;
    
    if (!signId) {
      return res.status(400).json({
        success: false,
        error: 'Sign ID is required'
      });
    }
    
    let progress = await UserProgress.findOne({ username });
    
    if (!progress) {
      progress = await UserProgress.create({
        username,
        totalCoins: 0,
        signsLearned: [signId],
        currentStreak: 0,
        bestStreak: 0
      });
    } else {
      await progress.addLearnedSign(signId);
    }
    
    res.json(progress.toResponseFormat());
  } catch (error) {
    console.error('Error adding learned sign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add learned sign'
    });
  }
};

// @desc    Create new user progress
// @route   POST /api/progress
// @access  Public
exports.createProgress = async (req, res) => {
  try {
    const progress = await UserProgress.create(req.body);
    
    res.status(201).json({
      success: true,
      data: progress.toResponseFormat()
    });
  } catch (error) {
    console.error('Error creating progress:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User progress already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create progress'
    });
  }
};
