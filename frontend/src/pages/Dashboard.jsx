/**
 * Dashboard Page
 * User dashboard with profile summary and recommendations
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState({ jobs: [], resources: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get(`/recommendations/${user._id}`);
      setRecommendations(response.data.recommendations);
    } catch (error) {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-padding bg-bg-muted dark:bg-gray-900">
      <div className="section-container">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-text-muted">Here's what's happening with your career journey</p>
        </motion.div>

        {/* Profile Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard icon={User} label="Profile Completion" value="75%" color="bg-blue-500" />
          <StatCard icon={Briefcase} label="Matched Jobs" value={recommendations.jobs.length} color="bg-primary" />
          <StatCard icon={BookOpen} label="Recommended Resources" value={recommendations.resources.length} color="bg-purple-500" />
          <StatCard icon={TrendingUp} label="Skills" value={user?.skills?.length || 0} color="bg-orange-500" />
        </div>

        {/* Recommended Jobs */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold">Recommended Jobs for You</h2>
            <Link to="/jobs" className="text-primary hover:text-primary-dark flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : recommendations.jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.jobs.slice(0, 4).map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-text-muted">
                No job recommendations yet. <Link to="/profile" className="text-primary">Update your skills</Link> to get personalized matches!
              </p>
            </div>
          )}
        </section>

        {/* Recommended Resources */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold">Learning Resources</h2>
            <Link to="/resources" className="text-primary hover:text-primary-dark flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {!loading && recommendations.resources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.resources.slice(0, 3).map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="card p-12 text-center">
                <p className="text-text-muted">No resource recommendations available</p>
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="card p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-text-muted mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  </motion.div>
);

// Job Card Component
const JobCard = ({ job }) => (
  <Link to={`/jobs/${job._id}`} className="card p-6 hover:shadow-lift transition-all">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
        <p className="text-sm text-text-muted">{job.company} • {job.location}</p>
      </div>
      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
        {job.type}
      </span>
    </div>
    <p className="text-sm text-text-muted mb-3 line-clamp-2">{job.description}</p>
    {job.matchReason && (
      <div className="text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg">
        ✓ {job.matchReason}
      </div>
    )}
  </Link>
);

// Resource Card Component
const ResourceCard = ({ resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="card p-6 hover:shadow-lift transition-all"
  >
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-semibold mb-1">{resource.title}</h3>
      <span className={`px-2 py-1 text-xs font-medium rounded ${
        resource.cost === 'Free' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}>
        {resource.cost}
      </span>
    </div>
    <p className="text-sm text-text-muted mb-3">{resource.platform}</p>
    {resource.matchReason && (
      <div className="text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg">
        {resource.matchReason}
      </div>
    )}
  </a>
);

export default Dashboard;
