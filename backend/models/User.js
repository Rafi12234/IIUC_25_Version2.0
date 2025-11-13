/**
 * User Model
 * Represents platform users (students, job seekers)
 * Stores profile data, skills, experience, and career preferences
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    education: {
      type: String,
      enum: ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'],
      default: 'Undergraduate',
    },
    experienceLevel: {
      type: String,
      enum: ['Student', 'Fresher', 'Junior', 'Mid-level', 'Senior'],
      default: 'Student',
    },
    careerTrack: {
      type: String,
      enum: [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'UI/UX Design',
        'Digital Marketing',
        'Content Writing',
        'Graphic Design',
        'Business',
        'Other',
      ],
      default: 'Web Development',
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceDesc: {
      type: String,
      default: '',
    },
    careerInterests: {
      type: String,
      default: '',
    },
    cvText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Hash password before saving (middleware)
userSchema.pre('save', async function (next) {
  // Only hash if password is modified or new
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
