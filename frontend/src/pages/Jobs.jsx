/**
 * Jobs Page
 * Browse and filter job listings
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    experienceLevel: '',
    location: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.jobs);
      setFilteredJobs(response.data.jobs);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = jobs;

    if (filters.search) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type) {
      result = result.filter(job => job.type === filters.type);
    }

    if (filters.experienceLevel) {
      result = result.filter(job => job.experienceLevel === filters.experienceLevel);
    }

    if (filters.location) {
      result = result.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredJobs(result);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-padding bg-bg-muted dark:bg-gray-900">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-4xl font-bold mb-2">Find Your Dream Job</h1>
          <p className="text-text-muted">Browse {jobs.length}+ opportunities for students and fresh graduates</p>
        </motion.div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                name="search"
                type="text"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search jobs..."
                className="input-field pl-11"
              />
            </div>

            <select name="type" value={filters.type} onChange={handleFilterChange} className="input-field">
              <option value="">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Full-time">Full-time</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
            </select>

            <select name="experienceLevel" value={filters.experienceLevel} onChange={handleFilterChange} className="input-field">
              <option value="">All Levels</option>
              <option value="Student">Student</option>
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Mid-level">Mid-level</option>
            </select>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                name="location"
                type="text"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Location..."
                className="input-field pl-11"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/jobs/${job._id}`} className="card p-6 hover:shadow-lift transition-all block">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-heading text-xl font-semibold">{job.title}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          job.type === 'Internship' ? 'bg-blue-100 text-blue-700' :
                          job.type === 'Full-time' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {job.type}
                        </span>
                      </div>
                      <p className="text-text-muted mb-3">{job.company} • {job.location}</p>
                      <p className="text-sm text-text-muted line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.slice(0, 5).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-bg-muted text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 5 && (
                          <span className="px-2 py-1 text-xs text-text-muted">
                            +{job.requiredSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Filter className="mx-auto mb-4 text-text-muted" size={48} />
            <h3 className="font-heading text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-text-muted">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
