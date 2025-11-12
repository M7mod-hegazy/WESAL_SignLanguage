const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or Firebase UID string
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorPhoto: String,
  media: {
    type: mongoose.Schema.Types.Mixed // Can be string (mediaRef) or object {type, url}
  },
  caption: {
    type: String,
    maxlength: 200
  },
  views: [{
    type: mongoose.Schema.Types.Mixed // Can be ObjectId or Firebase UID string
  }],
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, {
  timestamps: true
});

// Index for faster queries
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });

// Auto-delete expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to format story response
storySchema.methods.toResponseFormat = function(currentUserId) {
  return {
    id: this._id,
    author: {
      id: this.author,
      name: this.authorName,
      photo: this.authorPhoto
    },
    media: this.media,
    caption: this.caption,
    viewCount: this.views.length,
    isViewed: currentUserId ? this.views.includes(currentUserId) : false,
    createdAt: this.createdAt,
    expiresAt: this.expiresAt
  };
};

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
