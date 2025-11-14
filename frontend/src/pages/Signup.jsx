import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
        className="w-full flex items-center justify-center gap-2 rounded-md bg-[rgba(255,255,255,0.05)] text-main border border-[rgba(255,255,255,0.1)] px-4 py-2 hover:bg-[rgba(255,255,255,0.1)] transition"
      >
        {/* ...Google SVG from Login.jsx... */}
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

export default Signup;
