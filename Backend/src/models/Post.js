import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Post content cannot be more than 2000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    enum: ['Question', 'Tips', 'Suggest', 'Experience', 'Market', 'Weather', 'General'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Reply cannot be more than 300 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    platform: {
      type: String,
      enum: ['facebook', 'twitter', 'whatsapp', 'telegram', 'internal'],
      default: 'internal'
    }
  }],
  location: {
    type: String,
    trim: true
  },
  crop: {
    type: String,
    trim: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  bestAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  reported: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'harassment', 'other'],
      required: true
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ crop: 1 });
postSchema.index({ isActive: 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Method to check if user has liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Pre-save middleware to update resolvedAt when isResolved is set
postSchema.pre('save', function(next) {
  if (this.isModified('isResolved') && this.isResolved && !this.resolvedAt) {
    this.resolvedAt = new Date();
  } else if (this.isModified('isResolved') && !this.isResolved) {
    this.resolvedAt = null;
    this.resolvedBy = null;
    this.bestAnswer = null;
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;