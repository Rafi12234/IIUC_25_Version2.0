import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, AlertCircle, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Chatassistance() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    { role: "model", content: "Hi! I'm a Gemini-powered chatbot. I'm here to help you with questions about youth development, skill development, job opportunities, and career guidance. How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const chatBoxRef = useRef(null);

  // Topics the chatbot can discuss
  const allowedTopics = [
    // Youth Development
    "youth", "young professional", "graduate", "entry-level", "internship", "mentor", "development", "growth",
    // Skill Development
    "skill", "training", "course", "learning", "education", "certification", "programming", "technical", "soft skills",
    "communication", "leadership", "problem-solving", "critical thinking", "creativity", "teamwork", "project management",
    // Job Related
    "job", "career", "employment", "resume", "cv", "interview", "application", "recruitment", "hiring", "salary",
    "position", "role", "responsibility", "company", "employer", "workplace", "promotion", "advancement", "salary",
    "experience", "qualification", "skillset", "portfolio", "networking", "recruiter", "hr", "human resources",
    // General Career/Development
    "roadmap", "path", "opportunity", "goal", "objective", "plan", "strategy", "guidance", "advice", "help",
    "learn", "improve", "enhance", "develop", "build", "strengthen", "excel", "succeed", "industry", "field",
    "domain", "sector", "market", "trend", "future", "prospect", "opportunity", "professional", "career growth"
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Load chat history from Firebase on mount
  useEffect(() => {
    if (currentUser) {
      loadChatHistory();
    }
  }, [currentUser]);

  // Save messages to Firebase
  const saveChatHistory = async (messagesToSave) => {
    if (!currentUser) return;
    
    try {
      setIsSaving(true);
      const chatDocRef = doc(db, "users", currentUser.uid, "chatHistory", "conversations");
      
      // Check if document exists
      const docSnap = await getDoc(chatDocRef);
      
      if (docSnap.exists()) {
        // Update existing document with new messages
        await updateDoc(chatDocRef, {
          messages: messagesToSave,
          lastUpdated: serverTimestamp(),
        });
      } else {
        // Create new document
        await setDoc(chatDocRef, {
          messages: messagesToSave,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast.error("Failed to save conversation");
    } finally {
      setIsSaving(false);
    }
  };

  // Load chat history from Firebase
  const loadChatHistory = async () => {
    if (!currentUser) return;
    
    try {
      const chatDocRef = doc(db, "users", currentUser.uid, "chatHistory", "conversations");
      const docSnap = await getDoc(chatDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Keep the initial greeting and add saved messages (skip the default greeting if it exists)
        if (data.messages && data.messages.length > 0) {
          // Filter out the default greeting if it's the only message
          const savedMessages = data.messages.filter(m => m.content !== "Hi! I'm a Gemini-powered chatbot. I'm here to help you with questions about youth development, skill development, job opportunities, and career guidance. How can I assist you?");
          if (savedMessages.length > 0) {
            setMessages([
              { role: "model", content: "Hi! I'm a Gemini-powered chatbot. I'm here to help you with questions about youth development, skill development, job opportunities, and career guidance. How can I assist you?" },
              ...savedMessages
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  // Clear chat history
  const clearChatHistory = async () => {
    if (!currentUser) return;
    
    if (!window.confirm("Are you sure you want to clear all chat history?")) {
      return;
    }

    try {
      const chatDocRef = doc(db, "users", currentUser.uid, "chatHistory", "conversations");
      await setDoc(chatDocRef, {
        messages: [],
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
      
      // Reset messages to initial state
      setMessages([
        { role: "model", content: "Hi! I'm a Gemini-powered chatbot. I'm here to help you with questions about youth development, skill development, job opportunities, and career guidance. How can I assist you?" }
      ]);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Error clearing chat history:", error);
      toast.error("Failed to clear chat history");
    }
  };

  // Add keyframe animation
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.7;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }
      
      @keyframes typing {
        0% {
          transform: translateY(0);
          opacity: 0.7;
        }
        20% {
          transform: translateY(-8px);
          opacity: 1;
        }
        40% {
          transform: translateY(0);
          opacity: 0.7;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Check if message is related to allowed topics
  const isTopicRelevant = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Reject if it's asking about general knowledge (capital, geography, history, etc.)
    const blockedPatterns = [
      /what is the capital of/i,
      /what is the (largest|smallest|highest|lowest)/i,
      /tell me about the history of/i,
      /where is /i,
      /when was /i,
      /who (is|was) /i,
      /calculate|math|equation|formula/i,
      /recipe|cook|food|restaurant/i,
      /movie|song|music|actor|celebrity|film/i,
      /sports|game|football|cricket|sport|team/i,
      /weather|climate|temperature/i,
      /joke|funny|laugh|comic/i,
      /love|relationship|dating|romantic/i,
      /politics|government|election/i,
      /news|current events/i,
      /covid|pandemic|health (advice|issue)/i,
      /travel|vacation|tourism/i,
    ];

    // Check if message matches any blocked patterns
    const isBlocked = blockedPatterns.some(pattern => pattern.test(lowerMessage));
    if (isBlocked) return false;

    // Check if it has career-related context words
    const careerContexts = [
      "job", "career", "skill", "learn", "develop", "interview", "resume", "cv", "salary",
      "hire", "recruit", "work", "employ", "profession", "role", "position", "experience",
      "training", "course", "mentor", "guidance", "help", "advice", "improve", "enhance",
      "roadmap", "path", "growth", "advance", "opportunity", "how to", "tips for", "ways to",
      "best way", "what skills", "which course", "how can i", "can i", "should i", "need to",
      "prepare", "boost", "strengthen", "excel", "succeed", "professional", "employment"
    ];

    const words = lowerMessage.replace(/[.,!?;:]/g, '').split(/\s+/);
    const hasCareerContext = words.some(word => 
      careerContexts.some(context => word.includes(context) || context.includes(word))
    );

    // If no career context, reject it
    if (!hasCareerContext) return false;

    // Must have career context to proceed
    return true;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setError("");
    setInput("");

    // Check if the message is relevant to the portal's purpose
    if (!isTopicRelevant(userMessage)) {
      const restrictedMessages = [
        { role: "user", content: userMessage },
        { 
          role: "model", 
          content: "I appreciate your question, but I'm specifically designed to help with youth development, skill development, job opportunities, and career guidance. Could you please ask a question related to these topics? I'm here to help you with career advice, skill-building, job search strategies, or professional growth! 🎯",
          isRestricted: true 
        }
      ];
      setMessages(prev => [...prev, ...restrictedMessages]);
      // Save restricted messages to Firebase
      if (currentUser) {
        await saveChatHistory([...messages, ...restrictedMessages]);
      }
      return;
    }

    // Add user message to chat
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build history (excluding the current user message)
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call backend
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      
      // Add bot response
      const updatedMessages = [...newMessages, { role: "model", content: data.reply }];
      setMessages(updatedMessages);
      
      // Save to Firebase
      if (currentUser) {
        await saveChatHistory(updatedMessages);
      }
    } catch (error) {
      console.error("Error:", error);
      // Add error message
      const errorMessages = [
        ...newMessages,
        { role: "model", content: "Sorry, something went wrong talking to the server. Please try again." }
      ];
      setMessages(errorMessages);
      
      // Save error state to Firebase
      if (currentUser) {
        await saveChatHistory(errorMessages);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
          <Sparkles size={24} style={{ color: '#A855F7' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={styles.title}>AI Assistance</h1>
          <p style={styles.subtitle}>Career & Skill Development Assistant</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearChatHistory}
          title="Clear chat history"
          style={{
            padding: "8px 12px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "8px",
            color: "#EF4444",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </motion.button>
      </motion.div>

      {/* Chat Messages */}
      <div ref={chatBoxRef} style={styles.chatBox}>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "model" && (
                <div style={styles.avatar}>
                  <Bot size={18} style={{ color: '#A855F7' }} />
                </div>
              )}
              <div
                style={{
                  ...styles.messageBubble,
                  ...(msg.role === "user" ? styles.userBubble : styles.modelBubble),
                  ...(msg.isRestricted ? styles.restrictedBubble : {}),
                }}
              >
                {msg.isRestricted && (
                  <div style={styles.restrictionWarning}>
                    <AlertCircle size={16} />
                    <span>Out of Scope</span>
                  </div>
                )}
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div style={styles.avatarUser}>
                  <User size={18} style={{ color: '#FFFFFF' }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...styles.messageRow, justifyContent: "flex-start" }}
          >
            <div style={styles.avatar}>
              <Bot size={18} style={{ color: '#A855F7' }} />
            </div>
            <div style={{ ...styles.messageBubble, ...styles.modelBubble, ...styles.typingIndicator }}>
              <span style={{...styles.dot, animationDelay: '0s'}}></span>
              <span style={{...styles.dot, animationDelay: '0.2s'}}></span>
              <span style={{...styles.dot, animationDelay: '0.4s'}}></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.inputArea}
      >
        <div style={styles.inputWrapper}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about jobs, skills, career roadmap... (Enter to send, Shift+Enter for new line)"
            style={styles.textarea}
            rows={1}
            disabled={loading}
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage} 
            style={{
              ...styles.button,
              opacity: loading || !input.trim() ? 0.5 : 1,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
            }} 
            disabled={loading || !input.trim()}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "Poppins, Inter, system-ui, sans-serif",
    height: "calc(100vh - 80px)",
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
    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(168,85,247,0.3)",
  },
  title: {
    color: "#FFFFFF",
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #A855F7, #D500F9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    margin: 0,
    fontSize: "14px",
    fontWeight: "400",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    background: "rgba(17,21,43,0.4)",
    borderRadius: "16px",
    border: "1px solid rgba(168,85,247,0.08)",
    minHeight: "400px",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(168,85,247,0.3) transparent",
  },
  messageRow: {
    display: "flex",
    marginBottom: "20px",
    alignItems: "flex-end",
    gap: "12px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "rgba(168,85,247,0.1)",
    border: "1px solid rgba(168,85,247,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarUser: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 0 15px rgba(168,85,247,0.3)",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "14px 18px",
    borderRadius: "16px",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    lineHeight: "1.5",
    fontSize: "15px",
  },
  userBubble: {
    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
    color: "#FFFFFF",
    borderBottomRightRadius: "4px",
    boxShadow: "0 4px 12px rgba(168,85,247,0.2)",
  },
  modelBubble: {
    background: "rgba(255,255,255,0.04)",
    color: "#FFFFFF",
    border: "1px solid rgba(168,85,247,0.08)",
    borderBottomLeftRadius: "4px",
  },
  restrictedBubble: {
    background: "rgba(251,146,60,0.1)",
    border: "1px solid rgba(251,146,60,0.3)",
    color: "#FBBF24",
  },
  restrictionWarning: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    padding: "8px 12px",
    background: "rgba(251,146,60,0.2)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#FCD34D",
    borderBottom: "1px solid rgba(251,146,60,0.3)",
    paddingBottom: "12px",
    marginBottom: "12px",
  },
  typingIndicator: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    padding: "14px 20px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#A855F7",
    display: "inline-block",
    animation: "typing 1.4s infinite ease-in-out",
  },
  inputArea: {
    padding: "0",
  },
  inputWrapper: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    padding: "16px 20px",
    background: "rgba(17,21,43,0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(168,85,247,0.12)",
    boxShadow: "0 4px 20px rgba(10,8,30,0.4)",
  },
  textarea: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(168,85,247,0.15)",
    fontSize: "15px",
    fontFamily: "Poppins, Inter, system-ui, sans-serif",
    resize: "none",
    background: "rgba(255,255,255,0.04)",
    color: "#FFFFFF",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    maxHeight: "120px",
    minHeight: "44px",
  },
  button: {
    padding: "12px 16px",
    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(168,85,247,0.3)",
    transition: "all 0.2s",
    height: "44px",
    width: "44px",
  },
};
