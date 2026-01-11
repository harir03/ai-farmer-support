import mongoose from 'mongoose';

const communityGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Group description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Group admin is required']
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  category: {
    type: String,
    enum: ['crop_specific', 'region_specific', 'technique', 'market', 'general', 'expert_advice'],
    required: true
  },
  cropType: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String
  },
  rules: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  memberLimit: {
    type: Number,
    default: 1000,
    min: 10
  },
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Request message cannot be more than 200 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  stats: {
    totalPosts: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
communityGroupSchema.index({ category: 1, isActive: 1 });
communityGroupSchema.index({ cropType: 1 });
communityGroupSchema.index({ region: 1 });
communityGroupSchema.index({ privacy: 1, isActive: 1 });
communityGroupSchema.index({ tags: 1 });

// Virtual for member count
communityGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if user is member
communityGroupSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if user is admin or moderator
communityGroupSchema.methods.canModerate = function(userId) {
  const userMember = this.members.find(member => member.user.toString() === userId.toString());
  return userMember && ['admin', 'moderator'].includes(userMember.role);
};

// Pre-save middleware to update member count
communityGroupSchema.pre('save', function(next) {
  this.stats.totalMembers = this.members.length;
  next();
});

const CommunityGroup = mongoose.model('CommunityGroup', communityGroupSchema);

export default CommunityGroup;