import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Sparkles, Target, Zap, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CareerRoadmap() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [goalJob, setGoalJob] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [step, setStep] = useState('input');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setIsLoadingProfile(true);
      
      if (!currentUser?.email) {
        console.warn('No current user email available');
        setUserData({
          skills: [],
          experienceLevel: 'beginner',
          email: ''
        });
        setIsLoadingProfile(false);
        return;
      }

      console.log('Fetching user data for UID:', currentUser.uid);
      let userData = null;

      // Try fetching by UID first (document ID = user UID)
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          console.log('User document found by UID');
          userData = userDocSnap.data();
        }
      } catch (uidErr) {
        console.log('UID query failed, trying email query:', uidErr);
      }

      // If UID didn't work, try email query
      if (!userData) {
        console.log('Trying email query for:', currentUser.email);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
        
        console.log('Email query result count:', querySnapshot.size);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          console.log('User document found by email');
          userData = userDoc;
        }
      }

      if (userData) {
        setUserData({
          skills: Array.isArray(userData.skills) ? userData.skills : [],
          experienceLevel: userData.experienceLevel || 'beginner',
          email: userData.email || currentUser.email
        });
        setError(null);
      } else {
        console.warn('No user document found, using defaults');
        setUserData({
          skills: [],
          experienceLevel: 'beginner',
          email: currentUser.email
        });
      }
      setIsLoadingProfile(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Still set default data so the component works
      setUserData({
        skills: [],
        experienceLevel: 'beginner',
        email: currentUser?.email || ''
      });
      setIsLoadingProfile(false);
    }
  };

  const generateRoadmap = async () => {
    if (!goalJob.trim()) {
      toast.error('Please enter your goal job');
      return;
    }

    setStep('loading');
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const prompt = `You are a career counselor. Analyze this user profile and create a detailed career roadmap.

User Profile:
- Experience Level: ${userData?.experienceLevel || 'beginner'}
- Current Skills: ${userData?.skills?.length > 0 ? userData.skills.join(', ') : 'No skills listed yet'}
- Goal Position: ${goalJob}

Generate a structured roadmap with:
1. Current Assessment (brief summary of current position)
2. Skills Gap (list 4-6 key skills needed for the goal role)
3. Step-by-Step Path (5-7 actionable steps to reach the goal)
4. Timeline (realistic timeframe for each step)
5. Resources (specific courses, tools, or certifications)
6. Quick Wins (2-3 things they can do immediately)

Format clearly with headers and bullet points.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate roadmap');
      }

      const data = await response.json();
      const roadmapContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!roadmapContent) {
        throw new Error('No roadmap generated');
      }

      setRoadmap({
        goalJob,
        currentLevel: userData?.experienceLevel,
        currentSkills: userData?.skills || [],
        content: roadmapContent,
        generatedAt: new Date().toLocaleString()
      });

      setStep('display');
      toast.success('Roadmap generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate roadmap');
      setStep('input');
      toast.error(error.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const resetRoadmap = () => {
    setRoadmap(null);
    setGoalJob('');
    setStep('input');
    setError(null);
  };

  const downloadRoadmap = () => {
    const text = `Career Roadmap for ${roadmap.goalJob}\n\n${roadmap.content}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `roadmap-${roadmap.goalJob.replace(/\s+/g, '-')}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Roadmap downloaded!');
  };

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.header}
      >
        <div style={styles.headerIcon}>
          <Sparkles size={28} style={{ color: '#A855F7' }} />
        </div>
        <div>
          <h1 style={styles.title}>AI Career Roadmap</h1>
          <p style={styles.subtitle}>Get your personalized path to success</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoadingProfile && (
          <motion.div
            key="profile-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.loadingContainer}
          >
            <div style={styles.loadingContent}>
              <div style={styles.spinner}>
                <Sparkles size={48} style={{ color: '#A855F7', animation: 'spin 2s linear infinite' }} />
              </div>
              <h3 style={styles.loadingText}>Loading your profile...</h3>
            </div>
          </motion.div>
        )}

        {!isLoadingProfile && step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={styles.content}
          >
            {userData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={styles.profileCard}
              >
                <h2 style={styles.sectionTitle}>Your Current Profile</h2>
                <div style={styles.profileInfo}>
                  <div style={styles.profileItem}>
                    <span style={styles.label}>Experience Level:</span>
                    <span style={styles.value}>
                      {userData.experienceLevel?.charAt(0).toUpperCase() + userData.experienceLevel?.slice(1)}
                    </span>
                  </div>
                  <div style={styles.profileItem}>
                    <span style={styles.label}>Current Skills:</span>
                    <div style={styles.skillsTags}>
                      {userData.skills?.length > 0 ? (
                        userData.skills.map((skill, idx) => (
                          <span key={idx} style={styles.skillTag}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={styles.noSkills}>No skills added yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={styles.inputCard}
            >
              <h2 style={styles.sectionTitle}>What's Your Goal?</h2>
              <p style={styles.inputDescription}>
                Tell us the job position or role you want to achieve
              </p>
              <div style={styles.inputGroup}>
                <Target size={20} style={{ color: '#A855F7' }} />
                <input
                  type="text"
                  value={goalJob}
                  onChange={(e) => setGoalJob(e.target.value)}
                  placeholder="e.g., Senior Full Stack Developer, Product Manager..."
                  style={styles.input}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') generateRoadmap();
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateRoadmap}
                disabled={loading || !goalJob.trim()}
                style={{
                  ...styles.generateButton,
                  opacity: loading || !goalJob.trim() ? 0.5 : 1,
                  cursor: loading || !goalJob.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Generate Roadmap
                  </>
                )}
              </motion.button>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.errorCard}
              >
                <p style={styles.errorText}>{error}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {!isLoadingProfile && step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.loadingContainer}
          >
            <div style={styles.loadingContent}>
              <div style={styles.spinner}>
                <Sparkles size={48} style={{ color: '#A855F7', animation: 'spin 2s linear infinite' }} />
              </div>
              <h3 style={styles.loadingText}>Generating Your Career Roadmap...</h3>
              <p style={styles.loadingSubtext}>Analyzing your profile and creating your personalized plan</p>
            </div>
          </motion.div>
        )}

        {!isLoadingProfile && step === 'display' && roadmap && (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={styles.content}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={styles.roadmapHeader}
            >
              <div>
                <h2 style={styles.roadmapTitle}>{roadmap.goalJob}</h2>
                <p style={styles.roadmapSubtitle}>
                  Your personalized career path from {roadmap.currentLevel} to your goal
                </p>
              </div>
              <CheckCircle size={32} style={{ color: '#10B981' }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={styles.roadmapContent}
            >
              {roadmap.content.split('\n').map((line, idx) => {
                if (line.trim() === '') return null;
                
                if (line.includes('**') || line.match(/^\d+\./)) {
                  return (
                    <h3 key={idx} style={styles.roadmapSectionTitle}>
                      {line.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                
                if (line.startsWith('-') || line.startsWith('•')) {
                  return (
                    <div key={idx} style={styles.bulletPoint}>
                      <ArrowRight size={16} style={{ color: '#A855F7', marginRight: '8px', flexShrink: 0 }} />
                      <span>{line.replace(/^[-•]\s*/, '')}</span>
                    </div>
                  );
                }

                return (
                  <p key={idx} style={styles.roadmapText}>
                    {line}
                  </p>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={styles.actionButtons}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetRoadmap}
                style={styles.secondaryButton}
              >
                Create New
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadRoadmap}
                style={styles.primaryButton}
              >
                Download
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'Poppins, Inter, system-ui, sans-serif',
    minHeight: 'calc(100vh - 160px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
    padding: '24px',
    background: 'rgba(17,21,43,0.6)',
    borderRadius: '16px',
    border: '1px solid rgba(168,85,247,0.12)',
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    color: '#FFFFFF',
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(90deg, #A855F7, #D500F9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    margin: '4px 0 0 0',
    fontSize: '14px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  profileCard: {
    padding: '24px',
    background: 'rgba(17,21,43,0.4)',
    borderRadius: '16px',
    border: '1px solid rgba(168,85,247,0.08)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 16px 0',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  profileItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '120px',
  },
  value: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
  },
  skillsTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  skillTag: {
    display: 'inline-block',
    padding: '6px 12px',
    background: 'rgba(168,85,247,0.2)',
    color: '#A855F7',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid rgba(168,85,247,0.3)',
  },
  noSkills: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  inputCard: {
    padding: '24px',
    background: 'rgba(17,21,43,0.4)',
    borderRadius: '16px',
    border: '1px solid rgba(168,85,247,0.08)',
  },
  inputDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    margin: '0 0 16px 0',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    border: '1px solid rgba(168,85,247,0.15)',
    marginBottom: '16px',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'Poppins, Inter, system-ui, sans-serif',
  },
  generateButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
  },
  errorCard: {
    padding: '16px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '12px',
  },
  errorText: {
    color: '#FCA5A5',
    margin: 0,
    fontSize: '14px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  loadingContent: {
    textAlign: 'center',
  },
  spinner: {
    marginBottom: '20px',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  loadingSubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    margin: 0,
  },
  roadmapHeader: {
    padding: '24px',
    background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(213,0,249,0.05))',
    borderRadius: '16px',
    border: '1px solid rgba(168,85,247,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roadmapTitle: {
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    background: 'linear-gradient(90deg, #A855F7, #D500F9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  roadmapSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    margin: 0,
  },
  roadmapContent: {
    padding: '24px',
    background: 'rgba(17,21,43,0.4)',
    borderRadius: '16px',
    border: '1px solid rgba(168,85,247,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  roadmapSectionTitle: {
    color: '#A855F7',
    fontSize: '16px',
    fontWeight: '600',
    margin: '8px 0 12px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  bulletPoint: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    lineHeight: '1.6',
    padding: '8px 0',
  },
  roadmapText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '8px 0',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
  },
  secondaryButton: {
    padding: '12px 24px',
    background: 'transparent',
    color: '#A855F7',
    border: '1px solid rgba(168,85,247,0.3)',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
