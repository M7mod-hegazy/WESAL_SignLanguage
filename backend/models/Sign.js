const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Word is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Word cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'سهل', 'متوسط', 'صعب'],
    default: 'easy',
    required: true
  },
  animationData: {
    type: mongoose.Schema.Types.Mixed
  },
  animation_url: {
    type: String // For video-based signs
  },
  duration: {
    type: Number,
    min: [0, 'Duration must be positive']
  },
  category: {
    type: String,
    default: 'عام' // e.g., 'محاكاة المقهى', 'عام'
  },
  order: {
    type: Number // For sequential quizzes
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    maxlength: [100, 'Answer cannot exceed 100 characters']
  },
  wrongAnswer1: {
    type: String,
    required: [true, 'Wrong answer 1 is required'],
    maxlength: [100, 'Answer cannot exceed 100 characters']
  },
  wrongAnswer2: {
    type: String,
    required: [true, 'Wrong answer 2 is required'],
    maxlength: [100, 'Answer cannot exceed 100 characters']
  },
  wrongAnswer3: {
    type: String,
    required: [true, 'Wrong answer 3 is required'],
    maxlength: [100, 'Answer cannot exceed 100 characters']
  },
  coinsReward: {
    type: Number,
    default: 10,
    min: [0, 'Coins reward must be positive']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
signSchema.index({ difficulty: 1 });
signSchema.index({ word: 1 });

// Method to get shuffled answers for quiz
signSchema.methods.getShuffledAnswers = function() {
  const answers = [
    { text: this.correctAnswer, isCorrect: true },
    { text: this.wrongAnswer1, isCorrect: false },
    { text: this.wrongAnswer2, isCorrect: false },
    { text: this.wrongAnswer3, isCorrect: false }
  ];
  
  // Shuffle array using Fisher-Yates algorithm
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  
  return answers;
};

// Method to format for quiz response
signSchema.methods.toQuizFormat = function() {
  return {
    id: this._id,
    animationData: this.animationData,
    animation_url: this.animation_url,
    duration: this.duration,
    answers: this.getShuffledAnswers(),
    coinsReward: this.coinsReward,
    difficulty: this.difficulty,
    category: this.category,
    order: this.order
  };
};

const Sign = mongoose.model('Sign', signSchema);

module.exports = Sign;
