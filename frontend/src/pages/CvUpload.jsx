import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function CvUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState("");
  const [showRawText, setShowRawText] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file.");
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setError("");
        setSummary("");
        setRawText("");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");
    setRawText("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("http://localhost:8000/summarize-cv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setSummary(data.summary);
      setRawText(data.raw_text);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to process CV. Please try again.");
    } finally {
      setLoading(false);
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

      {/* Summary Section */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.summaryCard}
        >
          <div style={styles.summaryHeader}>
            <Sparkles size={24} style={{ color: '#10B981' }} />
            <h2 style={styles.summaryTitle}>CV Analysis</h2>
          </div>
          <div style={styles.summaryContent}>
            {summary.split('\n').map((line, idx) => (
              <p key={idx} style={styles.summaryText}>
                {line}
              </p>
            ))}
          </div>
        </motion.div>
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
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    background: "white",
    padding: "1.5rem 2rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "900px",
    width: "100%",
  },
  headerIcon: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1F2937",
    margin: 0,
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6B7280",
    margin: 0,
  },
  uploadCard: {
    background: "white",
    padding: "2.5rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "900px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  uploadIcon: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  uploadTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "0.5rem",
  },
  uploadDescription: {
    fontSize: "1rem",
    color: "#6B7280",
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
    background: "#F3F4F6",
    border: "2px dashed #D1D5DB",
    borderRadius: "0.5rem",
    color: "#4B5563",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  fileSelected: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    background: "#D1FAE5",
    borderRadius: "0.5rem",
    color: "#065F46",
    fontSize: "0.875rem",
    marginBottom: "1rem",
  },
  uploadButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
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
    background: "#FEE2E2",
    borderRadius: "0.5rem",
    color: "#991B1B",
    maxWidth: "900px",
    width: "100%",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
  },
  summaryCard: {
    background: "white",
    padding: "2rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "900px",
    width: "100%",
    marginBottom: "1.5rem",
  },
  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #E5E7EB",
  },
  summaryTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: 0,
  },
  summaryContent: {
    lineHeight: "1.8",
  },
  summaryText: {
    color: "#374151",
    fontSize: "1rem",
    marginBottom: "0.75rem",
    whiteSpace: "pre-wrap",
  },
  rawTextCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    maxWidth: "900px",
    width: "100%",
  },
  rawTextToggle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    background: "#F3F4F6",
    border: "none",
    borderRadius: "0.5rem",
    color: "#4B5563",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s ease",
  },
  rawTextContent: {
    marginTop: "1rem",
    maxHeight: "400px",
    overflow: "auto",
    background: "#F9FAFB",
    borderRadius: "0.5rem",
    padding: "1rem",
  },
  rawTextPre: {
    margin: 0,
    fontSize: "0.875rem",
    lineHeight: "1.6",
    color: "#374151",
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
