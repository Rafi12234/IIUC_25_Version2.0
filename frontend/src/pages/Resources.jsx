/**
 * Resources Page
 * Browse learning resources and courses
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, BookOpen, Filter as FilterIcon } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    cost: '',
    platform: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, resources]);

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources');
      setResources(response.data.resources);
      setFilteredResources(response.data.resources);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = resources;

    if (filters.search) {
      result = result.filter(resource =>
        resource.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        resource.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.cost) {
      result = result.filter(resource => resource.cost === filters.cost);
    }

    if (filters.platform) {
      result = result.filter(resource =>
        resource.platform.toLowerCase().includes(filters.platform.toLowerCase())
      );
    }

    setFilteredResources(result);
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
          <h1 className="font-heading text-4xl font-bold mb-2">Learning Resources</h1>
          <p className="text-text-muted">Discover {resources.length}+ courses and tutorials to boost your skills</p>
        </motion.div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                name="search"
                type="text"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search resources..."
                className="input-field pl-11"
              />
            </div>

            <select name="cost" value={filters.cost} onChange={handleFilterChange} className="input-field">
              <option value="">All Costs</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
              <option value="Freemium">Freemium</option>
            </select>

            <input
              name="platform"
              type="text"
              value={filters.platform}
              onChange={handleFilterChange}
              placeholder="Platform (e.g., Coursera, Udemy)"
              className="input-field"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="card p-6 h-full flex flex-col hover:shadow-lift transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <BookOpen className="text-primary flex-shrink-0" size={24} />
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      resource.cost === 'Free' ? 'bg-green-100 text-green-700' :
                      resource.cost === 'Paid' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {resource.cost}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-sm text-text-muted mb-3">{resource.platform}</p>
                  <p className="text-sm text-text-muted mb-4 flex-1 line-clamp-3">{resource.description}</p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {resource.relatedSkills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-bg-muted text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {resource.relatedSkills.length > 3 && (
                        <span className="px-2 py-1 text-xs text-text-muted">
                          +{resource.relatedSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {resource.matchReason && (
                    <div className="text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg mb-3">
                      {resource.matchReason}
                    </div>
                  )}

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center space-x-2 mt-auto"
                  >
                    <span>View Resource</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <FilterIcon className="mx-auto mb-4 text-text-muted" size={48} />
            <h3 className="font-heading text-xl font-semibold mb-2">No resources found</h3>
            <p className="text-text-muted">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
