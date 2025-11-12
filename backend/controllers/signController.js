const Sign = require('../models/Sign');

// @desc    Get all signs
// @route   GET /api/signs
// @access  Public
exports.getAllSigns = async (req, res) => {
  try {
    const signs = await Sign.find().sort({ difficulty: 1, word: 1 });
    
    res.json({
      success: true,
      count: signs.length,
      data: signs
    });
  } catch (error) {
    console.error('Error fetching signs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signs'
    });
  }
};

// @desc    Get single sign by ID
// @route   GET /api/signs/:id
// @access  Public
exports.getSignById = async (req, res) => {
  try {
    const sign = await Sign.findById(req.params.id);
    
    if (!sign) {
      return res.status(404).json({
        success: false,
        error: 'Sign not found'
      });
    }
    
    res.json({
      success: true,
      data: sign
    });
  } catch (error) {
    console.error('Error fetching sign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sign'
    });
  }
};

// @desc    Get random quiz question
// @route   GET /api/signs/random_quiz
// @access  Public
exports.getRandomQuiz = async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    
    // Build query
    const query = {};
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (category) {
      query.category = category;
    }
    
    // Get count of matching signs
    const count = await Sign.countDocuments(query);
    
    if (count === 0) {
      return res.status(404).json({
        success: false,
        error: 'No signs available'
      });
    }
    
    // Get random sign
    const randomIndex = Math.floor(Math.random() * count);
    const sign = await Sign.findOne(query).skip(randomIndex);
    
    // Format for quiz
    const quizData = sign.toQuizFormat();
    
    res.json(quizData);
  } catch (error) {
    console.error('Error fetching random quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz question'
    });
  }
};

// @desc    Get sequential quiz by category (for simulation challenges)
// @route   GET /api/signs/sequential_quiz/:category
// @access  Public
exports.getSequentialQuiz = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Get all signs in this category, sorted by order
    const signs = await Sign.find({ category }).sort({ order: 1 });
    
    if (signs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No signs found for this category'
      });
    }
    
    // Format all signs for quiz
    const quizData = signs.map(sign => sign.toQuizFormat());
    
    res.json({
      success: true,
      category,
      totalQuestions: quizData.length,
      questions: quizData
    });
  } catch (error) {
    console.error('Error fetching sequential quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz'
    });
  }
};

// @desc    Check answer for a sign
// @route   POST /api/signs/:id/check_answer
// @access  Public
exports.checkAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    
    if (!answer) {
      return res.status(400).json({
        success: false,
        error: 'Answer is required'
      });
    }
    
    const sign = await Sign.findById(req.params.id);
    
    if (!sign) {
      return res.status(404).json({
        success: false,
        error: 'Sign not found'
      });
    }
    
    // Check if answer is correct (case-insensitive)
    const isCorrect = answer.toLowerCase().trim() === sign.correctAnswer.toLowerCase().trim();
    
    res.json({
      is_correct: isCorrect,
      correct_answer: sign.correctAnswer,
      coins_earned: isCorrect ? sign.coinsReward : 0
    });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check answer'
    });
  }
};

// @desc    Get signs by difficulty
// @route   GET /api/signs/by_difficulty
// @access  Public
exports.getSignsByDifficulty = async (req, res) => {
  try {
    const { difficulty = 'easy' } = req.query;
    
    const signs = await Sign.find({ difficulty }).sort({ word: 1 });
    
    res.json({
      success: true,
      count: signs.length,
      data: signs
    });
  } catch (error) {
    console.error('Error fetching signs by difficulty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signs'
    });
  }
};

// @desc    Create new sign
// @route   POST /api/signs
// @access  Public (should be protected in production)
exports.createSign = async (req, res) => {
  try {
    const sign = await Sign.create(req.body);
    
    res.status(201).json({
      success: true,
      data: sign
    });
  } catch (error) {
    console.error('Error creating sign:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A sign with this word already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create sign'
    });
  }
};

// @desc    Update sign
// @route   PUT /api/signs/:id
// @access  Public (should be protected in production)
exports.updateSign = async (req, res) => {
  try {
    const sign = await Sign.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!sign) {
      return res.status(404).json({
        success: false,
        error: 'Sign not found'
      });
    }
    
    res.json({
      success: true,
      data: sign
    });
  } catch (error) {
    console.error('Error updating sign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sign'
    });
  }
};

// @desc    Delete sign
// @route   DELETE /api/signs/:id
// @access  Public (should be protected in production)
exports.deleteSign = async (req, res) => {
  try {
    const sign = await Sign.findByIdAndDelete(req.params.id);
    
    if (!sign) {
      return res.status(404).json({
        success: false,
        error: 'Sign not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Sign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sign'
    });
  }
};
