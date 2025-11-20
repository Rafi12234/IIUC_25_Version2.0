/**
 * Register Page
 * New user registration with profile setup + Firestore ChatBot doc creation + Interest Selection
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Target,
  LogOut,
  Heart,
} from 'lucide-react';

// 🔥 Firebase imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut,
} from 'firebase/auth';

// 🔥 Firestore imports
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyC8za3ZI4m9gUrYsueUum907vpuKzV8H0Q',
  authDomain: 'iiuc25.firebaseapp.com',
  projectId: 'iiuc25',
  storageBucket: 'iiuc25.firebasestorage.app',
  messagingSenderId: '75690391713',
  appId: '1:75690391713:web:4c72c5316547c8bc68d8e0',
  measurementId: 'G-82V42TWJ9J',
};

// 🔥 Initialize Firebase app & services (safe for hot reloads)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    education: 'Undergraduate',
    experienceLevel: 'Student',
    careerTrack: 'Web Development',
  });
  // NEW: State for selected interests
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // NEW: Available interest topics
  const interestTopics = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Web Development',
    'Digital Marketing',
    'Cybersecurity',
    'Agentic Ai',
  ];

  // Listen for auth state changes (logged-in user)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Optional: redirect if already logged in from before
  useEffect(() => {
    if (currentUser) {
      console.log('Auth state changed, currentUser:', currentUser.email);
      // If you think this might be redirecting too early, you can comment this out:
      // navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // NEW: Handle interest checkbox selection (max 3)
  const handleInterestToggle = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        // Remove if already selected
        return prev.filter((item) => item !== interest);
      } else {
        // Add only if less than 3 are selected
        if (prev.length < 3) {
          return [...prev, interest];
        }
        return prev;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // NEW: Validate interests selection
    if (selectedInterests.length !== 3) {
      setError('Please select exactly 3 topics of interest.');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting signup for:', formData.email);

      // 1️⃣ Create user with email & password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('User created:', userCredential.user.email);

      // 2️⃣ Set display name
      if (formData.name) {
        await updateProfile(userCredential.user, {
          displayName: formData.name,
        });
        console.log('Display name updated to:', formData.name);
      }

      // 3️⃣ Create Firestore document in collection "ChatBot" with doc ID = email
      const chatBotDocRef = doc(db, 'ChatBot', formData.email);
      console.log('Writing Firestore doc at ChatBot/' + formData.email);

      await setDoc(
        chatBotDocRef,
        {
          email: formData.email,
          name: formData.name,
          education: formData.education,
          experienceLevel: formData.experienceLevel,
          careerTrack: formData.careerTrack,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      console.log('ChatBot document successfully created for:', formData.email);

      // 4️⃣ NEW: Create document in "All_User" collection with subcollection "Interest"
      // Structure: All_User/{email}/Interest/interest
      const interestDocRef = doc(
        db,
        'All_User',
        formData.email,
        'Interest',
        'interest'
      );

      await setDoc(interestDocRef, {
        Topic_1: selectedInterests[0] || '',
        Topic_2: selectedInterests[1] || '',
        Topic_3: selectedInterests[2] || '',
        createdAt: serverTimestamp(),
      });

      console.log('Interest document successfully created for:', formData.email);
      console.log('Selected interests:', selectedInterests);

      // 5️⃣ Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration / Firestore error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const educationOptions = ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'];
  const experienceLevels = ['Student', 'Fresher', 'Junior', 'Mid-level', 'Senior'];
  const careerTracks = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'UI/UX Design',
    'Digital Marketing',
    'Content Writing',
    'Graphic Design',
    'Business',
    'Other',
  ];

  // If user is already logged in, show logout option
  if (currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="neon-card p-8">
            <h2 className="text-2xl font-bold glow-text mb-4">Already Logged In</h2>
            <p className="text-muted mb-6">
              You are already logged in as {currentUser.displayName || currentUser.email}
            </p>
            <div className="space-y-4">
              <Link to="/dashboard" className="w-full btn-primary block">
                Go to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl font-bold mb-2 glow-text">Start Your Journey</h2>
          <p className="text-muted">Create your CareerPath account and discover opportunities</p>
        </div>

        {/* Registration Form */}
        <div className="neon-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="John Doe"
                    aria-label="Full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="you@example.com"
                    aria-label="Email address"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password * (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  aria-label="Password"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Education */}
              <div>
                <label htmlFor="education" className="block text-sm font-medium mb-2">
                  <GraduationCap className="inline mr-1" size={16} />
                  Education
                </label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="input-field"
                  aria-label="Education level"
                >
                  {educationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium mb-2">
                  <Briefcase className="inline mr-1" size={16} />
                  Experience
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="input-field"
                  aria-label="Experience level"
                >
                  {experienceLevels.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Career Track */}
              <div>
                <label htmlFor="careerTrack" className="block text-sm font-medium mb-2">
                  <Target className="inline mr-1" size={16} />
                  Career Track
                </label>
                <select
                  id="careerTrack"
                  name="careerTrack"
                  value={formData.careerTrack}
                  onChange={handleChange}
                  className="input-field"
                  aria-label="Career track"
                >
                  {careerTracks.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ==================== NEW SECTION: Interest Selection ==================== */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium mb-3">
                <Heart className="inline mr-1" size={16} />
                Select Your Topics of Interest * (Choose exactly 3)
              </label>
              <p className="text-xs text-text-muted mb-4">
                Selected: {selectedInterests.length}/3
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {interestTopics.map((topic) => {
                  const isSelected = selectedInterests.includes(topic);
                  const isDisabled = !isSelected && selectedInterests.length >= 3;
                  
                  return (
                    <label
                      key={topic}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[rgba(168,85,247,0.06)] border-[rgba(168,85,247,0.18)]'
                          : isDisabled
                          ? 'bg-section border-[rgba(255,255,255,0.02)] opacity-50 cursor-not-allowed'
                          : 'bg-section border-[rgba(255,255,255,0.04)] hover:border-[rgba(168,85,247,0.12)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleInterestToggle(topic)}
                        disabled={isDisabled}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <span className={`text-sm ${isSelected ? 'font-medium text-primary' : ''}`}>
                        {topic}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            {/* ==================== END NEW SECTION ==================== */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;