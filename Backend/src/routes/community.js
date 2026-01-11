import express from 'express';
import {
  createCommunityGroup,
  getCommunityGroups,
  getCommunityGroupById,
  updateCommunityGroup,
  deleteCommunityGroup,
  joinCommunityGroup,
  leaveCommunityGroup,
  handleJoinRequest,
  getUserCommunityGroups
} from '../controllers/communityController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validateCommunityGroup } from '../middleware/validation.js';

const router = express.Router();

// Public routes (with optional auth)
router.get('/', optionalAuth, getCommunityGroups);
router.get('/:id', optionalAuth, getCommunityGroupById);

// Protected routes
router.use(authenticateToken); // Apply authentication to all routes below

// Community group management
router.post('/', validateCommunityGroup, createCommunityGroup);
router.put('/:id', updateCommunityGroup);
router.delete('/:id', deleteCommunityGroup);

// Group membership
router.post('/:id/join', joinCommunityGroup);
router.post('/:id/leave', leaveCommunityGroup);

// Join request management
router.post('/:groupId/requests/:requestId', handleJoinRequest);

// User-specific routes
router.get('/user/my-groups', getUserCommunityGroups);

export default router;