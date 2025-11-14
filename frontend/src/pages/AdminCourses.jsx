/**
 * Admin Courses Management
 * Create, edit, and manage course listings
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, BookOpen, Upload, Loader } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';

const AdminCourses = () => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    Overview: '',
    Outline: '',
    Image_1: ''
  });

  const [Enrollment, setEnrollment] = useState({
    'Enrollment_1': '',
    'Enrollment_2': ''
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesRef = collection(db, 'Courses');
      const snapshot = await getDocs(coursesRef);

      const coursesData = [];
      snapshot.forEach((docSnap) => {
        coursesData.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', 'hackathon'); // Cloudinary upload preset

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dnzjg9lq8/image/upload',
        {
          method: 'POST',
          body: formDataUpload
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image to Cloudinary');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadImageToCloudinary(file);
      if (imageUrl) {
        setFormData({ ...formData, Image_1: imageUrl });
        toast.success('Image uploaded successfully');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      Overview: '',
      Outline: '',
      Image_1: ''
    });
    setEnrollment({
      'Enrollment_1': '',
      'Enrollment_2': ''
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const handleEdit = (course) => {
    setEditingCourse(course.id);
    setFormData({
      name: course.name || '',
      Overview: course.Overview || '',
      Outline: course.Outline || '',
      Image_1: course.Image_1 || ''
    });
    setEnrollment({
      'Enrollment_1': course.Enrollment_1 || '',
      'Enrollment_2': course.Enrollment_2 || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.Overview || !formData.Outline || !formData.Image_1) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const courseData = {
        name: formData.name,
        Overview: formData.Overview,
        Outline: formData.Outline,
        Image_1: formData.Image_1,
        Enrollment_1: Enrollment.Enrollment_1 || '',
        Enrollment_2: Enrollment.Enrollment_2 || ''
      };

      if (editingCourse) {
        // Update existing course
        const courseRef = doc(db, 'Courses', editingCourse);
        await updateDoc(courseRef, courseData);
        toast.success('Course updated successfully');
      } else {
        // Add new course
        await addDoc(collection(db, 'Courses'), courseData);
        toast.success('Course created successfully');
      }

      resetForm();
      loadCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteDoc(doc(db, 'Courses', courseId));
        toast.success('Course deleted successfully');
        loadCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold glow-text mb-2">Courses Management</h1>
            <p className="text-muted">Create and manage course listings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(90deg,#A855F7,#D500F9)',
              boxShadow: '0 0 20px rgba(168,85,247,0.3)'
            }}
          >
            <Plus size={20} className="text-white" />
            <span className="text-white">Add Course</span>
          </motion.button>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#11152B] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto neon-card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold glow-text">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-[rgba(168,85,247,0.1)] rounded-lg transition-colors"
                  >
                    <X size={24} className="text-primary" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Course Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Course Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Artificial Intelligence & Machine Learning"
                      className="w-full px-4 py-2 rounded-lg bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] focus:outline-none focus:border-primary text-white placeholder-muted"
                    />
                  </div>

                  {/* Overview */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Overview</label>
                    <textarea
                      value={formData.Overview}
                      onChange={(e) => setFormData({ ...formData, Overview: e.target.value })}
                      placeholder="Course overview and description"
                      rows="3"
                      className="w-full px-4 py-2 rounded-lg bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] focus:outline-none focus:border-primary text-white placeholder-muted"
                    />
                  </div>

                  {/* Outline */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Outline</label>
                    <textarea
                      value={formData.Outline}
                      onChange={(e) => setFormData({ ...formData, Outline: e.target.value })}
                      placeholder="Course outline and topics"
                      rows="3"
                      className="w-full px-4 py-2 rounded-lg bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] focus:outline-none focus:border-primary text-white placeholder-muted"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Course Image</label>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] cursor-pointer hover:bg-[rgba(168,85,247,0.1)] transition-colors">
                        <Upload size={20} className="text-primary" />
                        <span>{uploadingImage ? 'Uploading...' : 'Choose Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      {uploadingImage && <Loader size={20} className="animate-spin text-primary" />}
                    </div>
                    {formData.Image_1 && (
                      <div className="mt-2">
                        <img
                          src={formData.Image_1}
                          alt="Course"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <p className="text-xs text-muted mt-1 truncate">Image uploaded: {formData.Image_1}</p>
                      </div>
                    )}
                  </div>

                  {/* Enrollment Fields - Only show when editing */}
                  {editingCourse && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(168,85,247,0.1)]">
                      <div>
                        <label className="block text-sm font-medium mb-2">Enrolled Email 1</label>
                        <input
                          type="email"
                          value={Enrollment.Enrollment_1}
                          disabled
                          placeholder="No enrollment yet"
                          className="w-full px-4 py-2 rounded-lg bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] text-muted cursor-not-allowed opacity-60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Enrolled Email 2</label>
                        <input
                          type="email"
                          value={Enrollment.Enrollment_2}
                          disabled
                          placeholder="No enrollment yet"
                          className="w-full px-4 py-2 rounded-lg bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] text-muted cursor-not-allowed opacity-60"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                      style={{
                        background: 'linear-gradient(90deg,#A855F7,#D500F9)',
                        boxShadow: '0 0 20px rgba(168,85,247,0.3)'
                      }}
                    >
                      <Save size={20} className="text-white" />
                      <span className="text-white">{editingCourse ? 'Update Course' : 'Create Course'}</span>
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-lg font-semibold border border-[rgba(168,85,247,0.3)] text-primary hover:bg-[rgba(168,85,247,0.06)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Courses List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <p className="text-muted mb-4">No courses yet. Create your first course!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="neon-card rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-200"
              >
                {/* Course Image */}
                {course.Image_1 && (
                  <div className="relative h-32 overflow-hidden bg-[rgba(168,85,247,0.1)]">
                    <img
                      src={course.Image_1}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Course Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.name}</h3>
                  <p className="text-sm text-muted mb-3 line-clamp-2">{course.Overview}</p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(course)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                      style={{
                        background: 'linear-gradient(90deg,#A855F7,#D500F9)',
                        boxShadow: '0 0 15px rgba(168,85,247,0.2)'
                      }}
                    >
                      <Edit size={16} className="text-white" />
                      <span className="text-white">Edit</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(course.id)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminCourses;
