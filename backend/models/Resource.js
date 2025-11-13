/**
 * Resource Model
 * Represents learning resources (courses, tutorials, etc.)
 */

import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true,
      // e.g., "Coursera", "Udemy", "YouTube", "FreeCodeCamp"
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
    },
    relatedSkills: {
      type: [String],
      required: [true, 'Related skills are needed'],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'At least one related skill is required',
      },
    },
    cost: {
      type: String,
      enum: ['Free', 'Paid', 'Freemium'],
      default: 'Free',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
resourceSchema.index({ relatedSkills: 1 });
resourceSchema.index({ cost: 1 });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
