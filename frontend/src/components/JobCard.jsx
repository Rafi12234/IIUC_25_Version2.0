import React from 'react';
import { motion } from 'framer-motion';
import { applicationsService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

const JobCard = ({ job }) => {
  const { currentUser } = useAuth();

  const handleApply = async () => {
    try {
      await applicationsService.applyToJob(job.id, currentUser.uid, {
        resume: 'path/to/resume',
        coverLetter: 'Application message'
      });
    } catch (error) {
      console.error('Error applying:', error);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="neon-card neon-border animate-slide-up"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-extrabold glow-text">{job.title}</h3>
          <p className="text-sm text-muted mt-1">{job.company || job.organization}</p>
        </div>
        <div className="ml-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{background: 'linear-gradient(90deg, rgba(168,85,247,0.08), rgba(213,0,249,0.06))', color:'#C084FC'}}>{job.type || 'Full Time'}</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">{job.description?.slice(0, 160)}{job.description && job.description.length > 160 ? '...' : ''}</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleApply} className="btn-primary">Apply</button>
          <button className="btn-outline-neon">Save</button>
        </div>
        <div className="text-sm text-muted">{job.location || 'Remote'}</div>
      </div>
    </motion.article>
  );
};

export default JobCard;