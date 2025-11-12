const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  displayName: {
    type: String,
    trim: true
  },
  photoURL: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  provider: {
    type: String,
    enum: ['password', 'google.com', 'facebook.com', 'twitter.com'],
    default: 'password'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Coins system
  coins: {
    type: Number,
    default: 100,
    min: 0
  },
  // Challenges completed (quiz questions answered correctly)
  challengesCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  // Liked stories (array of story IDs)
  likedStories: [{
    type: String
  }],
  // Saved posts (array of post IDs)
  savedPosts: [{
    type: String
  }],
  // Link to user progress
  progress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProgress'
  },
  // User preferences
  preferences: {
    language: {
      type: String,
      default: 'ar'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Method to format user response (hide sensitive data)
userSchema.methods.toPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    email: this.email,
    photoURL: this.photoURL,
    gender: this.gender,
    emailVerified: this.emailVerified,
    provider: this.provider,
    coins: this.coins,
    challengesCompleted: this.challengesCompleted,
    likedStories: this.likedStories,
    savedPosts: this.savedPosts || [],
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
