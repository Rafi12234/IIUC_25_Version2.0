import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Users, CheckCircle, AlertCircle, X } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

const CourseResources = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [unenrolling, setUnenrolling] = useState(false);
  const [unenrollingCourseId, setUnenrollingCourseId] = useState(null);
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
        console.log('📚 Loading courses from Firestore...');
        const coursesRef = collection(db, 'Courses');
        const snapshot = await getDocs(coursesRef);
        
        console.log('✅ Found', snapshot.size, 'courses');
        
        if (snapshot.empty) {
          console.warn('⚠️ Courses collection is empty');
          setCourses([]);
          setLoading(false);
          return;
        }
        
        const coursesData = [];
        const userEnrolledCourses = new Set();
        
        snapshot.forEach((doc) => {
          console.log('📖 Processing course:', doc.id);
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

        console.log('✨ Courses loaded:', coursesData.length);
        setCourses(coursesData);
        setEnrolledCourses(userEnrolledCourses);
      } catch (error) {
        console.error('❌ Error loading courses:', error);
        showNotification('Failed to load courses. Check console for details.', 'error');
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
      setEnrollingCourseId(courseId);
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
      setEnrollingCourseId(null);
    }
  };

  // Handle course unenrollment
  const handleUnenrollment = async (courseId) => {
    if (!currentUser) {
      showNotification('Please sign in first', 'error');
      return;
    }

    try {
      setUnenrolling(true);
      setUnenrollingCourseId(courseId);
      const courseRef = doc(db, 'Courses', courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (!courseSnap.exists()) {
        showNotification('Course not found', 'error');
        return;
      }

      const courseData = courseSnap.data();
      
      // Find the enrollment field with current user's email
      const enrollmentField = Object.keys(courseData).find(key => 
        key.startsWith('Enrollment_') && courseData[key] === currentUser.email
      );

      if (!enrollmentField) {
        showNotification('You are not enrolled in this course', 'error');
        return;
      }

      // Remove enrollment by setting field to empty string
      await updateDoc(courseRef, {
        [enrollmentField]: ''
      });

      // Update local state
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course.id === courseId
            ? { ...course, enrollments: course.enrollments.filter(email => email !== currentUser.email) }
            : course
        )
      );

      setEnrolledCourses(prev => {
        const updated = new Set(prev);
        updated.delete(courseId);
        return updated;
      });
      
      showNotification('Successfully unenrolled from the course', 'success');
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error unenrolling:', error);
      showNotification('Failed to unenroll. Please try again.', 'error');
    } finally {
      setUnenrolling(false);
      setUnenrollingCourseId(null);
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
      <div className="relative bg-gradient-to-br from-[#1A1B2E] via-[#2D1B69] to-[#1A1B2E] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDE2OCw4NSwyNDcsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block p-4 bg-purple-500/10 rounded-2xl backdrop-blur-sm border border-purple-500/20 mb-6">
            <BookOpen size={64} className="mx-auto text-purple-400" />
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">Course Resources</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Explore our comprehensive collection of courses and start your learning journey today</p>
          <div className="mt-8 flex justify-center gap-4 text-sm">
            <div className="bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30">
              <span className="text-purple-300 font-semibold">{courses.length}</span>
              <span className="text-gray-400 ml-1">Courses Available</span>
            </div>
            <div className="bg-pink-500/20 px-4 py-2 rounded-lg border border-pink-500/30">
              <span className="text-pink-300 font-semibold">{enrolledCourses.size}</span>
              <span className="text-gray-400 ml-1">Your Enrollments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-10">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-purple-400" size={22} />
              <input
                type="text"
                placeholder="Search courses by name, description, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-14 py-4 bg-gradient-to-br from-[#1A1B2E] to-[#13141F] border-2 border-purple-500/30 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Status */}
        {currentUser && (
          <div className="mb-8 text-center">
            <div className="inline-block bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 px-6 py-3 rounded-xl">
              <p className="text-sm text-gray-400">
                Signed in as: <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{currentUser.email}</span>
              </p>
            </div>
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
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="relative bg-gradient-to-br from-[#1A1B2E] to-[#13141F] rounded-2xl overflow-hidden border border-purple-500/20 transition-all duration-500 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 group"
                >
                  {/* Course Image */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B2E] via-transparent to-transparent opacity-60 z-10"></div>
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                      }}
                    />
                    <div className="absolute top-4 right-4 z-20">
                      {enrolledCourses.has(course.id) && (
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-green-500/50 animate-pulse">
                          <CheckCircle size={16} />
                          Enrolled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3 text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {course.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-5 line-clamp-3 leading-relaxed">
                      {course.overview}
                    </p>

                    {/* Enrollment Count */}
                    <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-lg mb-5 border border-purple-500/20">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg">
                        <Users size={16} className="text-purple-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-300">{course.enrollments.length} student{course.enrollments.length !== 1 ? 's' : ''} enrolled</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="flex-1 bg-[rgba(0,0,0,0.3)] border-2 border-purple-500/30 text-white py-3 px-4 rounded-xl hover:bg-purple-500/20 hover:border-purple-500/50 transition-all font-semibold shadow-lg"
                      >
                        View Details
                      </button>
                      {enrolledCourses.has(course.id) ? (
                        <button
                          onClick={() => handleUnenrollment(course.id)}
                          disabled={unenrolling}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/50"
                        >
                          {unenrolling && unenrollingCourseId === course.id ? 'Unenrolling...' : 'Unenroll'}
                        </button>
                      ) : (
                        <div className="flex-1 relative group">
                          <button
                            onClick={() => handleEnrollment(course.id)}
                            disabled={enrolling || !currentUser}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
                          >
                            {enrolling && enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll Now'}
                          </button>
                          {!currentUser && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                              Login required to enroll
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                            </div>
                          )}
                        </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-40 animate-fade-in backdrop-blur-sm" style={{paddingTop: '80px', paddingBottom: '20px'}}>
          <div className="bg-[#11152B] border-2 border-primary/40 rounded-2xl max-w-2xl w-full max-h-full overflow-y-auto animate-scale-in shadow-2xl" style={{boxShadow: '0 0 60px rgba(168,85,247,0.4), 0 20px 80px rgba(0,0,0,0.6)'}}>
            {/* Modal Header */}
            <div className="relative h-52 overflow-hidden rounded-t-2xl">
              <img
                src={selectedCourse.image}
                alt={selectedCourse.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="sticky top-2 right-2 float-right bg-gradient-to-r from-[#A855F7] to-[#D500F9] hover:from-[#9333EA] hover:to-[#C026D3] rounded-full p-2 transition-all shadow-lg z-10"
                style={{boxShadow: '0 0 20px rgba(168,85,247,0.5)'}}
              >
                <X size={20} className="text-white" />
              </button>
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white" style={{textShadow: '0 4px 20px rgba(0,0,0,0.8)'}}>
                  {selectedCourse.name}
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {/* Enrollment Status */}
              <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-primary/20">
                <div className="flex items-center gap-2 bg-[rgba(168,85,247,0.1)] px-3 py-1.5 rounded-lg">
                  <Users size={16} className="text-primary" />
                  <span className="font-semibold text-main text-sm">{selectedCourse.enrollments.length} students enrolled</span>
                </div>
                {enrolledCourses.has(selectedCourse.id) && (
                  <span className="bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg" style={{boxShadow: '0 0 20px rgba(168,85,247,0.4)'}}>
                    <CheckCircle size={14} />
                    You're enrolled
                  </span>
                )}
              </div>

              {/* Overview Section */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-gradient-to-b from-[#A855F7] to-[#D500F9] rounded-full"></div>
                  <h3 className="text-lg font-bold text-main">Course Overview</h3>
                </div>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                  {selectedCourse.overview}
                </p>
              </div>

              {/* Outline Section */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-gradient-to-b from-[#A855F7] to-[#D500F9] rounded-full"></div>
                  <h3 className="text-lg font-bold text-main">Course Outline</h3>
                </div>
                <div className="bg-gradient-to-br from-[rgba(168,85,247,0.08)] to-[rgba(213,0,249,0.08)] border border-primary/20 rounded-lg p-3">
                  <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                    {selectedCourse.outline}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-primary/20">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-primary/30 text-main py-2 px-4 rounded-lg transition-all font-semibold text-sm"
                >
                  Close
                </button>
                {enrolledCourses.has(selectedCourse.id) ? (
                  <button
                    onClick={() => handleUnenrollment(selectedCourse.id)}
                    disabled={unenrolling}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    style={{boxShadow: '0 0 30px rgba(239,68,68,0.4)'}}
                  >
                    {unenrolling && unenrollingCourseId === selectedCourse.id ? 'Unenrolling...' : 'Unenroll from Course'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnrollment(selectedCourse.id)}
                    disabled={enrolling || !currentUser}
                    className="flex-1 bg-gradient-to-r from-[#A855F7] to-[#D500F9] hover:from-[#9333EA] hover:to-[#C026D3] text-white py-2 px-4 rounded-lg transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    style={{boxShadow: '0 0 30px rgba(168,85,247,0.4)'}}
                  >
                    {enrolling && enrollingCourseId === selectedCourse.id ? 'Enrolling...' : currentUser ? 'Enroll in This Course' : 'Sign in to Enroll'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
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

        @keyframes neon-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.4);
          }
        }

        .neon-card:hover {
          animation: neon-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CourseResources;