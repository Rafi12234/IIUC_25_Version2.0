/**
 * App Component
 * Main application with routing and layout
 */
import React from 'react';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CursorEffect } from './cursor';

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import JobMatchPage from "./pages/JobMatchPage";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ChatBot from "./pages/ChatBot";

function AppContent() {
  const location = useLocation();
  const { currentUser } = useAuth();

  return (
    <div className="App">
      <CursorEffect />
      <Navbar />
      {/* Add padding-top to account for fixed navbar */}
      <div className="pt-20">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Redirect authenticated users from home to dashboard */}
            <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/match" element={<ProtectedRoute><JobMatchPage /></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><ChatBot /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
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
