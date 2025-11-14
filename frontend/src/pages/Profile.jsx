/**
 * Profile Page
 * Edit user profile, skills, and CV
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Edit, Save, X, GraduationCap, Briefcase, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService, applicationsService } from '../services/firestoreService';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    experience: '',
    location: '',
    education: '',
    careerTrack: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const [profileData, applicationsData] = await Promise.all([
        userService.getUserProfile(currentUser.uid),
        applicationsService.getUserApplications(currentUser.uid)
      ]);
      
      setProfile(profileData);
      setApplications(applicationsData);
      
      // Set form data for editing
      if (profileData?.profile) {
        setFormData({
          bio: profileData.profile.bio || '',
          skills: profileData.profile.skills || [],
          experience: profileData.profile.experience || '',
          location: profileData.profile.location || '',
          education: profileData.profile.education || '',
          careerTrack: profileData.profile.careerTrack || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      await userService.updateProfile(currentUser.uid, updatedData);
      setProfile(prev => ({ ...prev, profile: updatedData }));
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateProfile(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      setFormData(prev => ({
        ...prev,
        skills: value.split(',').map(skill => skill.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-base py-12 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="neon-card p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#A855F7] to-[#D500F9] rounded-full flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold glow-text">{currentUser?.displayName || 'User'}</h1>
                <p className="text-muted flex items-center">
                  <Mail size={16} className="mr-2" />
                  {currentUser?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="btn-primary flex items-center space-x-2"
            >
              {editing ? <X size={16} /> : <Edit size={16} />}
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Profile Form */}
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <GraduationCap size={16} className="inline mr-1" />
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your education background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Target size={16} className="inline mr-1" />
                    Career Track
                  </label>
                  <input
                    type="text"
                    name="careerTrack"
                    value={formData.careerTrack}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your career focus"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills.join(', ')}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="JavaScript, React, Node.js, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Briefcase size={16} className="inline mr-1" />
                    Experience Level
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Student, Junior, Senior, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <GraduationCap size={16} className="mr-2" />
                    Education
                  </h3>
                  <p className="text-muted">{profile?.profile?.education || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Target size={16} className="mr-2" />
                    Career Track
                  </h3>
                  <p className="text-muted">{profile?.profile?.careerTrack || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted">{profile?.profile?.bio || 'No bio available'}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.profile?.skills?.length > 0 ? (
                    profile.profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[rgba(168,85,247,0.1)] text-primary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted">No skills added</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Briefcase size={16} className="mr-2" />
                    Experience
                  </h3>
                  <p className="text-muted">{profile?.profile?.experience || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted">{profile?.profile?.location || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Applications Section */}
        <div className="neon-card p-8">
          <h2 className="text-2xl font-bold glow-text mb-6">My Applications</h2>
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-main">Job ID: {app.jobId}</p>
                      <p className="text-sm text-muted">
                        Status: <span className="capitalize">{app.status}</span>
                      </p>
                      <p className="text-sm text-muted">
                        Applied: {app.appliedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No applications yet. Start applying to jobs!</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
