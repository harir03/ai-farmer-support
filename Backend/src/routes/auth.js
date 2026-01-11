import express from 'express';
import {
  authenticatePhone,
  getUserProfile,
  updateUserProfile,
  deleteUser
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', authenticatePhone); // Direct phone authentication

// Protected routes
router.use(authenticateToken); // Apply authentication to all routes below

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.delete('/delete-account', deleteUser);

export default router;