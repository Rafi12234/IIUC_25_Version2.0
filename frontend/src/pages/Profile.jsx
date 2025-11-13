/**
 * Profile Page
 * Edit user profile, skills, and CV
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    experienceLevel: '',
    careerTrack: '',
    skills: [],
    experienceDesc: '',
    careerInterests: '',
    cvText: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        education: user.education || 'Undergraduate',
        experienceLevel: user.experienceLevel || 'Student',
        careerTrack: user.careerTrack || 'Web Development',
        skills: user.skills || [],
        experienceDesc: user.experienceDesc || '',
        careerInterests: user.careerInterests || '',
        cvText: user.cvText || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put(`/users/${user._id}`, formData);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-padding bg-bg-muted dark:bg-gray-900">
      <div className="section-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-text-muted">Update your information to get better job recommendations</p>
        </motion.div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Education</label>
                <select name="education" value={formData.education} onChange={handleChange} className="input-field">
                  {['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="input-field">
                  {['Student', 'Fresher', 'Junior', 'Mid-level', 'Senior'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Career Track</label>
                <select name="careerTrack" value={formData.careerTrack} onChange={handleChange} className="input-field">
                  {['Web Development', 'Mobile Development', 'Data Science', 'UI/UX Design', 'Digital Marketing', 'Content Writing', 'Graphic Design', 'Business', 'Other'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="input-field flex-1"
                  placeholder="Add a skill (e.g., JavaScript, Excel)"
                />
                <button type="button" onClick={addSkill} className="btn-primary px-4">
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center space-x-2">
                    <span>{skill}</span>
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-primary-dark">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-2">Experience Description</label>
              <textarea
                name="experienceDesc"
                value={formData.experienceDesc}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Briefly describe your experience, projects, or activities..."
              />
            </div>

            {/* Career Interests */}
            <div>
              <label className="block text-sm font-medium mb-2">Career Interests</label>
              <textarea
                name="careerInterests"
                value={formData.careerInterests}
                onChange={handleChange}
                rows={2}
                className="input-field resize-none"
                placeholder="What are your career goals and interests?"
              />
            </div>

            {/* CV Text */}
            <div>
              <label className="block text-sm font-medium mb-2">CV / Resume (Paste Text)</label>
              <textarea
                name="cvText"
                value={formData.cvText}
                onChange={handleChange}
                rows={6}
                className="input-field resize-none font-mono text-sm"
                placeholder="Paste your CV or resume content here for better matching..."
              />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
