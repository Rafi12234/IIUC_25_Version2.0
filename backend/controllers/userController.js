/**
 * User Controller
 * Handles user profile operations
 */

import User from '../models/User.js';

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        education: user.education,
        experienceLevel: user.experienceLevel,
        careerTrack: user.careerTrack,
        skills: user.skills,
        experienceDesc: user.experienceDesc,
        careerInterests: user.careerInterests,
        cvText: user.cvText,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure user can only update their own profile
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.education = req.body.education || user.education;
    user.experienceLevel = req.body.experienceLevel || user.experienceLevel;
    user.careerTrack = req.body.careerTrack || user.careerTrack;
    user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
    user.experienceDesc = req.body.experienceDesc !== undefined ? req.body.experienceDesc : user.experienceDesc;
    user.careerInterests = req.body.careerInterests !== undefined ? req.body.careerInterests : user.careerInterests;
    user.cvText = req.body.cvText !== undefined ? req.body.cvText : user.cvText;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      education: updatedUser.education,
      experienceLevel: updatedUser.experienceLevel,
      careerTrack: updatedUser.careerTrack,
      skills: updatedUser.skills,
      experienceDesc: updatedUser.experienceDesc,
      careerInterests: updatedUser.careerInterests,
      cvText: updatedUser.cvText,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
