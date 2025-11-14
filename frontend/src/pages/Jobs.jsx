import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { calculateMatchScore, getMatchLevel } from '../utils/matchScore';
import { getLearningSuggestions } from '../utils/getLearningSuggestions';
import SkillGapCard from '../components/SkillGapCard';
import LearningSuggestionCard from '../components/LearningSuggestionCard';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  MapPin, 
  Award, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Target,
  ExternalLink,
  Loader,
  AlertCircle,
  Search,
  BookOpen,
  Send
} from 'lucide-react';

const Jobs = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [error, setError] = useState('');
  const [learningResources, setLearningResources] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        setError('User profile not found. Please complete your profile first.');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      setUserProfile(userData);

      // Fetch all jobs
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobsData = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setJobs(jobsData);

      // Fetch learning resources
      const resourcesSnapshot = await getDocs(collection(db, 'learningResources'));
      const resourcesData = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLearningResources(resourcesData);

      // Calculate match scores for each job
      const jobsWithScores = jobsData.map(job => {
        const matchResult = calculateMatchScore(userData, job);
        return {
          ...job,
          matchScore: matchResult.score,
          matchDetails: matchResult
        };
      });

      // Sort by match score (highest first)
      const sortedJobs = jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
      setMatchedJobs(sortedJobs);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load job matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search and filter level
  const filteredJobs = matchedJobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skillsRequired?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterLevel === 'all' ||
      (filterLevel === 'excellent' && job.matchScore >= 80) ||
      (filterLevel === 'good' && job.matchScore >= 60 && job.matchScore < 80) ||
      (filterLevel === 'fair' && job.matchScore >= 40 && job.matchScore < 60) ||
      (filterLevel === 'low' && job.matchScore < 40);

    return matchesSearch && matchesFilter;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0B0E1C] flex items-center justify-center px-4">
        <div className="neon-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold text-main mb-2">Sign In Required</h2>
          <p className="text-muted mb-6">Please sign in to view your job matches</p>
          <a href="/login" className="btn-primary inline-block">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E1C] flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted text-lg">Loading your job matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0E1C] flex items-center justify-center px-4">
        <div className="neon-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-main mb-2">Error</h2>
          <p className="text-muted mb-6">{error}</p>
          <button onClick={fetchData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E1C] py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold glow-text mb-4">
            Your Job Matches
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            AI-powered job matching based on your skills, experience, and career track
          </p>
        </motion.div>

        {/* User Profile Summary */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neon-card p-6 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[250px]">
                <h3 className="text-lg font-semibold text-main mb-2">Your Profile</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-sm text-primary">
                    {userProfile.experienceLevel || 'Not set'}
                  </span>
                  <span className="px-3 py-1 bg-accent-pink/20 border border-accent-pink/40 rounded-full text-sm text-accent-pink">
                    {userProfile.preferredTrack || 'Not set'}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[250px]">
                <p className="text-sm text-muted mb-2">Skills ({userProfile.skills?.length || 0})</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills?.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#11152B] border border-primary/30 rounded text-xs text-main">
                      {skill}
                    </span>
                  ))}
                  {userProfile.skills?.length > 5 && (
                    <span className="px-2 py-1 text-xs text-muted">
                      +{userProfile.skills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>

          {/* Filter by match level */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Matches</option>
            <option value="excellent">Excellent (80%+)</option>
            <option value="good">Good (60-79%)</option>
            <option value="fair">Fair (40-59%)</option>
            <option value="low">Low (&lt;40%)</option>
          </select>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="neon-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{matchedJobs.length}</p>
            <p className="text-sm text-muted">Total Jobs</p>
          </div>
          <div className="neon-card p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{matchedJobs.filter(j => j.matchScore >= 80).length}</p>
            <p className="text-sm text-muted">Excellent</p>
          </div>
          <div className="neon-card p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{matchedJobs.filter(j => j.matchScore >= 60 && j.matchScore < 80).length}</p>
            <p className="text-sm text-muted">Good</p>
          </div>
          <div className="neon-card p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{matchedJobs.filter(j => j.matchScore >= 40 && j.matchScore < 60).length}</p>
            <p className="text-sm text-muted">Fair</p>
          </div>
        </motion.div>

        {/* Job Cards */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={64} className="mx-auto text-muted mb-4" />
            <p className="text-muted text-xl">No jobs found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredJobs.map((job, index) => (
              <JobCard 
                key={job.id} 
                job={job} 
                index={index} 
                learningResources={learningResources}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}

        {/* Job Market Insights Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="/job-market-insights"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            <TrendingUp size={24} />
            <span>View Bangladesh Job Market Insights 2025</span>
          </a>
          <p className="text-muted text-sm mt-3">
            Explore employment rates, industry growth, top jobs, and sector opportunities
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job, index, learningResources, currentUser }) => {
  const matchLevel = getMatchLevel(job.matchScore);
  const [expanded, setExpanded] = useState(false);
  const [showSkillGap, setShowSkillGap] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  
  // Get learning suggestions for missing skills
  const learningSuggestions = getLearningSuggestions(
    job.matchDetails.missingSkills,
    learningResources
  );
  
  // Check if user has already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (currentUser) {
        try {
          const jobRef = doc(db, 'jobs', job.id);
          const jobDoc = await getDoc(jobRef);
          
          if (jobDoc.exists()) {
            const jobData = jobDoc.data();
            // Check if current user's email is in any Applicant field
            let hasAppliedToJob = false;
            for (let i = 1; i <= 100; i++) { // Check up to 100 applicants
              if (jobData[`Applicant_${i}`] === currentUser.email) {
                hasAppliedToJob = true;
                break;
              } else if (!jobData[`Applicant_${i}`]) {
                break; // No more applicants
              }
            }
            setHasApplied(hasAppliedToJob);
          }
        } catch (error) {
          console.error('Error checking application:', error);
        }
      }
    };
    checkApplication();
  }, [currentUser, job.id]);
  
  // Handle apply to job
  const handleApply = async () => {
    if (!currentUser) {
      toast.error('Please sign in to apply for jobs');
      return;
    }
    
    if (hasApplied) {
      toast.info('You have already applied to this job');
      return;
    }
    
    try {
      setApplying(true);
      
      // Get the job document to find the next applicant number
      const jobRef = doc(db, 'jobs', job.id);
      const jobDoc = await getDoc(jobRef);
      
      if (!jobDoc.exists()) {
        toast.error('Job not found');
        return;
      }
      
      // Find the next applicant field number
      let applicantNumber = 1;
      const jobData = jobDoc.data();
      
      // Count existing applicants
      while (jobData[`Applicant_${applicantNumber}`]) {
        applicantNumber++;
      }
      
      // Check if user hasn't already applied
      for (let i = 1; i < applicantNumber; i++) {
        if (jobData[`Applicant_${i}`] === currentUser.email) {
          setHasApplied(true);
          toast.info('You have already applied to this job');
          setApplying(false);
          return;
        }
      }
      
      // Add the current user's email as the next applicant
      const updateData = {};
      updateData[`Applicant_${applicantNumber}`] = currentUser.email;
      
      await updateDoc(jobRef, updateData);
      
      setHasApplied(true);
      toast.success(`Application submitted for ${job.title}!`);
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="neon-card p-6 hover:border-primary/60 transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Match Score */}
        <div className="lg:w-32 flex lg:flex-col items-center lg:items-start gap-4">
          <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${matchLevel.color} p-1 ${matchLevel.glow}`}>
            <div className="w-full h-full rounded-full bg-[#11152B] flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{job.matchScore}%</span>
            </div>
          </div>
          <div className="lg:mt-2 text-center lg:text-left">
            <p className={`text-sm font-semibold ${matchLevel.textColor}`}>
              {matchLevel.level}
            </p>
          </div>
        </div>

        {/* Middle: Job Details */}
        <div className="flex-1">
          {/* Title and Company */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-main mb-2">{job.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-muted">
              <span className="flex items-center gap-1">
                <Briefcase size={16} />
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {job.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Award size={16} />
                {job.experienceRequired}
              </span>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-primary" />
              <span className="text-sm font-semibold text-main">Required Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.matchDetails.matchedSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle size={14} />
                  {skill}
                </span>
              ))}
              {job.matchDetails.missingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-sm text-red-400 flex items-center gap-1">
                  <XCircle size={14} />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Match Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-muted">{job.matchDetails.experienceNote}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target size={16} className="text-primary" />
              <span className="text-muted">{job.matchDetails.trackNote}</span>
            </div>
          </div>

          {/* Expandable Details */}
          {expanded && job.description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 bg-[#11152B] rounded-lg border border-primary/20"
            >
              <p className="text-sm text-muted whitespace-pre-line">{job.description}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Apply Now Button */}
            <button
              onClick={handleApply}
              disabled={applying || hasApplied}
              className={`${
                hasApplied 
                  ? 'bg-green-500/20 border-green-500/40 text-green-400 cursor-not-allowed' 
                  : 'btn-primary'
              } flex items-center gap-2 transition-all duration-300 px-4 py-2 rounded-lg border`}
            >
              {applying ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Applying...
                </>
              ) : hasApplied ? (
                <>
                  <CheckCircle size={16} />
                  Applied
                </>
              ) : (
                <>
                  <Send size={16} />
                  Apply Now
                </>
              )}
            </button>
            
            {job.applyLinks?.linkedin && (
              <a
                href={job.applyLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-neon flex items-center gap-2"
              >
                <ExternalLink size={16} />
                LinkedIn
              </a>
            )}
            {job.applyLinks?.bdjobs && (
              <a
                href={job.applyLinks.bdjobs}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <ExternalLink size={16} />
                BDjobs
              </a>
            )}
            {job.applyLinks?.glassdoor && (
              <a
                href={job.applyLinks.glassdoor}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Glassdoor
              </a>
            )}
            {job.description && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn-outline-neon"
              >
                {expanded ? 'Show Less' : 'Show Details'}
              </button>
            )}
            {job.matchDetails.missingSkills.length > 0 && (
              <button
                onClick={() => setShowSkillGap(!showSkillGap)}
                className="btn-outline-neon flex items-center gap-2"
              >
                <BookOpen size={16} />
                {showSkillGap ? 'Hide' : 'Show'} Skill Gap Analysis
              </button>
            )}
          </div>
          
          {/* Skill Gap Analysis Section */}
          <AnimatePresence>
            {showSkillGap && job.matchDetails.missingSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4"
              >
                <SkillGapCard 
                  missingSkills={job.matchDetails.missingSkills} 
                  matchScore={job.matchScore}
                />
                {learningSuggestions.suggestions.length > 0 && (
                  <LearningSuggestionCard suggestions={learningSuggestions.suggestions} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Score Breakdown */}
        <div className="lg:w-48 space-y-3">
          <h4 className="text-sm font-semibold text-main mb-3">Match Breakdown</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Skills</span>
                <span>{job.matchDetails.breakdown.skillScore}/60</span>
              </div>
              <div className="h-2 bg-[#11152B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent-pink rounded-full transition-all duration-500"
                  style={{ width: `${(job.matchDetails.breakdown.skillScore / 60) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Experience</span>
                <span>{job.matchDetails.breakdown.expScore}/20</span>
              </div>
              <div className="h-2 bg-[#11152B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent-pink rounded-full transition-all duration-500"
                  style={{ width: `${(job.matchDetails.breakdown.expScore / 20) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Track</span>
                <span>{job.matchDetails.breakdown.trackScore}/20</span>
              </div>
              <div className="h-2 bg-[#11152B] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent-pink rounded-full transition-all duration-500"
                  style={{ width: `${(job.matchDetails.breakdown.trackScore / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Jobs;
