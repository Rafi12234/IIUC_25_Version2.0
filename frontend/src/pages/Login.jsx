/**
 * Login Page
 * User authentication with email and password
 * Two login options: User Login and Admin Login
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Loader, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_EMAIL = 'admin@gmail.com';

const Login = () => {
  const [loginType, setLoginType] = useState(null); // 'user' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      // Check if admin and redirect accordingly
      if (currentUser.email === ADMIN_EMAIL) {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation for User Login
    if (loginType === 'user' && email === ADMIN_EMAIL) {
      setError('Admin email cannot be used for user login. Please use a different email.');
      return;
    }

    // Validation for Admin Login
    if (loginType === 'admin' && email !== ADMIN_EMAIL) {
      setError('Only admin@gmail.com can access the admin panel.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      
      // If user logged in, check if they're admin
      if (loginType === 'user') {
        navigate('/dashboard');
      } else if (loginType === 'admin') {
        navigate('/admin-dashboard');
      }
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    if (loginType !== 'user') {
      setError('Google Sign-In is only available for regular users.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Google sign-in failed: ' + error.message);
    }
    setLoading(false);
  };

  // Login Type Selection Screen
  if (!loginType) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-base pt-20">
        {/* Background Glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#A855F7] to-[#D500F9] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D500F9] to-[#A855F7] rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full relative z-10"
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
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background:'linear-gradient(90deg,#6A00F5,#D500F9)'}}>
                  <span className="text-white font-bold text-xl">C</span>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{backgroundImage:'linear-gradient(90deg,#A855F7,#D500F9)'}}>
                CareerPath
              </span>
            </Link>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-2 glow-text">Welcome</h2>
            <p className="text-muted text-lg">Choose your login type to continue</p>
          </div>

          {/* Login Type Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Login Card */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLoginType('user')}
              className="neon-card p-8 text-left cursor-pointer transition-all hover:shadow-2xl group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'rgba(168,85,247,0.1)'}}>
                  <LogIn className="text-primary" size={24} />
                </div>
                <ArrowRight className="text-muted group-hover:text-primary transition-colors" size={20} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-main">User Login</h3>
              <p className="text-muted text-sm mb-4">
                Access your career dashboard, browse jobs, and manage your profile
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <CheckCircle size={16} />
                <span>Join thousands of job seekers</span>
              </div>
            </motion.button>

            {/* Admin Login Card */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLoginType('admin')}
              className="neon-card p-8 text-left cursor-pointer transition-all hover:shadow-2xl group border-2" style={{borderColor:'rgba(168,85,247,0.3)'}}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'rgba(168,85,247,0.15)'}}>
                  <Shield className="text-primary" size={24} />
                </div>
                <ArrowRight className="text-muted group-hover:text-primary transition-colors" size={20} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-main">Admin Login</h3>
              <p className="text-muted text-sm mb-4">
                Access the admin panel to manage job postings and system settings
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <Shield size={16} />
                <span>Secure admin access only</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Login Form Screen
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-base pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            {loginType === 'admin' ? (
              <Shield className="text-primary" size={28} />
            ) : (
              <LogIn className="text-primary" size={28} />
            )}
          </motion.div>
          <h2 className="font-heading text-3xl font-bold mb-2 glow-text">
            {loginType === 'admin' ? 'Admin Login' : 'Welcome Back'}
          </h2>
          <p className="text-muted">
            {loginType === 'admin' 
              ? 'Access the admin panel with your credentials' 
              : 'Log in to continue your career journey'}
          </p>
        </div>

        {/* Login Form */}
        <div className="neon-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="input-field pl-11"
                  placeholder={loginType === 'admin' ? 'admin@gmail.com' : 'you@example.com'}
                  aria-label="Email address"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="input-field pl-11 pr-12"
                  placeholder="••••••••"
                  aria-label="Password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3"
              >
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed py-3"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>{loginType === 'admin' ? 'Admin Login' : 'Log In'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In Button - Only for User Login */}
          {loginType === 'user' && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-section border border-[rgba(255,255,255,0.04)] hover:shadow-neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="mt-6 text-center">
            {loginType === 'user' ? (
              <p className="text-sm text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                  Sign up here
                </Link>
              </p>
            ) : (
              <p className="text-sm text-muted">
                Not an admin?{' '}
                <button
                  onClick={() => setLoginType(null)}
                  className="text-primary hover:text-primary-dark font-medium cursor-pointer"
                >
                  Go back
                </button>
              </p>
            )}
          </div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setLoginType(null)}
            className="w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-primary hover:bg-[rgba(168,85,247,0.06)] transition-all"
          >
            ← Back to Login Options
          </motion.button>
        </div>

        {/* Demo credentials info */}
        {loginType === 'user' && (
          <div className="mt-4 p-4 rounded-lg" style={{background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.08)'}}>
            <p className="text-xs text-muted text-center">
              <strong>Demo:</strong> Register a new account or use your credentials (not admin@gmail.com)
            </p>
          </div>
        )}

        {loginType === 'admin' && (
          <div className="mt-4 p-4 rounded-lg" style={{background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.08)'}}>
            <p className="text-xs text-muted text-center">
              <strong>🔒 Secure:</strong> Only admin@gmail.com can access the admin panel
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
