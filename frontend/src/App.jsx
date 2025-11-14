/**
 * App Component
 * Main application with routing and layout
 */
import React from 'react';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Pages
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Resources from "./pages/Resources";
import LearningResources from "./pages/LearningResources";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Chatassistance from "./pages/chatassistance";
import CareerRoadmap from "./pages/CareerRoadmap";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourses from "./pages/AdminCourses";

function AppContent() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Check if current user is admin
  const isAdmin = currentUser?.email === 'admin@gmail.com';

  return (
    <div className="App">
      {/* Show navbar only for non-admin routes */}
      {!isAdminRoute && <Navbar />}
      {/* Add padding-top to account for fixed navbar only for non-admin routes */}
      <div className={!isAdminRoute ? 'pt-20' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Home route - show home page or redirect if logged in */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/learning-resources" element={
              <ProtectedRoute>
                <LearningResources />
              </ProtectedRoute>
            } />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chatassistance" element={<ProtectedRoute><Chatassistance /></ProtectedRoute>} />
            <Route path="/career-roadmap" element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/jobs" element={<AdminProtectedRoute><AdminPanel /></AdminProtectedRoute>} />
            <Route path="/admin/courses" element={<AdminProtectedRoute><AdminCourses /></AdminProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
      {/* Show footer only for non-admin routes */}
      {!isAdminRoute && <Footer />}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
