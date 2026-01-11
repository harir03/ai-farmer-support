import { Post, User } from '../models/index.js';
import mongoose from 'mongoose';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, category, tags, images, location, crop } = req.body;

    const post = new Post({
      content,
      author: req.user.userId,
      category,
      tags,
      images,
      location,
      crop
    });

    await post.save();
    await post.populate('author', 'name profilePicture location');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all posts (community feed)
export const getPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      crop, 
      location, 
      tags,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (crop) {
      filter.crop = new RegExp(crop, 'i');
    }
    
    if (location) {
      filter.location = new RegExp(location, 'i');
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name profilePicture location')
      .populate('comments.user', 'name profilePicture')
      .populate('comments.replies.user', 'name profilePicture')
      .lean();

    const total = await Post.countDocuments(filter);

    // Add virtual fields
    const postsWithCounts = posts.map(post => ({
      ...post,
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      shareCount: post.shares.length,
      isLikedByUser: post.likes.some(like => like.user.toString() === req.user.userId)
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: postsWithCounts,
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

// Get post by ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await Post.findOne({ _id: id, isActive: true })
      .populate('author', 'name profilePicture location')
      .populate('comments.user', 'name profilePicture')
      .populate('comments.replies.user', 'name profilePicture')
      .populate('resolvedBy', 'name profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add virtual fields
    const postWithCounts = {
      ...post.toObject(),
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      shareCount: post.shares.length,
      isLikedByUser: post.likes.some(like => like.user.toString() === req.user.userId)
    };

    res.status(200).json({
      success: true,
      data: { post: postWithCounts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    // Only allow post author to update
    const post = await Post.findOneAndUpdate(
      { _id: id, author: req.user.userId },
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'name profilePicture location');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you are not authorized to update this post'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    // Only allow post author to delete (soft delete by setting isActive to false)
    const post = await Post.findOneAndUpdate(
      { _id: id, author: req.user.userId },
      { isActive: false },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or you are not authorized to delete this post'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Like/Unlike post
export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.findIndex(like => like.user.toString() === userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: userId });
    }

    await post.save();
    await post.populate('author', 'name profilePicture location');

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      data: { 
        post,
        likeCount: post.likes.length,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add comment to post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newComment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    await post.populate('comments.user', 'name profilePicture');

    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: addedComment }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add reply to comment
export const addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID or comment ID'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const newReply = {
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    };

    comment.replies.push(newReply);
    await post.save();

    await post.populate('comments.replies.user', 'name profilePicture');

    const addedReply = comment.replies[comment.replies.length - 1];

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: { reply: addedReply }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Share post
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform = 'internal' } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.shares.push({
      user: userId,
      platform,
      sharedAt: new Date()
    });

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post shared successfully',
      data: { shareCount: post.shares.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      author: req.user.userId, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name profilePicture location')
      .lean();

    const total = await Post.countDocuments({ 
      author: req.user.userId, 
      isActive: true 
    });

    // Add virtual fields
    const postsWithCounts = posts.map(post => ({
      ...post,
      likeCount: post.likes.length,
      commentCount: post.comments.length,
      shareCount: post.shares.length
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: postsWithCounts,
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

// Report post
export const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required'
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has already reported this post
    const existingReport = post.reported.find(report => report.user.toString() === userId);

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this post'
      });
    }

    post.reported.push({
      user: userId,
      reason,
      description,
      reportedAt: new Date()
    });

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get mock posts data (fallback when database is unavailable)
export const getMockPosts = async (req, res) => {
  try {
    const mockPosts = [
      {
        _id: '1',
        content: 'My wheat crop is getting spot on the leaves. What should i do? Can anyone suggest?',
        author: { name: 'Ramesh Sharma', profilePicture: null },
        category: 'Question',
        tags: ['wheat', 'disease', 'help'],
        likes: 13,
        comments: 13,
        shares: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isLiked: false
      },
      {
        _id: '2',
        content: 'Great harvest this season! My tomatoes yielded 40% more than last year. The organic fertilizer really worked!',
        author: { name: 'Priya Patel', profilePicture: null },
        category: 'Success',
        tags: ['tomatoes', 'organic', 'harvest'],
        likes: 25,
        comments: 8,
        shares: 5,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        isLiked: false
      },
      {
        _id: '3',
        content: 'Weather forecast shows heavy rains next week. Make sure to cover your crops and check drainage systems.',
        author: { name: 'Amit Kumar', profilePicture: null },
        category: 'Weather Alert',
        tags: ['weather', 'rain', 'protection'],
        likes: 18,
        comments: 12,
        shares: 15,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        isLiked: false
      },
      {
        _id: '4',
        content: 'Sharing my experience with drip irrigation. Reduced water usage by 30% and increased yield. Happy to answer questions!',
        author: { name: 'Sunita Devi', profilePicture: null },
        category: 'Tips',
        tags: ['irrigation', 'water-saving', 'drip'],
        likes: 32,
        comments: 16,
        shares: 8,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        isLiked: false
      },
      {
        _id: '5',
        content: 'Local market price for onions has increased to ₹25/kg. Good time to sell if you have stock!',
        author: { name: 'Raj Singh', profilePicture: null },
        category: 'Market Update',
        tags: ['onions', 'price', 'market'],
        likes: 22,
        comments: 7,
        shares: 12,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
        isLiked: false
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        posts: mockPosts,
        pagination: {
          current: 1,
          pages: 1,
          total: mockPosts.length
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