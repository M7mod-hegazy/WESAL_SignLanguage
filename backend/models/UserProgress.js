const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  totalCoins: {
    type: Number,
    default: 0,
    min: [0, 'Total coins cannot be negative']
  },
  signsLearned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign'
  }],
  currentStreak: {
    type: Number,
    default: 0,
    min: [0, 'Current streak cannot be negative']
  },
  bestStreak: {
    type: Number,
    default: 0,
    min: [0, 'Best streak cannot be negative']
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for signs learned count
userProgressSchema.virtual('signsLearnedCount').get(function() {
  return this.signsLearned.length;
});

// Index for faster queries
userProgressSchema.index({ username: 1 });
userProgressSchema.index({ totalCoins: -1 });

// Method to add coins
userProgressSchema.methods.addCoins = function(amount) {
  this.totalCoins += amount;
  this.lastActivity = Date.now();
  return this.save();
};

// Method to increment streak
userProgressSchema.methods.incrementStreak = function() {
  this.currentStreak += 1;
  if (this.currentStreak > this.bestStreak) {
    this.bestStreak = this.currentStreak;
  }
  this.lastActivity = Date.now();
  return this.save();
};

// Method to reset streak
userProgressSchema.methods.resetStreak = function() {
  this.currentStreak = 0;
  this.lastActivity = Date.now();
  return this.save();
};

// Method to add learned sign
userProgressSchema.methods.addLearnedSign = function(signId) {
  if (!this.signsLearned.includes(signId)) {
    this.signsLearned.push(signId);
    this.lastActivity = Date.now();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to format response
userProgressSchema.methods.toResponseFormat = function() {
  return {
    username: this.username,
    totalCoins: this.totalCoins,
    signsLearnedCount: this.signsLearnedCount,
    currentStreak: this.currentStreak,
    bestStreak: this.bestStreak,
    lastActivity: this.lastActivity
  };
};

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress;
