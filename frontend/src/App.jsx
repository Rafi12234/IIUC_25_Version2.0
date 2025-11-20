/**
 * App Component
 * Main application with routing and layout
 */
import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './contexts/AuthContext';

// Components (loaded immediately as they're needed on every page)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingAIButton from "./components/FloatingAIButton";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Resources = lazy(() => import("./pages/Resources"));
const LearningResources = lazy(() => import("./pages/LearningResources"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chatassistance = lazy(() => import("./pages/Chatassistance"));
const CareerRoadmap = lazy(() => import("./pages/CareerRoadmap"));
const CvUpload = lazy(() => import("./pages/CvUpload"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCourses = lazy(() => import("./pages/AdminCourses"));
const JobMarketInsights = lazy(() => import("./pages/JobMarketInsights"));
const MockInterview = lazy(() => import("./pages/MockInterview"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-base">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const hideNavbarRoutes = ['/job-market-insights'];
  const shouldHideNavbar = isAdminRoute || hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="App">
      {/* Show navbar only for non-admin routes and non-navbar-hidden routes */}
      {!shouldHideNavbar && <Navbar />}
      {/* Add padding-top to account for fixed navbar only for non-admin routes */}
      <div className={!shouldHideNavbar ? 'pt-20' : ''}>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/cv-upload" element={<ProtectedRoute><CvUpload /></ProtectedRoute>} />
            <Route path="/career-roadmap" element={<ProtectedRoute><CareerRoadmap /></ProtectedRoute>} />
            <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
            <Route path="/job-market-insights" element={<JobMarketInsights />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/jobs" element={<AdminProtectedRoute><AdminPanel /></AdminProtectedRoute>} />
            <Route path="/admin/courses" element={<AdminProtectedRoute><AdminCourses /></AdminProtectedRoute>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
      {/* Show footer only for non-admin routes */}
      {!isAdminRoute && <Footer />}
      {/* Floating AI Assistant Button - Show on all pages */}
      <FloatingAIButton />
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
