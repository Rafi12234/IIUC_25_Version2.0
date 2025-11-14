/**
 * Job Details Page
 * Detailed view of a single job posting
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { MapPin, Briefcase, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
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

  const fetchJobDetails = async (jobId) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobSnap = await getDoc(jobRef);
      
      if (jobSnap.exists()) {
        setJob({ id: jobSnap.id, ...jobSnap.data() });
      } else {
        toast.error('Job not found');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    }
  };

  const handleApply = async () => {
    if (!currentUser) {
      toast.error('Please login to apply');
      return;
    }

    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        userId: currentUser.uid,
        appliedAt: serverTimestamp(),
        status: 'pending'
      });
      
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Failed to submit application');
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
    <div className="page-padding bg-base">
      <div className="section-container max-w-4xl">
        <Link to="/jobs" className="inline-flex items-center space-x-2 text-muted hover:text-primary mb-6">
          <ArrowLeft size={20} />
          <span>Back to Jobs</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neon-card p-8"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-heading text-3xl font-bold mb-2 glow-text">{job.title}</h1>
                <p className="text-xl text-muted">{job.company}</p>
              </div>
              <span className={`px-4 py-2 font-medium rounded-lg text-sm`} style={{background: 'rgba(168,85,247,0.06)', color: '#C084FC'}}>
                {job.type}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted">
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
            <h2 className="font-heading text-xl font-semibold mb-3 glow-text">About the Role</h2>
            <p className="text-muted whitespace-pre-line">{job.description}</p>
          </div>

          {/* Required Skills */}
          <div className="mb-8">
            <h2 className="font-heading text-xl font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{background: 'rgba(168,85,247,0.04)', color:'#C084FC'}}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-4">
            <button className="btn-primary flex items-center space-x-2" onClick={handleApply}>
              <ExternalLink size={18} />
              <span>Apply Now</span>
            </button>
            <button className="btn-outline-neon">Save Job</button>
          </div>

          {/* Match Info (if available) */}
          {job.matchReason && (
            <div className="mt-6 p-4 rounded-lg" style={{background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.08)'}}>
              <p className="text-sm font-medium" style={{color:'#C084FC'}}>✓ {job.matchReason}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JobDetails;
