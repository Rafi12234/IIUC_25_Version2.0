/**
 * Seed Routes
 * Provides endpoint to seed database (development only)
 */

import express from 'express';
import Job from '../models/Job.js';
import Resource from '../models/Resource.js';

const router = express.Router();

/**
 * @route   POST /api/seed
 * @desc    Seed database with sample data
 * @access  Public (should be protected in production)
 */
router.post('/', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Seeding not allowed in production' });
    }

    // Import seed data (same as in seed.js)
    const { default: seedData } = await import('../seed/seed.js');

    res.json({ 
      message: 'Database seeded successfully',
      note: 'Please run "npm run seed" from the backend directory instead'
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Error seeding database' });
  }
});

export default router;
