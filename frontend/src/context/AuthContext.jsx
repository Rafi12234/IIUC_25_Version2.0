/**
 * Authentication Context (Firebase)
 * Manages Firebase auth state and exposes auth helpers.
 */
import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  updateProfile,
  getRedirectResult,
} from 'firebase/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });

    getRedirectResult(auth)
      .then(result => {
        if (result?.user) setUser(result.user);
      })
      .catch(error => {
        if (error?.code !== 'auth/operation-not-supported-in-this-environment') {
          toast.error(error.message || 'Google sign-in failed');
        }
      });

    return () => unsubscribe();
  }, []);

  const register = async ({ email, password, name }) => {
    try {
      const { user: createdUser } = await createUserWithEmailAndPassword(auth, email, password);

      if (name) {
        await updateProfile(createdUser, { displayName: name });
        setUser({ ...createdUser, displayName: name });
      } else {
        setUser(createdUser);
      }

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const { user: signedInUser } = await signInWithEmailAndPassword(auth, email, password);
      setUser(signedInUser);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signInWithGoogle = async (useRedirect = false) => {
    try {
      const credential = useRedirect
        ? (await signInWithRedirect(auth, googleProvider))
        : (await signInWithPopup(auth, googleProvider));
      const firebaseUser = credential?.user || auth.currentUser;
      if (firebaseUser) setUser(firebaseUser);
      toast.success('Signed in with Google!');
      return { success: true, user: firebaseUser };
    } catch (error) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message || 'Google sign-in failed');
      }
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const resetPassword = async email => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateUser = async updates => {
    if (!auth.currentUser) return { success: false, error: 'No user signed in' };

    try {
      await updateProfile(auth.currentUser, updates);
      const refreshedUser = { ...auth.currentUser, ...updates };
      setUser(refreshedUser);
      toast.success('Profile updated');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
