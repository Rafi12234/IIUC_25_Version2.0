/**
 * Login Page
 * User authentication with email and password
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogle = async () => {
    const { success } = await signInWithGoogle();
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-bg-muted dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-text-muted">Log in to continue your career journey</p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  aria-label="Password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm mt-2 text-center">
                {error}
              </div>
            )}

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
                  <span>Log In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-white text-gray-700 border border-gray-300 px-4 py-2 hover:bg-gray-50 transition"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.78-.07-1.53-.21-2.27H12.24v4.3h6.33a5.4 5.4 0 0 1-2.34 3.55v2.94h3.78c2.21-2.04 3.48-5.05 3.48-8.52z"
                />
                <path
                  fill="#34A853"
                  d="M12.24 24c3.18 0 5.85-1.05 7.8-2.86l-3.78-2.94c-1.05.7-2.4 1.12-4.02 1.12-3.09 0-5.71-2.08-6.65-4.87H1.71v3.05A11.98 11.98 0 0 0 12.24 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.59 14.45a7.2 7.2 0 0 1-.38-2.25c0-.78.14-1.55.38-2.25V6.9H1.71A11.98 11.98 0 0 0 .24 12.2c0 1.91.46 3.71 1.47 5.3l3.88-3.05z"
                />
                <path
                  fill="#EA4335"
                  d="M12.24 4.78c1.73 0 3.28.6 4.51 1.78l3.37-3.37C18.09 1.08 15.42 0 12.24 0 7.41 0 3.2 2.7 1.24 6.9l3.88 3.05c.94-2.79 3.56-5.17 7.12-5.17z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials info */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-text-muted text-center">
            <strong>Demo:</strong> Register a new account or use your credentials
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
