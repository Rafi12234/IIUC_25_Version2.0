/**
 * Recommendation Controller
 * Implements transparent skill-based matching logic
 * Returns jobs and resources that match user's skills and career track
 */

import User from '../models/User.js';
import Job from '../models/Job.js';
import Resource from '../models/Resource.js';

/**
 * @route   GET /api/recommendations/:userId
 * @desc    Get personalized job and resource recommendations
 * @access  Public
 * @returns Jobs and resources with matched skills and reasoning
 */
export const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userSkills = user.skills || [];
    const userCareerTrack = user.careerTrack;
    const userExperienceLevel = user.experienceLevel;

    // Fetch all jobs and resources
    const allJobs = await Job.find();
    const allResources = await Resource.find();

    // --- JOB MATCHING LOGIC ---
    const jobMatches = allJobs
      .map((job) => {
        // Find skills that overlap between user and job
        const matchedSkills = job.requiredSkills.filter((skill) =>
          userSkills.some((userSkill) => userSkill.toLowerCase() === skill.toLowerCase())
        );

        // Check if experience level is appropriate
        const experienceLevelMatch = 
          job.experienceLevel === userExperienceLevel || 
          job.experienceLevel === 'Student' || 
          job.experienceLevel === 'Fresher';

        return {
          job,
          matchedSkills,
          matchCount: matchedSkills.length,
          experienceLevelMatch,
        };
      })
      .filter((match) => match.matchCount > 0) // Only include jobs with at least one matched skill
      .sort((a, b) => {
        // Sort by: 1) experience match, 2) number of matched skills
        if (a.experienceLevelMatch !== b.experienceLevelMatch) {
          return b.experienceLevelMatch - a.experienceLevelMatch;
        }
        return b.matchCount - a.matchCount;
      })
      .slice(0, 10) // Top 10 recommendations
      .map((match) => ({
        ...match.job.toObject(),
        matchedSkills: match.matchedSkills,
        matchReason: `Matches ${match.matchCount} skill${match.matchCount > 1 ? 's' : ''}: ${match.matchedSkills.join(', ')}`,
      }));

    // --- RESOURCE MATCHING LOGIC ---
    const resourceMatches = allResources
      .map((resource) => {
        // Find skills that overlap
        const matchedSkills = resource.relatedSkills.filter((skill) =>
          userSkills.some((userSkill) => userSkill.toLowerCase() === skill.toLowerCase())
        );

        // Also recommend resources that could help with career track
        const careerTrackMatch = resource.relatedSkills.some(
          (skill) => skill.toLowerCase().includes(userCareerTrack.toLowerCase())
        );

        return {
          resource,
          matchedSkills,
          matchCount: matchedSkills.length,
          careerTrackMatch,
        };
      })
      .filter((match) => match.matchCount > 0 || match.careerTrackMatch)
      .sort((a, b) => {
        // Prioritize skill matches, then career track
        if (a.matchCount !== b.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return b.careerTrackMatch - a.careerTrackMatch;
      })
      .slice(0, 10) // Top 10 recommendations
      .map((match) => {
        let reason = '';
        if (match.matchCount > 0) {
          reason = `Matches ${match.matchCount} skill${match.matchCount > 1 ? 's' : ''}: ${match.matchedSkills.join(', ')}`;
        } else if (match.careerTrackMatch) {
          reason = `Relevant to your career track: ${userCareerTrack}`;
        }

        return {
          ...match.resource.toObject(),
          matchedSkills: match.matchedSkills,
          matchReason: reason,
        };
      });

    // Return recommendations
    res.json({
      user: {
        id: user._id,
        name: user.name,
        skills: userSkills,
        careerTrack: userCareerTrack,
        experienceLevel: userExperienceLevel,
      },
      recommendations: {
        jobs: jobMatches,
        resources: resourceMatches,
      },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
