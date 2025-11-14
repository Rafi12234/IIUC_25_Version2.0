import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, BookOpen, TrendingUp, ArrowRight, GraduationCap, CheckCircle, Sparkles } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations] = useState({ jobs: [], resources: [] });

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchEnrolledCourses(user.email);
        fetchRecommendedCourses(user.email);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch courses where user is enrolled
  const fetchEnrolledCourses = async (userEmail) => {
    try {
      const coursesRef = collection(db, 'Courses');
      const snapshot = await getDocs(coursesRef);
      
      const userCourses = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Check all enrollment fields for user's email
        const isEnrolled = Object.keys(data).some(key => 
          key.startsWith('Enrollment_') && data[key] === userEmail
        );

        if (isEnrolled) {
          userCourses.push({
            id: doc.id,
            name: doc.id,
            overview: data.Overview || 'No overview available',
            outline: data.Outline || 'No outline available',
            image: data.Image_1 || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            enrollmentCount: Object.keys(data).filter(k => k.startsWith('Enrollment_')).length
          });
        }
      });

      setEnrolledCourses(userCourses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  // Fetch recommended courses based on user interests
  const fetchRecommendedCourses = async (userEmail) => {
    try {
      setLoading(true);

      // 1. Fetch user's interests from All_User/{email}/Interest/interest
      const interestDocRef = doc(db, 'All_User', userEmail, 'Interest', 'interest');
      const interestDoc = await getDoc(interestDocRef);

      if (!interestDoc.exists()) {
        console.log('No interests found for user');
        setLoading(false);
        return;
      }

      const interestData = interestDoc.data();
      const userInterests = [
        interestData.Topic_1,
        interestData.Topic_2,
        interestData.Topic_3
      ].filter(Boolean); // Remove empty values

      console.log('User interests:', userInterests);

      // 2. Fetch all courses
      const coursesRef = collection(db, 'Courses');
      const coursesSnapshot = await getDocs(coursesRef);

      const allCourses = [];
      coursesSnapshot.forEach((doc) => {
        const data = doc.data();
        allCourses.push({
          id: doc.id,
          name: doc.id,
          overview: data.Overview || 'No overview available',
          outline: data.Outline || 'No outline available',
          image: data.Image_1 || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
          enrollmentCount: Object.keys(data).filter(k => k.startsWith('Enrollment_')).length
        });
      });

      // 3. Match courses with user interests
      const matchedCourses = allCourses
        .map(course => {
          let matchScore = 0;
          let matchedInterest = '';

          // Check if course name matches any user interest
          userInterests.forEach(interest => {
            if (!interest) return;

            const interestWords = interest.toLowerCase().split(' ');
            const courseName = course.name.toLowerCase();

            // Check for full interest match
            if (courseName.includes(interest.toLowerCase())) {
              matchScore += 10;
              matchedInterest = interest;
              return;
            }

            // Check for partial word matches (first 1-2 words)
            interestWords.slice(0, 2).forEach(word => {
              if (word.length > 2 && courseName.includes(word)) {
                matchScore += 5;
                if (!matchedInterest) matchedInterest = interest;
              }
            });
          });

          return {
            ...course,
            matchScore,
            matchedInterest
          };
        })
        .filter(course => course.matchScore > 0) // Only courses with matches
        .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score
        .slice(0, 3); // Take top 3

      console.log('Matched courses:', matchedCourses);
      setRecommendedCourses(matchedCourses);
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 glow-text">
            Welcome back, {currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Guest'}! 👋
          </h1>
          <p className="text-muted">
            Here's what's happening with your career journey
          </p>
        </motion.div>

        {/* Profile Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            icon={User} 
            label="Profile Completion" 
            value="75%" 
            color="bg-gradient-to-br from-[#A855F7] to-[#7C3AED]" 
          />
          <StatCard 
            icon={Briefcase} 
            label="Matched Jobs" 
            value={recommendations.jobs.length} 
            color="bg-gradient-to-br from-[#D500F9] to-[#A855F7]" 
          />
          <StatCard 
            icon={GraduationCap} 
            label="Enrolled Courses" 
            value={enrolledCourses.length} 
            color="bg-gradient-to-br from-[#7C3AED] to-[#D500F9]" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="Recommendations" 
            value={recommendedCourses.length} 
            color="bg-gradient-to-br from-[#A855F7] to-[#D500F9]" 
          />
        </div>

        {/* Recommended Courses Section - NEW */}
        {recommendedCourses.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-primary glow-icon" size={28} />
                <h2 className="text-2xl font-bold glow-text">Recommended For You</h2>
              </div>
              <button className="text-primary hover:text-primary-light flex items-center gap-2 font-medium transition-colors">
                <span>View All Courses</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course, index) => (
                <RecommendedCourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Enrolled Courses Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="text-primary glow-icon" size={28} />
              <h2 className="text-2xl font-bold glow-text">My Enrolled Courses</h2>
            </div>
            <button className="text-primary hover:text-primary-light flex items-center gap-2 font-medium transition-colors">
              <span>Browse All Courses</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neon-card p-12 text-center"
            >
              <GraduationCap className="mx-auto text-muted mb-4" size={64} />
              <p className="text-muted text-lg mb-4">
                You haven't enrolled in any courses yet
              </p>
              <button className="btn-primary inline-flex items-center gap-2">
                <BookOpen size={20} />
                Explore Courses
              </button>
            </motion.div>
          )}
        </section>

        {/* Recommended Jobs */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Briefcase className="text-primary glow-icon" size={28} />
              <h2 className="text-2xl font-bold glow-text">Recommended Jobs for You</h2>
            </div>
            <button className="text-primary hover:text-primary-light flex items-center gap-2 font-medium transition-colors">
              <span>View All</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {recommendations.jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.jobs.slice(0, 4).map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neon-card p-12 text-center"
            >
              <Briefcase className="mx-auto text-muted mb-4" size={64} />
              <p className="text-muted">
                No job recommendations yet. <span className="text-primary hover:text-primary-light font-medium cursor-pointer">Update your skills</span> to get personalized matches!
              </p>
            </motion.div>
          )}
        </section>

        {/* Recommended Resources */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-primary glow-icon" size={28} />
              <h2 className="text-2xl font-bold glow-text">Learning Resources</h2>
            </div>
            <button className="text-primary hover:text-primary-light flex items-center gap-2 font-medium transition-colors">
              <span>View All</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {recommendations.resources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.resources.slice(0, 3).map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neon-card p-12 text-center"
            >
              <BookOpen className="mx-auto text-muted mb-4" size={64} />
              <p className="text-muted">No resource recommendations available</p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="neon-card p-6 hover:shadow-xl transition-all cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted mb-1">{label}</p>
        <p className="text-3xl font-bold text-main">{value}</p>
      </div>
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
        <Icon className="text-white" size={28} />
      </div>
    </div>
  </motion.div>
);

// Recommended Course Card Component - NEW
const RecommendedCourseCard = ({ course, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -8 }}
    className="neon-card overflow-hidden hover:shadow-2xl transition-all group cursor-pointer relative"
  >
    {/* Recommended Badge */}
    <div className="absolute top-4 left-4 z-10">
      <span className="bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
        <Sparkles size={14} />
        Recommended
      </span>
    </div>

    {/* Course Image */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={course.image}
        alt={course.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white text-xl font-bold line-clamp-2 drop-shadow-lg">
          {course.name}
        </h3>
      </div>
    </div>

    {/* Course Content */}
    <div className="p-6">
      {/* Match Reason */}
      {course.matchedInterest && (
        <div className="mb-3 flex items-center gap-2 text-xs bg-[rgba(168,85,247,0.1)] text-primary px-3 py-2 rounded-lg">
          <Sparkles size={14} />
          <span>Matches your interest in <strong>{course.matchedInterest}</strong></span>
        </div>
      )}

      <p className="text-muted text-sm mb-4 line-clamp-2">
        {course.overview}
      </p>

      {/* Course Stats */}
      <div className="flex items-center justify-between text-sm text-muted mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-2">
          <User size={16} />
          <span>{course.enrollmentCount} students</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          <span>Available</span>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full btn-primary">
        Enroll Now
      </button>
    </div>
  </motion.div>
);

// Course Card Component
const CourseCard = ({ course, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -8 }}
    className="neon-card overflow-hidden hover:shadow-2xl transition-all group cursor-pointer"
  >
    {/* Course Image */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={course.image}
        alt={course.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute top-4 right-4">
        <span className="bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
          <CheckCircle size={14} />
          Enrolled
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white text-xl font-bold line-clamp-2 drop-shadow-lg">
          {course.name}
        </h3>
      </div>
    </div>

    {/* Course Content */}
    <div className="p-6">
      <p className="text-muted text-sm mb-4 line-clamp-2">
        {course.overview}
      </p>

      {/* Course Stats */}
      <div className="flex items-center justify-between text-sm text-muted mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-2">
          <User size={16} />
          <span>{course.enrollmentCount} students</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          <span>In Progress</span>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full btn-primary">
        Continue Learning
      </button>
    </div>
  </motion.div>
);

// Job Card Component
const JobCard = ({ job }) => (
  <div className="neon-card p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-lg mb-1 text-main">{job.title}</h3>
        <p className="text-sm text-muted">{job.company} • {job.location}</p>
      </div>
      <span className="px-3 py-1 bg-[rgba(168,85,247,0.1)] text-primary text-xs font-medium rounded-full">
        {job.type}
      </span>
    </div>
    <p className="text-sm text-muted mb-3 line-clamp-2">{job.description}</p>
    {job.matchReason && (
      <div className="text-xs text-primary bg-[rgba(168,85,247,0.1)] px-3 py-2 rounded-lg">
        ✓ {job.matchReason}
      </div>
    )}
  </div>
);

// Resource Card Component
const ResourceCard = ({ resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="neon-card p-6 hover:shadow-xl transition-all hover:-translate-y-1 block"
  >
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-semibold mb-1 text-main">{resource.title}</h3>
      <span className={`px-2 py-1 text-xs font-medium rounded ${
        resource.cost === 'Free' 
          ? 'bg-[rgba(168,85,247,0.1)] text-primary' 
          : 'bg-[rgba(213,0,249,0.1)] text-accent-pink'
      }`}>
        {resource.cost}
      </span>
    </div>
    <p className="text-sm text-muted mb-3">{resource.platform}</p>
    {resource.matchReason && (
      <div className="text-xs text-primary bg-[rgba(168,85,247,0.1)] px-3 py-2 rounded-lg">
        {resource.matchReason}
      </div>
    )}
  </a>
);

export default Dashboard;