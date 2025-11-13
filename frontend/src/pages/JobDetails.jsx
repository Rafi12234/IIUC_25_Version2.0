/**
 * Job Details Page
 * Detailed view of a single job posting
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job not found</h2>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-padding bg-bg-muted dark:bg-gray-900">
      <div className="section-container max-w-4xl">
        <Link to="/jobs" className="inline-flex items-center space-x-2 text-text-muted hover:text-primary mb-6">
          <ArrowLeft size={20} />
          <span>Back to Jobs</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-heading text-3xl font-bold mb-2">{job.title}</h1>
                <p className="text-xl text-text-muted">{job.company}</p>
              </div>
              <span className={`px-4 py-2 font-medium rounded-lg ${
                job.type === 'Internship' ? 'bg-blue-100 text-blue-700' :
                job.type === 'Full-time' ? 'bg-green-100 text-green-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {job.type}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase size={16} />
                <span>{job.experienceLevel}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-heading text-xl font-semibold mb-3">About the Role</h2>
            <p className="text-text-muted whitespace-pre-line">{job.description}</p>
          </div>

          {/* Required Skills */}
          <div className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-4">
            <button className="btn-primary flex items-center space-x-2">
              <ExternalLink size={18} />
              <span>Apply Now</span>
            </button>
            <button className="btn-secondary">Save Job</button>
          </div>

          {/* Match Info (if available) */}
          {job.matchReason && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary">✓ {job.matchReason}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetails;
