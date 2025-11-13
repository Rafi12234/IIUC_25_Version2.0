/**
 * Recommendation Routes
 * Handles personalized recommendations
 */

import express from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';

const router = express.Router();

// GET /api/recommendations/:userId - Get personalized recommendations
router.get('/:userId', getRecommendations);

export default router;
