/**
 * Admin Layout Component
 * Sidebar navigation for admin panel with theme matching
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Menu, X, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin-dashboard',
      badge: null
    },
    {
      name: 'Jobs Management',
      icon: Briefcase,
      href: '/admin/jobs',
      badge: null
    },
    {
      name: 'Courses',
      icon: Briefcase,
      href: '/admin/courses',
      badge: null
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '#',
      badge: 'Soon',
      disabled: true
    }
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
  };

  return (
    <div className="min-h-screen bg-base flex">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={isMobile ? 'closed' : 'open'}
        animate={sidebarOpen ? 'open' : 'closed'}
        className="fixed lg:static top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-gradient-to-b from-[#11152B] to-[#0B0E1C] border-r border-[rgba(168,85,247,0.1)] z-50 overflow-y-auto flex flex-col"
      >
        {/* Close Button for Mobile */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 hover:bg-[rgba(168,85,247,0.1)] rounded-lg transition-colors"
          >
            <X size={20} className="text-primary" />
          </button>
        )}

        {/* Sidebar Header */}
        <div className="p-6 border-b border-[rgba(168,85,247,0.1)]">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(90deg,#6A00F5,#D500F9)' }}>
                <span className="text-white font-bold text-lg">প</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity" style={{ background: 'linear-gradient(90deg,#A855F7,#D500F9)' }}></div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent glow-text" style={{ backgroundImage: 'linear-gradient(90deg,#A855F7,#D500F9)' }}>
                Admin
              </span>
              <p className="text-xs text-muted">Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white'
                      : 'text-muted hover:text-primary hover:bg-[rgba(168,85,247,0.06)]'
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={isActive ? { boxShadow: '0 0 20px rgba(168,85,247,0.3)' } : {}}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-primary group-hover:text-primary'} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[rgba(168,85,247,0.1)] space-y-2">
          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#11152B]/95 backdrop-blur-md border-b border-[rgba(168,85,247,0.1)] px-6 py-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[rgba(168,85,247,0.1)] rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold glow-text">Admin Panel</h1>
          <div className="w-10"></div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
