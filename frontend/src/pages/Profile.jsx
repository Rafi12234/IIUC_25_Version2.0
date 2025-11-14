/**
 * Profile Page
 * Edit user profile, skills, and CV
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Edit, Save, X, GraduationCap, Briefcase, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { applicationsService } from '../services/firestoreService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { CAREER_TRACKS, EXPERIENCE_LEVELS, LOCATIONS } from '../constants/jobConstants';
import { searchSkills } from '../constants/skillsDictionary';
import ProfilePDFDownload from '../components/ProfilePDFDownload';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    tools: [],
    experienceLevel: '',
    preferredTrack: '',
    location: '',
    education: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData = { email: currentUser.email, displayName: currentUser.displayName };
      
      if (userDoc.exists()) {
        userData = { ...userData, ...userDoc.data() };
      }
      
      setProfile(userData);
      
      // Set form data for editing
      setFormData({
        bio: userData.bio || '',
        skills: userData.skills || [],
        tools: userData.tools || [],
        experienceLevel: userData.experienceLevel || '',
        preferredTrack: userData.preferredTrack || '',
        location: userData.location || '',
        education: userData.education || ''
      });
      
      // Calculate profile completion
      calculateCompletion(userData);
      
      // Load applications - wrapped in try-catch to handle index errors
      try {
        const applicationsData = await applicationsService.getUserApplications(currentUser.uid);
        setApplications(applicationsData);
      } catch (appError) {
        console.warn('Could not load applications (index may be needed):', appError.message);
        // Continue without applications - don't show error to user
        setApplications([]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    }
    setLoading(false);
  };

  const calculateCompletion = (data) => {
    const fields = [
      { key: 'bio', weight: 10 },
      { key: 'skills', weight: 20, check: (val) => val && val.length > 0 },
      { key: 'tools', weight: 20, check: (val) => val && val.length > 0 },
      { key: 'experienceLevel', weight: 15 },
      { key: 'preferredTrack', weight: 15 },
      { key: 'location', weight: 10 },
      { key: 'education', weight: 10 }
    ];
    
    let completed = 0;
    fields.forEach(field => {
      const value = data[field.key];
      const isComplete = field.check 
        ? field.check(value) 
        : value && value.toString().trim() !== '';
      
      if (isComplete) {
        completed += field.weight;
      }
    });
    
    setProfileCompletion(completed);
  };

  const handleUpdateProfile = async (updatedData) => {
    // Validate mandatory fields
    if (!updatedData.skills || updatedData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }
    if (!updatedData.tools || updatedData.tools.length === 0) {
      toast.error('Please add at least one tool/technology');
      return;
    }
    if (!updatedData.experienceLevel) {
      toast.error('Please select your experience level');
      return;
    }
    if (!updatedData.preferredTrack) {
      toast.error('Please select your preferred career track');
      return;
    }

    try {
      setSaving(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        ...updatedData,
        updatedAt: new Date().toISOString()
      });
      
      setProfile(prev => ({ ...prev, ...updatedData }));
      calculateCompletion(updatedData);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateProfile(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = (skill = null) => {
    const skillToAdd = skill || skillInput.trim();
    if (skillToAdd && !formData.skills.includes(skillToAdd)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillToAdd]
      }));
      setSkillInput('');
      setShowSuggestions(false);
      setSkillSuggestions([]);
    }
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    
    if (value.trim().length > 0) {
      const suggestions = searchSkills(value);
      setSkillSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSkillSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
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
        <div className="neon-card p-4 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#A855F7] to-[#D500F9] rounded-full flex items-center justify-center flex-shrink-0">
                <User size={24} className="text-white sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold glow-text truncate">{currentUser?.displayName || 'User'}</h1>
                <p className="text-muted flex items-center text-sm sm:text-base">
                  <Mail size={14} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{currentUser?.email}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              {editing ? <X size={16} /> : <Edit size={16} />}
              <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Profile Completion Bar */}
          <div className="mb-6 p-4 bg-[#11152B] rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-main">Profile Completion</span>
              <span className={`text-lg font-bold ${profileCompletion === 100 ? 'text-green-400' : 'text-primary'}`}>
                {profileCompletion}%
              </span>
            </div>
            <div className="h-3 bg-[#0B0E1C] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  profileCompletion === 100 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-[#A855F7] to-[#D500F9]'
                }`}
              />
            </div>
            {profileCompletion < 100 && (
              <p className="text-xs text-muted mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                Complete your profile to get better job matches
              </p>
            )}
            {profileCompletion === 100 && (
              <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                <CheckCircle size={12} />
                Your profile is complete!
              </p>
            )}
          </div>

          {/* Profile Form */}
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mandatory Fields Alert */}
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm text-primary flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span><strong>Required fields</strong> are marked with <span className="text-red-400">*</span></span>
                </p>
              </div>

              {/* Skills - MANDATORY */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Skills <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-muted mb-2">Add your technical skills (start typing for suggestions)</p>
                <div className="relative">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={handleSkillInputChange}
                      onKeyPress={handleKeyPress}
                      onFocus={() => skillInput.trim() && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="input-field flex-1"
                      placeholder="Start typing: React, Python, AWS..."
                    />
                    <button
                      type="button"
                      onClick={() => addSkill()}
                      className="btn-primary px-6"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Autocomplete Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && skillSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full bg-[#11152B] border border-primary/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
                      >
                        {skillSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addSkill(suggestion)}
                            className="w-full text-left px-4 py-2 hover:bg-primary/20 transition-colors text-main text-sm border-b border-white/5 last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-sm text-primary flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {formData.skills.length === 0 && (
                  <p className="text-xs text-red-400">Please add at least one skill</p>
                )}
              </div>

              {/* Tools/Technologies - MANDATORY */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tools/Technologies <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-muted mb-2">Add tools and technologies you work with (e.g., VS Code, Git, Docker, Jenkins)</p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = toolInput.trim();
                        if (value && !formData.tools.includes(value)) {
                          setFormData(prev => ({ ...prev, tools: [...prev.tools, value] }));
                          setToolInput('');
                        }
                      }
                    }}
                    className="input-field flex-1"
                    placeholder="VS Code, Git, Docker, Jenkins..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const value = toolInput.trim();
                      if (value && !formData.tools.includes(value)) {
                        setFormData(prev => ({ ...prev, tools: [...prev.tools, value] }));
                        setToolInput('');
                      }
                    }}
                    className="btn-primary px-6"
                  >
                    Add
                  </button>
                </div>
                {formData.tools.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-400/40 rounded-full text-sm text-purple-300 flex items-center gap-2"
                      >
                        {tool}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tools: prev.tools.filter(t => t !== tool) }))}
                          className="hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {formData.tools.length === 0 && (
                  <p className="text-xs text-red-400">Please add at least one tool/technology</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Experience Level - MANDATORY */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Briefcase size={16} className="inline mr-1" />
                    Experience Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select experience level</option>
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Preferred Track - MANDATORY */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Target size={16} className="inline mr-1" />
                    Preferred Career Track <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="preferredTrack"
                    value={formData.preferredTrack}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select your preferred track</option>
                    {CAREER_TRACKS.map(track => (
                      <option key={track} value={track}>{track}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
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

              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Mandatory Fields */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-3 text-main flex items-center gap-2">
                  <Target size={18} />
                  Job Matching Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center text-muted">
                      <Briefcase size={14} className="mr-2" />
                      Experience Level {!profile?.experienceLevel && <span className="text-red-400 ml-1">*</span>}
                    </h4>
                    <p className={profile?.experienceLevel ? "text-main capitalize" : "text-red-400"}>
                      {profile?.experienceLevel || 'Not set - Required!'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center text-muted">
                      <Target size={14} className="mr-2" />
                      Career Track {!profile?.preferredTrack && <span className="text-red-400 ml-1">*</span>}
                    </h4>
                    <p className={profile?.preferredTrack ? "text-main capitalize" : "text-red-400"}>
                      {profile?.preferredTrack || 'Not set - Required!'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2 text-muted">
                    Skills {(!profile?.skills || profile.skills.length === 0) && <span className="text-red-400">*</span>}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/20 border border-primary/40 text-primary rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-red-400">No skills added - Required!</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2 text-muted">
                    Tools/Technologies {(!profile?.tools || profile.tools.length === 0) && <span className="text-red-400">*</span>}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.tools?.length > 0 ? (
                      profile.tools.map((tool, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-500/20 border border-purple-400/40 text-purple-300 rounded-full text-sm"
                        >
                          {tool}
                        </span>
                      ))
                    ) : (
                      <p className="text-red-400">No tools/technologies added - Required!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <GraduationCap size={16} className="mr-2" />
                    Education
                  </h3>
                  <p className="text-muted">{profile?.education || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted">{profile?.location || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted">{profile?.bio || 'No bio available'}</p>
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

        {/* Export / Download Section */}
        <div className="mt-10 p-6 rounded-2xl bg-[#11121A] border border-[#1F2030]">
          <h3 className="text-lg font-semibold text-white">Export / Download</h3>
          <p className="text-sm text-gray-400 mt-1">
            Download your profile information as a PDF.
          </p>
          <ProfilePDFDownload profile={profile} />
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
