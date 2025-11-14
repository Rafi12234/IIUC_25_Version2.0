import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { calculateMatchScore } from '../utils/matchScore';
import { getLearningSuggestions } from '../utils/getLearningSuggestions';
import { 
  BookOpen, 
  Search, 
  ExternalLink,
  Filter,
  Loader,
  AlertCircle
} from 'lucide-react';

const LearningResources = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [skillGapResources, setSkillGapResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, free, paid
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchSkillGapResources(currentUser.uid);
    }
  }, [currentUser]);

  const fetchSkillGapResources = async (userId) => {
    try {
      setLoading(true);
      setError('');

      // Get user profile
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        setError('User profile not found. Please complete your profile first.');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      
      if (!userData.skills || userData.skills.length === 0) {
        setError('Please add skills to your profile to get personalized learning resources.');
        setLoading(false);
        return;
      }

      // Get all jobs
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobs = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get learning resources
      const resourcesSnapshot = await getDocs(collection(db, 'learningResources'));
      const allResources = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Find top matched jobs and collect missing skills
      const jobsWithScores = jobs.map(job => {
        const matchResult = calculateMatchScore(userData, job);
        return {
          ...job,
          matchScore: matchResult.score,
          matchDetails: matchResult
        };
      });

      const topJobs = jobsWithScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      // Collect all missing skills from top jobs
      const allMissingSkills = new Set();
      topJobs.forEach(job => {
        job.matchDetails.missingSkills.forEach(skill => allMissingSkills.add(skill));
      });

      // Get learning suggestions for missing skills
      const result = getLearningSuggestions(Array.from(allMissingSkills), allResources);
      
      // Flatten suggestions into single array with skill info
      const resources = [];
      if (result.suggestions && Array.isArray(result.suggestions)) {
        result.suggestions.forEach(suggestion => {
          if (suggestion.resources && Array.isArray(suggestion.resources)) {
            suggestion.resources.forEach(resource => {
              resources.push({
                ...resource,
                forSkill: suggestion.skill
              });
            });
          }
        });
      }

      // Remove duplicates
      const uniqueResources = Array.from(
        new Map(resources.map(r => [r.id, r])).values()
      );

      setSkillGapResources(uniqueResources);
    } catch (err) {
      console.error('Error fetching skill gap resources:', err);
      setError('Failed to load learning resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter resources
  const filteredResources = skillGapResources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.forSkill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.relatedSkills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === 'all' ||
      (filterType === 'free' && resource.cost === 'Free') ||
      (filterType === 'paid' && resource.cost === 'Paid');

    return matchesSearch && matchesFilter;
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0B0E1C] flex items-center justify-center px-4">
        <div className="neon-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold text-main mb-2">Sign In Required</h2>
          <p className="text-muted mb-6">Please sign in to view personalized learning resources</p>
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
          <p className="text-muted text-lg">Loading learning resources...</p>
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
          <button onClick={() => fetchSkillGapResources(currentUser.uid)} className="btn-primary">
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
            Personalized Learning Resources
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto mb-6">
            Courses and tutorials recommended based on your skill gaps from top job matches
          </p>
          
          {/* Info Badge */}
          <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg"
              >
                <p className="text-sm text-muted">
                  <Sparkles className="inline mr-2" size={16} />
                  {skillGapResources.length} resources found to help you level up
                </p>
              </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted" size={20} />
            <input
              type="text"
              placeholder="Search by title, platform, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-main placeholder-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-[rgba(255,255,255,0.05)] text-muted hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('free')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                filterType === 'free'
                  ? 'bg-green-500 text-white'
                  : 'bg-[rgba(255,255,255,0.05)] text-muted hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFilterType('paid')}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                filterType === 'paid'
                  ? 'bg-pink-500 text-white'
                  : 'bg-[rgba(255,255,255,0.05)] text-muted hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              Paid
            </button>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <ResourceCard key={resource.id} resource={resource} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="neon-card p-12 text-center"
          >
            <BookOpen className="mx-auto text-muted mb-4" size={64} />
            <p className="text-muted text-lg">
              {searchTerm ? 'No resources match your search' : 'No learning resources found'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Resource Card Component
const ResourceCard = ({ resource, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="neon-card p-6 hover:shadow-xl transition-all hover:-translate-y-2 group"
  >
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-semibold text-main group-hover:text-primary transition-colors line-clamp-2 flex-1">
        {resource.title}
      </h3>
      <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ml-2 ${
        resource.cost === 'Free' 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-[rgba(213,0,249,0.1)] text-accent-pink'
      }`}>
        {resource.cost}
      </span>
    </div>
    
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-muted">{resource.platform}</span>
    </div>

    {/* For Skill Badge */}
    {resource.forSkill && (
      <div className="mb-4 p-2 bg-purple-500/10 rounded-lg">
        <p className="text-xs text-purple-300">
          <Sparkles className="inline mr-1" size={12} />
          Recommended for: <span className="font-semibold">{resource.forSkill}</span>
        </p>
      </div>
    )}

    {/* Related Skills */}
    <div className="flex flex-wrap gap-2 mb-4">
      {resource.relatedSkills?.slice(0, 3).map((skill, idx) => (
        <span 
          key={idx} 
          className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 rounded"
        >
          {skill}
        </span>
      ))}
      {resource.relatedSkills?.length > 3 && (
        <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-300 rounded">
          +{resource.relatedSkills.length - 3} more
        </span>
      )}
    </div>

    {/* Action Button */}
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full btn-primary flex items-center justify-center gap-2"
    >
      View Resource
      <ExternalLink size={16} />
    </a>
  </motion.div>
);

export default LearningResources;
