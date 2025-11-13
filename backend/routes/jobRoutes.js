/**
 * Job Routes
 * Handles job listing endpoints
 */

import express from 'express';
import { getJobs, getJobById } from '../controllers/jobController.js';

const router = express.Router();

// GET /api/jobs - Get all jobs with optional filters
router.get('/', getJobs);

// GET /api/jobs/:id - Get job by ID
router.get('/:id', getJobById);

export default router;
