const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or Firebase UID string
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userPhoto: String,
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or Firebase UID string
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorPhoto: String,
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String
  }],
  likes: [{
    type: mongoose.Schema.Types.Mixed // Can be ObjectId or Firebase UID string
  }],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0
  },
  saves: [{
    type: mongoose.Schema.Types.Mixed // Can be ObjectId or Firebase UID string
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  // Shared post fields
  isShared: {
    type: Boolean,
    default: false
  },
  originalPostId: {
    type: String
  },
  sharedBy: {
    name: String,
    photo: String,
    uid: String
  }
}, {
  timestamps: true
});

// Index for faster queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for save count
postSchema.virtual('saveCount').get(function() {
  return this.saves.length;
});

// Method to format post response
postSchema.methods.toResponseFormat = function(currentUserId) {
  // Check if user liked/saved this post
  let isLiked = false;
  let isSaved = false;
  
  if (currentUserId) {
    // Check both ObjectId and string formats
    isLiked = this.likes.some(likeId => 
      likeId.toString() === currentUserId.toString() || 
      likeId.toString() === currentUserId
    );
    
    isSaved = this.saves.some(saveId => 
      saveId.toString() === currentUserId.toString() || 
      saveId.toString() === currentUserId
    );
    
    // Debug logging
    if (this.likes.length > 0 || this.saves.length > 0) {
      console.log('🔍 Post:', this._id.toString().substring(0, 8), 
        '| Likes:', this.likes.map(l => l.toString().substring(0, 8)),
        '| Saves:', this.saves.map(s => s.toString().substring(0, 8)),
        '| CurrentUser:', currentUserId.toString().substring(0, 8),
        '| isLiked:', isLiked, '| isSaved:', isSaved);
    }
  }
  
  return {
    id: this._id,
    author: {
      id: this.author,
      name: this.authorName,
      photo: this.authorPhoto,
      firebaseUid: this.author
    },
    content: this.content,
    media: this.media,
    likeCount: this.likes.length,
    commentCount: this.comments.length,
    shareCount: this.shares,
    saveCount: this.saves.length,
    isLiked: isLiked,
    isSaved: isSaved,
    comments: this.comments.map(comment => ({
      id: comment._id,
      user: {
        id: comment.user,
        name: comment.username,
        photo: comment.userPhoto
      },
      text: comment.text,
      createdAt: comment.createdAt
    })),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
