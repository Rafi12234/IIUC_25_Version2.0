import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8za3ZI4m9gUrYsueUum907vpuKzV8H0Q",
  authDomain: "iiuc25.firebaseapp.com",
  projectId: "iiuc25",
  storageBucket: "iiuc25.firebasestorage.app",
  messagingSenderId: "75690391713",
  appId: "1:75690391713:web:4c72c5316547c8bc68d8e0",
  measurementId: "G-82V42TWJ9J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const CourseResources = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [notification, setNotification] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load courses from Firebase
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const coursesRef = collection(db, 'Courses');
        const snapshot = await getDocs(coursesRef);
        
        const coursesData = [];
        const userEnrolledCourses = new Set();
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const courseData = {
            id: doc.id,
            name: doc.id,
            overview: data.Overview || 'No overview available',
            outline: data.Outline || 'No outline available',
            image: data.Image_1 || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            enrollments: []
          };

          // Collect all enrollment fields
          Object.keys(data).forEach(key => {
            if (key.startsWith('Enrollment_')) {
              courseData.enrollments.push(data[key]);
              if (currentUser && data[key] === currentUser.email) {
                userEnrolledCourses.add(doc.id);
              }
            }
          });

          coursesData.push(courseData);
        });

        setCourses(coursesData);
        setEnrolledCourses(userEnrolledCourses);
      } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Failed to load courses. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [currentUser]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle course enrollment
  const handleEnrollment = async (courseId) => {
    if (!currentUser) {
      showNotification('Please sign in to enroll in courses', 'error');
      return;
    }

    try {
      setEnrolling(true);
      const courseRef = doc(db, 'Courses', courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (!courseSnap.exists()) {
        showNotification('Course not found', 'error');
        return;
      }

      const courseData = courseSnap.data();
      
      // Check if already enrolled
      const enrollmentFields = Object.keys(courseData).filter(key => 
        key.startsWith('Enrollment_') && courseData[key] === currentUser.email
      );

      if (enrollmentFields.length > 0) {
        showNotification('You are already enrolled in this course', 'error');
        return;
      }

      // Find next enrollment number
      const enrollmentNumbers = Object.keys(courseData)
        .filter(key => key.startsWith('Enrollment_'))
        .map(key => parseInt(key.replace('Enrollment_', '')))
        .filter(num => !isNaN(num));

      const nextNumber = enrollmentNumbers.length > 0 
        ? Math.max(...enrollmentNumbers) + 1 
        : 1;

      // Add new enrollment
      await updateDoc(courseRef, {
        [`Enrollment_${nextNumber}`]: currentUser.email
      });

      // Update local state
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? { ...course, enrollments: [...course.enrollments, currentUser.email] }
            : course
        )
      );

      setEnrolledCourses(prev => new Set([...prev, courseId]));
      showNotification('Successfully enrolled in the course!', 'success');
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error enrolling:', error);
      showNotification('Failed to enroll. Please try again.', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.overview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <BookOpen size={64} className="mx-auto mb-4 opacity-90" />
            <h1 className="text-5xl font-bold mb-4 glow-text">Course Resources</h1>
            <p className="text-xl opacity-90">
              Explore our comprehensive collection of courses and start learning today
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8 animate-slide-up">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* User Status */}
        {currentUser && (
          <div className="mb-6 text-center animate-fade-in">
            <p className="text-sm text-muted">
              Signed in as: <span className="font-semibold text-primary">{currentUser.email}</span>
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted text-lg font-medium">Loading courses...</p>
          </div>
        ) : (
          <>
            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="neon-card overflow-hidden transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      {enrolledCourses.has(course.id) && (
                        <span className="bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle size={14} />
                          Enrolled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800 line-clamp-2">
                      {course.name}
                    </h3>
                    
                    <p className="text-muted text-sm mb-4 line-clamp-3">
                      {course.overview}
                    </p>

                    {/* Enrollment Count */}
                    <div className="flex items-center gap-2 text-sm text-muted mb-4">
                      <Users size={16} />
                      <span>{course.enrollments.length} student{course.enrollments.length !== 1 ? 's' : ''} enrolled</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="flex-1 btn-outline-neon py-3 px-4 font-medium"
                      >
                        View Details
                      </button>
                      {!enrolledCourses.has(course.id) && (
                        <button
                          onClick={() => handleEnrollment(course.id)}
                          disabled={enrolling || !currentUser}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {enrolling ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <BookOpen size={64} className="mx-auto text-muted mb-4" />
                <p className="text-muted text-xl">No courses found matching your search</p>
                <p className="text-muted mt-2">Try adjusting your search terms</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className="neon-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
            {/* Modal Header */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={selectedCourse.image}
                alt={selectedCourse.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-full p-2 transition-colors backdrop-blur"
              >
                <X size={24} className="text-white" />
              </button>
              <h2 className="absolute bottom-6 left-6 text-4xl font-bold text-white">
                {selectedCourse.name}
              </h2>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Enrollment Status */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[rgba(255,255,255,0.1)]">
                <div className="flex items-center gap-2 text-muted">
                  <Users size={20} />
                  <span className="font-medium">{selectedCourse.enrollments.length} students enrolled</span>
                </div>
                {enrolledCourses.has(selectedCourse.id) && (
                  <span className="bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <CheckCircle size={16} />
                    You're enrolled
                  </span>
                )}
              </div>

              {/* Overview Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 glow-text">Course Overview</h3>
                <p className="text-muted leading-relaxed whitespace-pre-line">
                  {selectedCourse.overview}
                </p>
              </div>

              {/* Outline Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 glow-text">Course Outline</h3>
                <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6">
                  <p className="text-muted leading-relaxed whitespace-pre-line">
                    {selectedCourse.outline}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 btn-outline-neon py-4 px-6"
                >
                  Close
                </button>
                {!enrolledCourses.has(selectedCourse.id) && (
                  <button
                    onClick={() => handleEnrollment(selectedCourse.id)}
                    disabled={enrolling || !currentUser}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : currentUser ? 'Enroll in This Course' : 'Sign in to Enroll'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CourseResources;