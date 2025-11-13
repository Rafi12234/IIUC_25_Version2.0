/**
 * Job Model
 * Represents job listings with requirements and details
 */

import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Required skills are needed'],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'At least one skill is required',
      },
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ['Student', 'Fresher', 'Junior', 'Mid-level', 'Senior'],
    },
    type: {
      type: String,
      required: true,
      enum: ['Internship', 'Part-time', 'Full-time', 'Freelance', 'Contract'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
jobSchema.index({ type: 1, experienceLevel: 1 });
jobSchema.index({ requiredSkills: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
