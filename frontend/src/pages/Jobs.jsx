import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, DollarSign, Building2, Clock, TrendingUp, X, ExternalLink, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8za3ZI4m9gUrYsueUum907vpuKzV8H0Q",
  authDomain: "iiuc25.firebaseapp.com",
  projectId: "iiuc25",
  storageBucket: "iiuc25.firebasestorage.app",
  messagingSenderId: "75690391713",
  appId: "1:75690391713:web:4c72c5316547c8bc68d8e0",
  measurementId: "G-82V42TWJ9J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [applying, setApplying] = useState(false);
  const [notification, setNotification] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch jobs from Firebase
  useEffect(() => {
    loadJobs();
  }, [currentUser]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsRef = collection(db, 'Jobs');
      const snapshot = await getDocs(jobsRef);
      
      const jobsData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Count applicants
        const applicantCount = Object.keys(data).filter(key => 
          key.startsWith('Applicant_')
        ).length;

        // Check if current user has applied
        const hasApplied = currentUser ? Object.keys(data).some(key => 
          key.startsWith('Applicant_') && data[key] === currentUser.email
        ) : false;

        jobsData.push({
          id: doc.id,
          title: doc.id,
          details: data['Job Details'] || data.JobDetails || 'No details available',
          salary: data.Salary || 'Not specified',
          company: data['Company Name'] || data.CompanyName || 'Company not specified',
          applicantCount,
          hasApplied
        });
      });

      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      showNotification('Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle job application
  const handleApply = async (jobId, jobTitle) => {
    if (!currentUser) {
      showNotification('Please sign in to apply for jobs', 'error');
      return;
    }

    try {
      setApplying(true);
      const jobRef = doc(db, 'Jobs', jobId);
      const jobSnap = await getDoc(jobRef);
      
      if (!jobSnap.exists()) {
        showNotification('Job not found', 'error');
        return;
      }

      const jobData = jobSnap.data();
      
      // Check if already applied
      const alreadyApplied = Object.keys(jobData).some(key => 
        key.startsWith('Applicant_') && jobData[key] === currentUser.email
      );

      if (alreadyApplied) {
        showNotification('You have already applied for this job', 'error');
        return;
      }

      // Find next applicant number
      const applicantNumbers = Object.keys(jobData)
        .filter(key => key.startsWith('Applicant_'))
        .map(key => parseInt(key.replace('Applicant_', '')))
        .filter(num => !isNaN(num));

      const nextNumber = applicantNumbers.length > 0 
        ? Math.max(...applicantNumbers) + 1 
        : 1;

      // Add new applicant
      await updateDoc(jobRef, {
        [`Applicant_${nextNumber}`]: currentUser.email
      });

      showNotification(`Successfully applied for ${jobTitle}!`, 'success');
      
      // Reload jobs to update counts
      await loadJobs();
      
      // Close modal if open
      setSelectedJob(null);
    } catch (error) {
      console.error('Error applying:', error);
      showNotification('Failed to apply. Please try again.', 'error');
    } finally {
      setApplying(false);
    }
  };

  // Format salary for display
  const formatSalary = (salary) => {
    if (!salary || salary === 'Not specified') return salary;
    const numericSalary = salary.toString().replace(/\D/g, '');
    if (numericSalary) {
      return `৳${parseInt(numericSalary).toLocaleString('en-BD')}`;
    }
    return salary;
  };

  return (
    <div className="min-h-screen bg-base">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 max-w-md"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <Briefcase size={64} className="mx-auto opacity-90" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 glow-text">Find Your Dream Job</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover exciting career opportunities that match your skills and aspirations
            </p>
            {currentUser && (
              <p className="mt-4 text-sm opacity-80">
                Signed in as: <span className="font-semibold">{currentUser.email}</span>
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="neon-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
              {searchTerm && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 btn-outline-neon transition-colors"
                >
                  Clear
                </motion.button>
              )}
            </div>
            
            {/* Stats */}
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span className="flex items-center gap-2">
                <TrendingUp size={16} />
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              </span>
              {searchTerm && (
                <span className="text-primary">
                  Searching for "{searchTerm}"
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Briefcase size={48} className="text-primary glow-icon" />
            </motion.div>
            <p className="mt-4 text-muted text-lg">Loading amazing opportunities...</p>
          </div>
        ) : (
          <>
            {/* Jobs Grid */}
            <AnimatePresence mode="wait">
              {filteredJobs.length > 0 ? (
                <motion.div 
                  key="jobs-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="neon-card overflow-hidden transition-all group"
                    >
                      {/* Card Header with Gradient */}
                      <div className="h-2 bg-card-gradient"></div>
                      
                      <div className="p-6">
                        {/* Company Badge */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'rgba(168,85,247,0.06)'}}>
                            <Building2 className="text-primary glow-icon" size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-main truncate">
                              {job.company}
                            </h4>
                            <p className="text-xs text-muted">Company</p>
                          </div>
                        </div>

                        {/* Applied Badge */}
                        {job.hasApplied && (
                          <div className="mb-3">
                            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                              <CheckCircle size={14} />
                              Already Applied
                            </span>
                          </div>
                        )}

                        {/* Job Title */}
                        <h3 className="text-xl font-bold mb-3 glow-text line-clamp-2">
                          {job.title}
                        </h3>

                        {/* Job Details Preview */}
                        <p className="text-sm text-muted mb-4 line-clamp-3">
                          {job.details}
                        </p>

                        {/* Salary */}
                        <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{background:'rgba(168,85,247,0.04)'}}>
                          <DollarSign className="text-primary" size={20} />
                          <div>
                            <p className="text-xs text-muted">Salary</p>
                            <p className="font-bold" style={{color:'#C084FC'}}>
                              {formatSalary(job.salary)}
                            </p>
                          </div>
                        </div>

                        {/* Applicants Count */}
                        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{background:'rgba(168,85,247,0.04)'}}>
                          <Users className="text-primary" size={20} />
                          <div>
                            <p className="text-xs text-muted">Applicants</p>
                            <p className="font-bold" style={{color:'#C084FC'}}>
                              {job.applicantCount} {job.applicantCount === 1 ? 'person' : 'people'} applied
                            </p>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="flex-1 btn-outline-neon py-3 px-4 font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleApply(job.id, job.title)}
                            disabled={applying || job.hasApplied || !currentUser}
                            className="flex-1 btn-primary py-3 px-4 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {job.hasApplied ? 'Applied ✓' : applying ? 'Applying...' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-20"
                >
                  <div className="neon-card p-12 max-w-md mx-auto">
                    <Briefcase size={64} className="mx-auto text-muted mb-4" />
                    <h3 className="text-2xl font-bold glow-text mb-2">No Jobs Found</h3>
                    <p className="text-muted mb-6">
                      We couldn't find any jobs matching "{searchTerm}". Try adjusting your search.
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="btn-primary"
                    >
                      Clear Search
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="neon-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        <Building2 size={28} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">{selectedJob.title}</h2>
                        <p className="text-white/90 mt-1">{selectedJob.company}</p>
                      </div>
                    </div>
                    {selectedJob.hasApplied && (
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                        <CheckCircle size={14} />
                        You have applied for this job
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Salary */}
                  <div className="bg-gradient-to-br from-[rgba(168,85,247,0.1)] to-[rgba(213,0,249,0.1)] border-2 border-[rgba(168,85,247,0.3)] rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#A855F7] to-[#D500F9] rounded-xl flex items-center justify-center">
                        <DollarSign size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Salary Package</p>
                        <p className="text-xl font-bold text-primary">
                          {formatSalary(selectedJob.salary)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Applicants */}
                  <div className="bg-gradient-to-br from-[rgba(168,85,247,0.1)] to-[rgba(213,0,249,0.1)] border-2 border-[rgba(168,85,247,0.3)] rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#A855F7] to-[#D500F9] rounded-xl flex items-center justify-center">
                        <Users size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Total Applicants</p>
                        <p className="text-xl font-bold text-primary">
                          {selectedJob.applicantCount} {selectedJob.applicantCount === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Briefcase className="text-primary glow-icon" size={24} />
                    Job Details
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-muted leading-relaxed whitespace-pre-line">
                      {selectedJob.details}
                    </p>
                  </div>
                </div>

                {/* Company Info */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Building2 className="text-purple-600" size={24} />
                    About Company
                  </h3>
                  <div className="bg-purple-50 rounded-xl p-6">
                    <p className="text-xl font-semibold text-purple-900">
                      {selectedJob.company}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 btn-outline-neon py-4 px-6"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleApply(selectedJob.id, selectedJob.title)}
                    disabled={applying || selectedJob.hasApplied || !currentUser}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedJob.hasApplied ? 'Already Applied ✓' : applying ? 'Applying...' : !currentUser ? 'Sign In to Apply' : 'Apply Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;