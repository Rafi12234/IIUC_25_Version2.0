/**
 * Resource Routes
 * Handles learning resource endpoints
 */

import express from 'express';
import { getResources, getResourceById } from '../controllers/resourceController.js';

const router = express.Router();

// GET /api/resources - Get all resources with optional filters
router.get('/', getResources);

// GET /api/resources/:id - Get resource by ID
router.get('/:id', getResourceById);

export default router;
