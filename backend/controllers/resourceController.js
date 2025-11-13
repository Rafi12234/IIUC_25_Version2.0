/**
 * Resource Controller
 * Handles learning resource operations
 */

import Resource from '../models/Resource.js';

/**
 * @route   GET /api/resources
 * @desc    Get all resources with optional filters
 * @access  Public
 * @query   ?skill=JavaScript&cost=Free&platform=Coursera
 */
export const getResources = async (req, res) => {
  try {
    const { skill, cost, platform } = req.query;

    // Build filter object
    const filter = {};
    if (cost) filter.cost = cost;
    if (platform) filter.platform = { $regex: platform, $options: 'i' }; // Case-insensitive
    if (skill) filter.relatedSkills = { $in: [skill] }; // Match if skill is in array

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    res.json({
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/resources/:id
 * @desc    Get single resource by ID
 * @access  Public
 */
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get resource by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
