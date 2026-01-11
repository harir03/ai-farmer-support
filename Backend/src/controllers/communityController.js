import { CommunityGroup, User } from '../models/index.js';
import mongoose from 'mongoose';

// Create a new community group
export const createCommunityGroup = async (req, res) => {
  try {
    const groupData = {
      ...req.body,
      admin: req.user.userId,
      members: [{
        user: req.user.userId,
        role: 'admin',
        joinedAt: new Date()
      }]
    };

    const group = new CommunityGroup(groupData);
    await group.save();
    await group.populate('admin', 'name profilePicture');
    await group.populate('members.user', 'name profilePicture');

    res.status(201).json({
      success: true,
      message: 'Community group created successfully',
      data: { group }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all community groups
export const getCommunityGroups = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      cropType, 
      region, 
      privacy = 'public',
      search,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true, privacy };
    
    if (category) {
      filter.category = category;
    }
    
    if (cropType) {
      filter.cropType = new RegExp(cropType, 'i');
    }
    
    if (region) {
      filter.region = new RegExp(region, 'i');
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const groups = await CommunityGroup.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('admin', 'name profilePicture')
      .populate('members.user', 'name profilePicture')
      .lean();

    const total = await CommunityGroup.countDocuments(filter);

    // Add virtual fields
    const groupsWithCounts = groups.map(group => ({
      ...group,
      memberCount: group.members.length,
      isMember: group.members.some(member => member.user._id.toString() === req.user.userId)
    }));

    res.status(200).json({
      success: true,
      data: {
        groups: groupsWithCounts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get community group by ID
export const getCommunityGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID'
      });
    }

    const group = await CommunityGroup.findOne({ _id: id, isActive: true })
      .populate('admin', 'name profilePicture location')
      .populate('moderators', 'name profilePicture location')
      .populate('members.user', 'name profilePicture location')
      .populate('joinRequests.user', 'name profilePicture location');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Community group not found'
      });
    }

    // Check if user is member
    const isMember = group.members.some(member => member.user._id.toString() === req.user.userId);
    const canModerate = group.admin._id.toString() === req.user.userId || 
                       group.moderators.some(mod => mod._id.toString() === req.user.userId);

    const groupData = {
      ...group.toObject(),
      memberCount: group.members.length,
      isMember,
      canModerate
    };

    res.status(200).json({
      success: true,
      data: { group: groupData }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update community group
export const updateCommunityGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID'
      });
    }

    // Only allow admin to update
    const group = await CommunityGroup.findOneAndUpdate(
      { _id: id, admin: req.user.userId },
      updates,
      { new: true, runValidators: true }
    ).populate('admin', 'name profilePicture');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not authorized to update this group'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Community group updated successfully',
      data: { group }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete community group
export const deleteCommunityGroup = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID'
      });
    }

    // Only allow admin to delete (soft delete by setting isActive to false)
    const group = await CommunityGroup.findOneAndUpdate(
      { _id: id, admin: req.user.userId },
      { isActive: false },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not authorized to delete this group'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Community group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join community group
export const joinCommunityGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID'
      });
    }

    const group = await CommunityGroup.findOne({ _id: id, isActive: true });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Community group not found'
      });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => member.user.toString() === userId);

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Check if group has reached member limit
    if (group.members.length >= group.memberLimit) {
      return res.status(400).json({
        success: false,
        message: 'Group has reached its member limit'
      });
    }

    if (group.privacy === 'public') {
      // Direct join for public groups
      group.members.push({
        user: userId,
        role: 'member',
        joinedAt: new Date()
      });

      await group.save();

      res.status(200).json({
        success: true,
        message: 'Successfully joined the community group'
      });
    } else {
      // Join request for private groups
      const existingRequest = group.joinRequests.find(request => 
        request.user.toString() === userId && request.status === 'pending'
      );

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You have already sent a join request'
        });
      }

      group.joinRequests.push({
        user: userId,
        message,
        requestedAt: new Date(),
        status: 'pending'
      });

      await group.save();

      res.status(200).json({
        success: true,
        message: 'Join request sent successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Leave community group
export const leaveCommunityGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID'
      });
    }

    const group = await CommunityGroup.findOne({ _id: id, isActive: true });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Community group not found'
      });
    }

    // Check if user is admin
    if (group.admin.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot leave the group. Transfer admin rights first or delete the group.'
      });
    }

    // Remove user from members
    group.members = group.members.filter(member => member.user.toString() !== userId);
    
    // Remove from moderators if applicable
    group.moderators = group.moderators.filter(mod => mod.toString() !== userId);

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the community group'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Handle join request (approve/reject)
export const handleJoinRequest = async (req, res) => {
  try {
    const { groupId, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID or request ID'
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either approve or reject'
      });
    }

    const group = await CommunityGroup.findOne({ _id: groupId, isActive: true });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Community group not found'
      });
    }

    // Check if user can moderate (admin or moderator)
    const canModerate = group.admin.toString() === req.user.userId || 
                       group.moderators.some(mod => mod.toString() === req.user.userId);

    if (!canModerate) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to handle join requests'
      });
    }

    const joinRequest = group.joinRequests.id(requestId);

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Join request has already been processed'
      });
    }

    if (action === 'approve') {
      // Add user to members
      group.members.push({
        user: joinRequest.user,
        role: 'member',
        joinedAt: new Date()
      });

      joinRequest.status = 'approved';
    } else {
      joinRequest.status = 'rejected';
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: `Join request ${action}d successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's community groups
export const getUserCommunityGroups = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const groups = await CommunityGroup.find({
      'members.user': req.user.userId,
      isActive: true
    })
      .sort({ 'members.joinedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('admin', 'name profilePicture')
      .lean();

    const total = await CommunityGroup.countDocuments({
      'members.user': req.user.userId,
      isActive: true
    });

    // Add virtual fields
    const groupsWithCounts = groups.map(group => ({
      ...group,
      memberCount: group.members.length,
      userRole: group.members.find(member => member.user.toString() === req.user.userId)?.role
    }));

    res.status(200).json({
      success: true,
      data: {
        groups: groupsWithCounts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};