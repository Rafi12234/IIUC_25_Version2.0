/**
 * Admin Login Page
 * Secure login page for admin users only
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle, Loader, Eye, EyeOff, LogIn, Home } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = 'admin@gmail.com';

const AdminLogin = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already authenticated as admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setIsAuthenticated(true);
        // Auto-redirect if already logged in as admin
        const timer = setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // User is not authenticated or not admin
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, [navigate, auth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (email !== ADMIN_EMAIL) {
      setError('Invalid admin credentials');
      toast.error('Only admin account can access this panel');
      return;
    }

    try {
      setLoading(true);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify it's the admin account
      if (result.user.email === ADMIN_EMAIL) {
        toast.success('Admin login successful!');
        setIsAuthenticated(true);
        
        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 500);
      } else {
        await auth.signOut();
        setError('Only admin account can access this panel');
        toast.error('Access denied');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed');
      }
      toast.error(error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, show success state
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="neon-card p-8 rounded-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mb-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{background:'linear-gradient(90deg,#A855F7,#D500F9)'}}>
                <CheckCircle size={32} className="text-white" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold glow-text mb-2">Welcome Admin!</h2>
            <p className="text-muted mb-6">Redirecting to admin panel...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4 pt-20">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#A855F7] to-[#D500F9] rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D500F9] to-[#A855F7] rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <Link to="/" className="flex items-center justify-center space-x-2 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-shadow duration-300" style={{background:'linear-gradient(90deg,#6A00F5,#D500F9)',boxShadow:'0 0 20px rgba(168,85,247,0.2)'}}>
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity" style={{background:'linear-gradient(90deg,#A855F7,#D500F9)'}}></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent glow-text" style={{backgroundImage:'linear-gradient(90deg,#A855F7,#D500F9)'}}>
              CareerPath
            </span>
          </Link>
        </motion.div>

        {/* Admin Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{background:'rgba(168,85,247,0.1)', color:'#C084FC'}}>
            <LogIn size={16} />
            Admin Portal
          </span>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neon-card rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-bold glow-text mb-2">Admin Login</h1>
          <p className="text-muted mb-8">Secure access to admin panel</p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium mb-2 text-main">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="admin@gmail.com"
                  className="input-field pl-12 w-full"
                  disabled={loading}
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium mb-2 text-main">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  className="input-field pl-12 pr-12 w-full"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between text-sm"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" disabled={loading} />
                <span className="text-muted">Remember me</span>
              </label>
              <button
                type="button"
                className="text-primary hover:text-primary-light transition-colors"
                disabled={loading}
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Login Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 font-semibold text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Login to Admin Panel</span>
                </>
              )}
            </motion.button>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="p-4 rounded-xl" style={{background:'rgba(168,85,247,0.05)', border:'1px solid rgba(168,85,247,0.1)'}}
            >
              <p className="text-xs text-muted leading-relaxed">
                🔒 This is a secure admin portal. Only authorized administrators with the correct credentials can access the panel.
              </p>
            </motion.div>
          </form>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm"
            >
              <Home size={16} />
              Back to Home
            </Link>
          </motion.div>
        </motion.div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-center text-xs text-muted"
        >
          <p>Protected by Firebase Authentication</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
