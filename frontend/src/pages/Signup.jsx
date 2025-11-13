import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ...existing handleSubmit logic
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        {/* ...existing form fields... */}
        <button type="submit">Sign Up</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-white text-gray-700 border border-gray-300 px-4 py-2 hover:bg-gray-50 transition"
      >
        {/* ...Google SVG from Login.jsx... */}
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

export default Signup;
