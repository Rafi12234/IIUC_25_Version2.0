/**
 * Job Controller
 * Handles job listing operations
 */

import Job from '../models/Job.js';

/**
 * @route   GET /api/jobs
 * @desc    Get all jobs with optional filters
 * @access  Public
 * @query   ?type=Internship&location=Remote&experienceLevel=Fresher
 */
export const getJobs = async (req, res) => {
  try {
    const { type, location, experienceLevel, skill } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' }; // Case-insensitive partial match
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (skill) filter.requiredSkills = { $in: [skill] }; // Match if skill is in array

    const jobs = await Job.find(filter).sort({ postedAt: -1 }); // Sort by most recent

    res.json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job by ID
 * @access  Public
 */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job by ID error:', error);
    
    // Check if error is due to invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
