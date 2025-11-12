const mongoose = require('mongoose');

const sharedPostSchema = new mongoose.Schema({
  // Original post reference
  originalPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  // User who shared the post
  sharedBy: {
    firebaseUid: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    photoURL: String
  },
  // Share caption/comment
  caption: {
    type: String,
    maxlength: 500
  },
  // Original post data (denormalized for performance)
  originalPost: {
    content: String,
    media: [{
      type: {
        type: String,
        enum: ['image', 'video']
      },
      url: String
    }],
    author: {
      firebaseUid: String,
      name: String,
      photoURL: String
    }
  },
  // Engagement metrics
  likes: [{
    type: String // Firebase UIDs
  }],
  saves: [{
    type: String // Firebase UIDs
  }],
  // Visibility
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
sharedPostSchema.index({ 'sharedBy.firebaseUid': 1, createdAt: -1 });
sharedPostSchema.index({ originalPostId: 1 });
sharedPostSchema.index({ createdAt: -1 });

// Method to format shared post response
sharedPostSchema.methods.toResponseFormat = function(currentUserId) {
  let isLiked = false;
  let isSaved = false;
  
  if (currentUserId) {
    isLiked = this.likes.some(uid => uid === currentUserId);
    isSaved = this.saves.some(uid => uid === currentUserId);
  }
  
  return {
    id: this._id,
    type: 'shared',
    originalPostId: this.originalPostId,
    sharedBy: this.sharedBy,
    caption: this.caption,
    originalPost: this.originalPost,
    likeCount: this.likes.length,
    saveCount: this.saves.length,
    isLiked: isLiked,
    isSaved: isSaved,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const SharedPost = mongoose.model('SharedPost', sharedPostSchema);

module.exports = SharedPost;
