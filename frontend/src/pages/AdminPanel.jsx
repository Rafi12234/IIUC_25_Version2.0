/**
 * Admin Panel - Job Management
 * Create, edit, and manage job postings
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Edit, Trash2, X, Save, Building2, DollarSign, MapPin, Target, Award, Code, Users } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';
import { JOB_TITLES, CAREER_TRACKS, EXPERIENCE_LEVELS, LOCATIONS } from '../constants/jobConstants';
import { searchSkills } from '../constants/skillsDictionary';

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    salary: '',
    location: '',
    skillsRequired: [],
    experienceRequired: '',
    track: ''
  });
  const [customTitle, setCustomTitle] = useState('');
  const [showCustomTitle, setShowCustomTitle] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsRef = collection(db, 'jobs');
      const snapshot = await getDocs(jobsRef);
      
      const jobsData = [];
      snapshot.forEach((docSnap) => {
        jobsData.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      description: '',
      salary: '',
      location: '',
      skillsRequired: [],
      experienceRequired: '',
      track: ''
    });
    setSkillInput('');
    setSkillSuggestions([]);
    setShowSkillSuggestions(false);
    setCustomTitle('');
    setShowCustomTitle(false);
    setEditingJob(null);
    setShowForm(false);
  };

  const handleEdit = (job) => {
    setEditingJob(job.id);
    const isCustom = !JOB_TITLES.includes(job.title);
    setFormData({
      title: isCustom ? 'custom' : job.title || '',
      company: job.company || '',
      description: job.description || '',
      salary: job.salary || '',
      location: job.location || '',
      skillsRequired: job.skillsRequired || [],
      experienceRequired: job.experienceRequired || '',
      track: job.track || ''
    });
    if (isCustom) {
      setCustomTitle(job.title);
      setShowCustomTitle(true);
    }
    setShowForm(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      toast.success('Job deleted successfully');
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const addSkill = (skill = null) => {
    const skillToAdd = skill || skillInput.trim();
    if (skillToAdd && !formData.skillsRequired.includes(skillToAdd)) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillToAdd]
      }));
      setSkillInput('');
      setShowSkillSuggestions(false);
      setSkillSuggestions([]);
    }
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    
    if (value.trim().length > 0) {
      const suggestions = searchSkills(value);
      setSkillSuggestions(suggestions);
      setShowSkillSuggestions(suggestions.length > 0);
    } else {
      setSkillSuggestions([]);
      setShowSkillSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Count applicants for a specific job
  const countApplicants = (job) => {
    let count = 0;
    for (const key in job) {
      if (key.startsWith('Applicant_')) {
        count++;
      }
    }
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Determine the actual title
    const actualTitle = formData.title === 'custom' ? customTitle.trim() : formData.title;
    
    // Validation
    if (!actualTitle) {
      toast.error('Job title is required');
      return;
    }
    if (!formData.company.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return;
    }
    if (!formData.salary.trim()) {
      toast.error('Salary is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (formData.skillsRequired.length === 0) {
      toast.error('At least one skill is required');
      return;
    }
    if (!formData.experienceRequired) {
      toast.error('Experience level is required');
      return;
    }
    if (!formData.track) {
      toast.error('Career track is required');
      return;
    }

    try {
      const jobData = {
        ...formData,
        title: actualTitle,
        updatedAt: new Date().toISOString()
      };

      if (editingJob) {
        // Update existing job
        await updateDoc(doc(db, 'jobs', editingJob), jobData);
        toast.success('Job updated successfully');
      } else {
        // Create new job
        jobData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'jobs'), jobData);
        toast.success('Job created successfully');
      }

      resetForm();
      loadJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  return (
    <AdminLayout>
      <div className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold glow-text mb-2">Jobs Management</h1>
              <p className="text-muted">Create, edit, and manage job postings</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary px-6 py-3 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Post New Job
            </button>
          </div>

        {/* Job Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => resetForm()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a2e] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-[#A855F7] to-[#D500F9] p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Briefcase size={28} />
                    {editingJob ? 'Edit Job' : 'Post New Job'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-main">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        setShowCustomTitle(e.target.value === 'custom');
                      }}
                      className="input-field"
                      required
                    >
                      <option value="">Select a job title</option>
                      {JOB_TITLES.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                      <option value="custom">Custom (Enter your own)</option>
                    </select>
                    
                    {showCustomTitle && (
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Enter custom job title"
                        className="input-field mt-2"
                        required
                      />
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-main">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g., Tech Corp"
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-main">
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed job description, responsibilities, requirements..."
                      className="input-field min-h-[150px]"
                      required
                    />
                  </div>

                  {/* Salary and Location Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-main">
                        Salary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="e.g., 50000"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-main">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select location</option>
                        {LOCATIONS.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Skills Required */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-main">
                      Skills Required <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-muted mb-2">Start typing for suggestions from our skills library</p>
                    <div className="relative">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={handleSkillInputChange}
                          onKeyPress={handleKeyPress}
                          onFocus={() => skillInput.trim() && setShowSkillSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                          placeholder="Start typing: React, Python, AWS..."
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => addSkill()}
                          className="btn-outline-neon px-6"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Autocomplete Suggestions Dropdown */}
                      <AnimatePresence>
                        {showSkillSuggestions && skillSuggestions.length > 0 && (
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
                    <div className="flex flex-wrap gap-2">
                      {formData.skillsRequired.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level and Track Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-main">
                        Experience Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.experienceRequired}
                        onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select experience level</option>
                        {EXPERIENCE_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-main">
                        Career Track <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.track}
                        onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select career track</option>
                        {CAREER_TRACKS.map(track => (
                          <option key={track} value={track}>{track}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 btn-outline-neon py-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                    >
                      <Save size={20} />
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="text-primary glow-icon mx-auto mb-4 animate-pulse" />
            <p className="text-muted">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="neon-card p-12 text-center">
            <Briefcase size={64} className="text-muted mx-auto mb-4" />
            <h3 className="text-2xl font-bold glow-text mb-2">No Jobs Posted Yet</h3>
            <p className="text-muted mb-6">Click "Post New Job" to create your first job posting</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neon-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold glow-text mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-muted text-sm flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 size={16} />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={16} />
                        ৳{job.salary}
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                        <Users size={16} />
                        {countApplicants(job)} Applicants
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(job)}
                      className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <p className="text-muted mb-4 line-clamp-2">{job.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Code size={16} />
                      <span className="text-xs font-semibold">Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.skillsRequired?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired?.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-white/10 text-muted rounded">
                          +{job.skillsRequired.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Award size={16} />
                      <span className="text-xs font-semibold">Experience</span>
                    </div>
                    <p className="text-sm text-main">{job.experienceRequired}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Target size={16} />
                      <span className="text-xs font-semibold">Track</span>
                    </div>
                    <p className="text-sm text-main">{job.track}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;
