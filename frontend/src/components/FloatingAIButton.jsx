import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';

const FloatingAIButton = () => {
  const location = useLocation();
  
  // Hide button on chatassistance page
  if (location.pathname === '/chatassistance') {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-24 right-8 z-50"
    >
      <Link to="/chatassistance">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="group relative block"
        >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-500/80 transition-all">
          <Bot className="text-white" size={32} />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="text-yellow-400 animate-pulse" size={18} />
          </div>
        </div>
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
            AI Assistant
          </div>
        </div>
      </motion.div>
      </Link>
    </motion.div>
  );
};

export default FloatingAIButton;
