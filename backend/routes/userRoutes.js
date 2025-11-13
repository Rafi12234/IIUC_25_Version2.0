/**
 * User Routes
 * Handles user profile operations
 */

import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users/me - Get current user profile (protected)
router.get('/me', protect, getUserProfile);

// PUT /api/users/:id - Update user profile (protected)
router.put('/:id', protect, updateUserProfile);

export default router;
