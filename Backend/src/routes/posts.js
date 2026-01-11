import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  addReply,
  sharePost,
  getUserPosts,
  reportPost,
  getMockPosts
} from '../controllers/postController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validatePost, validateComment } from '../middleware/validation.js';

const router = express.Router();

// Public routes (with optional auth for better user experience)
router.get('/mock', getMockPosts);
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);

// Protected routes
router.use(authenticateToken); // Apply authentication to all routes below

// Post management
router.post('/', validatePost, createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Post interactions
router.post('/:id/like', toggleLikePost);
router.post('/:id/comments', validateComment, addComment);
router.post('/:postId/comments/:commentId/replies', validateComment, addReply);
router.post('/:id/share', sharePost);
router.post('/:id/report', reportPost);

// User-specific routes
router.get('/user/my-posts', getUserPosts);

export default router;