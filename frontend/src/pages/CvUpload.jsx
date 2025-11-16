import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, CheckCircle, AlertCircle, Loader, Save, Lightbulb } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export default function CvUpload() {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState("");
  const [showRawText, setShowRawText] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillsSuggestion, setSkillsSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file.");
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setError("");
        setCvData(null);
        setRawText("");
      }
    }
  };

  const getHotSkillsSuggestion = async (cvAnalysis) => {
    try {
      setLoadingSuggestion(true);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        console.warn("Gemini API key not configured");
        return;
      }

      const prompt = `Based on this CV analysis, suggest exactly 2 hot/trending skills that would make this person MORE marketable but are currently MISSING from their profile. 

Current Skills: ${cvAnalysis.keySkills?.join(", ") || "None"}
Tools & Tech: ${cvAnalysis.toolsTechnologies?.join(", ") || "None"}
Roles: ${cvAnalysis.rolesAndDomains?.join(", ") || "None"}

Respond in EXACTLY 2 lines. Each line should have one skill with a brief reason.
Format: "Skill Name - Why it's important for their profile"
Keep it SHORT and concise.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

      if (response.ok) {
        const data = await response.json();
        const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (suggestion) {
          setSkillsSuggestion(suggestion);
        }
      }
    } catch (err) {
      console.error("Error getting Gemini suggestion:", err);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setCvData(null);
    setRawText("");
    setSkillsSuggestion(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const apiUrl = (import.meta.env.VITE_API_URL || "https://backendcareerpath.vercel.app").replace(/\/+$/, "");
      const res = await fetch(`${apiUrl}/summarize-cv`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setCvData(data.data);
      setRawText(data.raw_text);
      
      // Get Gemini suggestion for hot skills
      await getHotSkillsSuggestion(data.data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to process CV. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToProfile = async () => {
    if (!currentUser || !cvData) {
      toast.error("No data to save");
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      
      // Get current user data
      const userDoc = await getDoc(userDocRef);
      const currentSkills = userDoc.exists() ? (userDoc.data().skills || []) : [];
      
      // Combine all extracted skills (remove duplicates)
      const allSkills = [...new Set([
        ...currentSkills,
        ...(cvData.keySkills || []),
        ...(cvData.toolsTechnologies || [])
      ])];

      // Update user profile
      await updateDoc(userDocRef, {
        skills: allSkills,
        cvAnalyzed: true,
        lastCvUpdate: new Date().toISOString()
      });

      toast.success("Skills added to your profile!");
    } catch (err) {
      console.error("Error saving to profile:", err);
      toast.error("Failed to save to profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div style={styles.headerIcon}>
          <FileText size={24} style={{ color: '#10B981' }} />
        </div>
        <div>
          <h1 style={styles.title}>CV Upload & Analysis</h1>
          <p style={styles.subtitle}>Upload your CV (PDF) and get an AI-powered analysis</p>
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={styles.uploadCard}
      >
        <div style={styles.uploadIcon}>
          <Upload size={48} style={{ color: '#10B981' }} />
        </div>
        
        <h2 style={styles.uploadTitle}>Select Your CV</h2>
        <p style={styles.uploadDescription}>
          Upload a PDF file and our AI will analyze your skills, experience, and strengths
        </p>

        <label htmlFor="file-upload" style={styles.fileInputLabel}>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          <div style={styles.fileInputButton}>
            <FileText size={20} />
            <span>{selectedFile ? selectedFile.name : "Choose PDF File"}</span>
          </div>
        </label>

        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.fileSelected}
          >
            <CheckCircle size={16} style={{ color: '#10B981' }} />
            <span>File selected: {selectedFile.name}</span>
          </motion.div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          style={{
            ...styles.uploadButton,
            ...((!selectedFile || loading) && styles.uploadButtonDisabled),
          }}
        >
          {loading ? (
            <>
              <Loader size={20} style={styles.spinner} />
              <span>Analyzing CV...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Upload & Analyze</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={styles.errorCard}
        >
          <AlertCircle size={20} style={{ color: '#EF4444' }} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* CV Analysis Results */}
      {cvData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.resultsCard}
          >
            <div style={styles.resultsHeader}>
              <div style={styles.resultsHeaderContent}>
                <Sparkles size={28} style={{ color: '#10B981' }} />
                <h2 style={styles.resultsTitle}>CV Analysis Results</h2>
              </div>
            </div>

            <div style={styles.sectionsContainer}>
              {/* Key Skills Section */}
              {cvData.keySkills && cvData.keySkills.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  style={styles.analysisSection}
                >
                  <div style={styles.sectionHeader}>
                    <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #10B981, #059669)'}}>
                      <CheckCircle size={20} style={{ color: '#FFFFFF' }} />
                    </div>
                    <h3 style={styles.sectionTitle}>Key Skills</h3>
                    <span style={styles.badge}>{cvData.keySkills.length}</span>
                  </div>
                  <div style={styles.tagGrid}>
                    {cvData.keySkills.map((skill, idx) => (
                      <motion.span 
                        key={idx} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        style={styles.skillTag}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tools & Technologies Section */}
              {cvData.toolsTechnologies && cvData.toolsTechnologies.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  style={styles.analysisSection}
                >
                  <div style={styles.sectionHeader}>
                    <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #3B82F6, #2563EB)'}}>
                      <FileText size={20} style={{ color: '#FFFFFF' }} />
                    </div>
                    <h3 style={styles.sectionTitle}>Tools & Technologies</h3>
                    <span style={{...styles.badge, background: 'rgba(59,130,246,0.15)', color: '#3B82F6'}}>
                      {cvData.toolsTechnologies.length}
                    </span>
                  </div>
                  <div style={styles.tagGrid}>
                    {cvData.toolsTechnologies.map((tool, idx) => (
                      <motion.span 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        style={styles.techTag}
                      >
                        {tool}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Roles & Domains Section */}
              {cvData.rolesAndDomains && cvData.rolesAndDomains.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={styles.analysisSection}
                >
                  <div style={styles.sectionHeader}>
                    <div style={{...styles.sectionIcon, background: 'linear-gradient(135deg, #A855F7, #7C3AED)'}}>
                      <Sparkles size={20} style={{ color: '#FFFFFF' }} />
                    </div>
                    <h3 style={styles.sectionTitle}>Relevant Roles & Domains</h3>
                    <span style={{...styles.badge, background: 'rgba(168,85,247,0.15)', color: '#A855F7'}}>
                      {cvData.rolesAndDomains.length}
                    </span>
                  </div>
                  <div style={styles.tagGrid}>
                    {cvData.rolesAndDomains.map((role, idx) => (
                      <motion.span 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        style={styles.roleTag}
                      >
                        {role}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Hot Skills Suggestion */}
            {skillsSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  margin: "0 2rem",
                  padding: "1.5rem",
                  background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1))",
                  borderRadius: "12px",
                  border: "1px solid rgba(168,85,247,0.25)",
                  boxShadow: "0 4px 12px rgba(168,85,247,0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <Lightbulb size={24} style={{ color: "#A855F7", marginTop: "2px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#FFFFFF", margin: "0 0 0.75rem 0" }}>
                      🚀 Hot Skills to Learn Now
                    </h3>
                    <div style={{ color: "#CBD5E1", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                      {skillsSuggestion}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {loadingSuggestion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  margin: "0 2rem",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  color: "#A855F7",
                }}
              >
                <Loader size={18} style={{ animation: "spin 1s linear infinite" }} />
                <span>Getting hot skills suggestions...</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(168,85,247,0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveToProfile}
              disabled={saving}
              style={{
                ...styles.saveButton,
                ...(saving && styles.saveButtonDisabled),
                marginTop: "2rem",
              }}
            >
              <div style={styles.saveButtonContent}>
                {saving ? (
                  <>
                    <Loader size={22} style={styles.spinner} />
                    <span>Saving to Profile...</span>
                  </>
                ) : (
                  <>
                    <Save size={22} />
                    <span>Add Skills to Profile</span>
                  </>
                )}
              </div>
            </motion.button>
          </motion.div>
        </>
      )}

      {/* Raw Text Section (Collapsible) */}
      {rawText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.rawTextCard}
        >
          <button
            onClick={() => setShowRawText(!showRawText)}
            style={styles.rawTextToggle}
          >
            <FileText size={18} />
            <span>{showRawText ? "Hide" : "Show"} Extracted Text</span>
          </button>
          
          {showRawText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.rawTextContent}
            >
              <pre style={styles.rawTextPre}>{rawText}</pre>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "Poppins, Inter, system-ui, sans-serif",
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px 24px",
    background: "rgba(17,21,43,0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(168,85,247,0.12)",
    boxShadow: "0 4px 20px rgba(10,8,30,0.4)",
  },
  headerIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #10B981, #059669)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(16,185,129,0.3)",
  },
  title: {
    color: "#FFFFFF",
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #10B981, #34D399)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    color: "#94A3B8",
    margin: 0,
    fontSize: "14px",
  },
  uploadCard: {
    background: "rgba(17,21,43,0.6)",
    padding: "2.5rem",
    borderRadius: "16px",
    border: "1px solid rgba(168,85,247,0.12)",
    boxShadow: "0 4px 20px rgba(10,8,30,0.4)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  uploadIcon: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.2))",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
    border: "2px solid rgba(16,185,129,0.2)",
  },
  uploadTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "0.5rem",
  },
  uploadDescription: {
    fontSize: "1rem",
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: "2rem",
    maxWidth: "500px",
  },
  fileInputLabel: {
    cursor: "pointer",
    width: "100%",
    maxWidth: "400px",
    marginBottom: "1rem",
  },
  fileInput: {
    display: "none",
  },
  fileInputButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    padding: "1rem 1.5rem",
    background: "rgba(30,41,59,0.5)",
    border: "2px dashed rgba(148,163,184,0.3)",
    borderRadius: "0.5rem",
    color: "#94A3B8",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  fileSelected: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    background: "rgba(16,185,129,0.1)",
    borderRadius: "0.5rem",
    border: "1px solid rgba(16,185,129,0.2)",
    color: "#10B981",
    fontSize: "0.875rem",
    marginBottom: "1rem",
  },
  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #10B981, #059669)",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
  },
  uploadButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
  },
  spinner: {
    animation: "spin 1s linear infinite",
  },
  errorCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 1.5rem",
    background: "rgba(239,68,68,0.1)",
    borderRadius: "0.5rem",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#EF4444",
    boxShadow: "0 2px 8px rgba(239,68,68,0.1)",
  },
  resultsCard: {
    background: "rgba(17,21,43,0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(168,85,247,0.12)",
    boxShadow: "0 4px 20px rgba(10,8,30,0.4)",
    overflow: "hidden",
  },
  resultsHeader: {
    padding: "2rem",
    background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(168,85,247,0.05))",
    borderBottom: "1px solid rgba(148,163,184,0.1)",
  },
  resultsHeaderContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  resultsTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
    background: "linear-gradient(90deg, #10B981, #A855F7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  sectionsContainer: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  analysisSection: {
    background: "rgba(30,41,59,0.3)",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid rgba(148,163,184,0.08)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.25rem",
  },
  sectionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
    flex: 1,
  },
  badge: {
    padding: "0.25rem 0.75rem",
    background: "rgba(16,185,129,0.15)",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#10B981",
  },
  tagGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "0.75rem",
  },
  skillTag: {
    padding: "0.75rem 1rem",
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "8px",
    color: "#10B981",
    fontSize: "0.9rem",
    fontWeight: "500",
    textAlign: "center",
    transition: "all 0.2s ease",
    cursor: "default",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  techTag: {
    padding: "0.75rem 1rem",
    background: "rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.25)",
    borderRadius: "8px",
    color: "#3B82F6",
    fontSize: "0.9rem",
    fontWeight: "500",
    textAlign: "center",
    transition: "all 0.2s ease",
    cursor: "default",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  roleTag: {
    padding: "0.75rem 1rem",
    background: "rgba(168,85,247,0.08)",
    border: "1px solid rgba(168,85,247,0.25)",
    borderRadius: "8px",
    color: "#A855F7",
    fontSize: "0.9rem",
    fontWeight: "500",
    textAlign: "center",
    transition: "all 0.2s ease",
    cursor: "default",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  saveButton: {
    margin: "0 2rem 2rem 2rem",
    padding: "1.25rem 2rem",
    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.125rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(168,85,247,0.3)",
    position: "relative",
    overflow: "hidden",
  },
  saveButtonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    position: "relative",
    zIndex: 1,
  },
  saveButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none !important",
  },
  summaryCard: {
    background: "rgba(17,21,43,0.6)",
    padding: "2rem",
    borderRadius: "16px",
    border: "1px solid rgba(168,85,247,0.12)",
    boxShadow: "0 4px 20px rgba(10,8,30,0.4)",
  },
  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid rgba(148,163,184,0.1)",
  },
  summaryTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
  },
  rawTextCard: {
    background: "rgba(17,21,43,0.6)",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px solid rgba(168,85,247,0.12)",
    boxShadow: "0 4px 20px rgba(10,8,30,0.4)",
  },
  rawTextToggle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    background: "rgba(30,41,59,0.5)",
    border: "1px solid rgba(148,163,184,0.1)",
    borderRadius: "0.5rem",
    color: "#94A3B8",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s ease",
  },
  rawTextContent: {
    marginTop: "1rem",
    maxHeight: "400px",
    overflow: "auto",
    background: "rgba(15,23,42,0.5)",
    borderRadius: "0.5rem",
    padding: "1rem",
    border: "1px solid rgba(148,163,184,0.1)",
  },
  rawTextPre: {
    margin: 0,
    fontSize: "0.875rem",
    lineHeight: "1.6",
    color: "#CBD5E1",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: "monospace",
  },
};

// Add spinner animation
const spinnerStyle = document.createElement('style');
spinnerStyle.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);
