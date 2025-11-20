/**
 * Navbar Component
 * Responsive navigation with mobile menu and dark mode toggle
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationButton from './NotificationButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Resources', href: '/resources' },
    { name: 'Contact', href: '/contact' },
  ];

  const aiFeatures = [
    { name: 'AI Assistance', href: '/chatassistance', icon: '💬' },
    { name: 'CV Upload', href: '/cv-upload', icon: '📄' },
    { name: 'Career Roadmap', href: '/career-roadmap', icon: '🗺️' },
    { name: 'Mock Interview', href: '/mock-interview', icon: '🎤' },
  ];

  const publicNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Resources', href: '/resources' },
    { name: 'Contact', href: '/contact' },
  ];

  const userNavLinks = [];

  const navVariants = {
    initial: { y: -100 },
    animate: { y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const linkVariants = {
    initial: { y: 20, opacity: 0 },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="initial"
      animate="animate"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: `linear-gradient(90deg, rgba(168, 85, 247, ${Math.max(0.15, Math.min(scrollY / 300, 0.5))}), rgba(212, 0, 249, ${Math.max(0.1, Math.min(scrollY / 300, 0.4))})), rgba(11, 14, 28, ${Math.max(0.2, Math.min(scrollY / 200, 0.6))})`,
        backdropFilter: `blur(${Math.min(scrollY / 5, 90)}px)`,
        borderBottom: scrollY > 20 ? '1px solid rgba(168,85,247,0.2)' : 'none',
        paddingTop: scrollY > 50 ? '0.5rem' : '1rem',
        paddingBottom: scrollY > 50 ? '0.5rem' : '1rem',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-shadow duration-300" style={{background:'linear-gradient(90deg,#6A00F5,#D500F9)',boxShadow:'0 0 20px rgba(168,85,247,0.08)'}}>
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity" style={{background:'linear-gradient(90deg,#A855F7,#D500F9)'}}></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent glow-text" style={{backgroundImage:'linear-gradient(90deg,#A855F7,#D500F9)'}}>
                CareerPath
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {(currentUser ? navLinks : publicNavLinks).map((link, index) => (
              <motion.div key={link.name} whileHover={{ y: -2 }}>
                <Link
                  to={link.href}
                  className={`cursor-hover relative px-4 py-2 rounded-lg font-medium transition-all duration-200 group ${
                    location.pathname === link.href
                      ? 'text-primary'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  <div
                    className={`absolute inset-0 rounded-lg transition-all duration-200 ${
                      location.pathname === link.href
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                    }`}
                    style={{background: 'rgba(168,85,247,0.06)'}}
                  />
                  <div
                    className={`absolute bottom-0 left-1/2 h-0.5 transition-all duration-200 ${
                      location.pathname === link.href
                        ? 'w-3/4 -translate-x-1/2'
                        : 'w-0 -translate-x-1/2 group-hover:w-1/2'
                    }`}
                    style={{background: 'linear-gradient(90deg,#A855F7,#D500F9)'}}
                  />
                </Link>
              </motion.div>
            ))}

            {/* AI Features Dropdown */}
            {currentUser && (
              <div className="relative group">
                <motion.button
                  whileHover={{ y: -2 }}
                  onMouseEnter={() => setShowAIMenu(true)}
                  onMouseLeave={() => setShowAIMenu(false)}
                  className="cursor-hover relative px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-muted hover:text-primary"
                >
                  <Sparkles size={18} />
                  <span className="relative z-10">AI Tools</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${showAIMenu ? 'rotate-180' : ''}`} />
                  <div
                    className={`absolute inset-0 rounded-lg transition-all duration-200 ${
                      showAIMenu
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                    }`}
                    style={{background: 'rgba(168,85,247,0.06)'}}
                  />
                  <div
                    className={`absolute bottom-0 left-1/2 h-0.5 transition-all duration-200 ${
                      showAIMenu
                        ? 'w-3/4 -translate-x-1/2'
                        : 'w-0 -translate-x-1/2 group-hover:w-1/2'
                    }`}
                    style={{background: 'linear-gradient(90deg,#A855F7,#D500F9)'}}
                  />
                </motion.button>

                {/* AI Dropdown Menu */}
                <AnimatePresence>
                  {showAIMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onMouseEnter={() => setShowAIMenu(true)}
                      onMouseLeave={() => setShowAIMenu(false)}
                      className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-xl border py-2 z-50 neon-card"
                      style={{background:'#11152B', borderColor:'rgba(168,85,247,0.12)'}}
                    >
                      {aiFeatures.map((feature, index) => (
                        <Link
                          key={feature.name}
                          to={feature.href}
                          onClick={() => setShowAIMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(168,85,247,0.08)] transition-all duration-150 group"
                        >
                          <span className="text-xl">{feature.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{color:'#FFFFFF'}}>{feature.name}</p>
                            <p className="text-xs text-muted">
                              {feature.name === 'AI Assistance' && 'Get AI help'}
                              {feature.name === 'CV Upload' && 'Analyze your CV'}
                              {feature.name === 'Career Roadmap' && 'Plan your career'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {currentUser ? (
              <>
                {currentUser && <NotificationButton />}
                <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-neon-glow"
                  style={{background:'rgba(17,21,43,0.6)', borderColor:'rgba(168,85,247,0.12)'}}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" style={{background:'linear-gradient(90deg,#A855F7,#D500F9)'}}>
                    <User size={18} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{color:'#FFFFFF'}}>
                      {currentUser.displayName?.split(' ')[0] || 'User'}
                    </p>
                  </div>
                  <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-64 rounded-xl shadow-xl border py-3 z-50 neon-card"
                      style={{background:'#11152B', borderColor:'rgba(168,85,247,0.12)'}}
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b" style={{borderColor:'rgba(255,255,255,0.04)'}}>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm" style={{background:'linear-gradient(90deg,#A855F7,#D500F9)'}}>
                            <User size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{color:'#FFFFFF'}}>
                              {currentUser.displayName || 'User Name'}
                            </p>
                            <p className="text-xs text-muted truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Profile Option */}
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-[rgba(168,85,247,0.06)] transition-all duration-150 group"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150" style={{background:'rgba(168,85,247,0.06)'}}>
                            <User size={16} className="text-primary glow-icon" />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{color:'#FFFFFF'}}>Profile</p>
                            <p className="text-xs text-muted">
                              Manage your account
                            </p>
                          </div>
                        </Link>

                        {/* Logout Option */}
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-[rgba(239,68,68,0.06)] transition-all duration-150 group"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150" style={{background:'rgba(239,68,68,0.06)'}}>
                            <LogOut size={16} className="text-red-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium" style={{color:'#FFFFFF'}}>Logout</p>
                            <p className="text-xs text-muted">
                              Sign out of your account
                            </p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Click outside to close */}
                {showUserMenu && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="px-4 py-2 font-medium text-muted hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="cursor-hover relative px-6 py-2.5 font-medium text-white rounded-xl btn-primary"
                  >
                    <span className="relative z-10">Get Started</span>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-[rgba(168,85,247,0.06)] transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {[...(currentUser ? navLinks : publicNavLinks), ...(currentUser ? userNavLinks : [])].map((link, index) => (
                  <motion.div
                    key={link.name}
                    variants={linkVariants}
                    initial="initial"
                    animate="animate"
                    custom={index}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        location.pathname === link.href
                          ? 'text-primary border-l-4'
                          : 'text-muted hover:bg-[rgba(168,85,247,0.06)]'
                      }`}
                      style={location.pathname === link.href ? {background:'rgba(168,85,247,0.06)', borderColor:'#A855F7'} : {}}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                {currentUser && (
                  <>
                    {/* AI Tools Section */}
                    <motion.div
                      variants={linkVariants}
                      initial="initial"
                      animate="animate"
                      custom={navLinks.length + userNavLinks.length}
                      className="pt-2"
                    >
                      <div className="px-4 py-2 flex items-center space-x-2">
                        <Sparkles size={16} className="text-primary" />
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">AI Tools</span>
                      </div>
                      <div className="space-y-1 mt-2">
                        {aiFeatures.map((feature, idx) => (
                          <Link
                            key={feature.name}
                            to={feature.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                              location.pathname === feature.href
                                ? 'text-primary border-l-4'
                                : 'text-muted hover:bg-[rgba(168,85,247,0.06)]'
                            }`}
                            style={location.pathname === feature.href ? {background:'rgba(168,85,247,0.06)', borderColor:'#A855F7'} : {}}
                          >
                            <span className="text-lg">{feature.icon}</span>
                            <span>{feature.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>

                    {/* Profile Link */}
                    <motion.div
                      variants={linkVariants}
                      initial="initial"
                      animate="animate"
                      custom={navLinks.length + userNavLinks.length + aiFeatures.length}
                      className="pt-2"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          location.pathname === '/profile'
                            ? 'text-primary border-l-4'
                            : 'text-muted hover:bg-[rgba(168,85,247,0.06)]'
                        }`}
                        style={location.pathname === '/profile' ? {background:'rgba(168,85,247,0.06)', borderColor:'#A855F7'} : {}}
                      >
                        Profile
                      </Link>
                    </motion.div>
                  </>
                )}

                <div className="pt-4 border-t" style={{borderColor:'rgba(255,255,255,0.04)'}}>
                  {currentUser ? (
                    <motion.button
                      variants={linkVariants}
                      initial="initial"
                      animate="animate"
                      custom={navLinks.length + userNavLinks.length}
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-left text-red-500 hover:bg-[rgba(239,68,68,0.06)] rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </motion.button>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-center font-medium text-muted hover:bg-[rgba(168,85,247,0.06)] rounded-lg transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-center font-medium text-white rounded-lg transition-colors shadow-lg btn-primary"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
