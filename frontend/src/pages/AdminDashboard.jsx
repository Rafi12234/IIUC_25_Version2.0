/**
 * Admin Dashboard
 * Main admin dashboard page with overview and statistics
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, TrendingUp, AlertCircle, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import AdminLayout from '../components/AdminLayout';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    pendingApplications: 0,
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeChart, setActiveChart] = useState('overview');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Count jobs
      const jobsRef = collection(db, 'jobs');
      const jobsSnapshot = await getDocs(jobsRef);
      const totalJobs = jobsSnapshot.size;

      // Count users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      // Count total applicants from all jobs
      let totalApplicants = 0;
      const applicantsByTrack = {};
      const applicantsByLocation = {};
      const applicantsByExperience = {};
      
      for (const jobDoc of jobsSnapshot.docs) {
        const jobData = jobDoc.data();
        
        // Count fields that match the pattern "Applicant_X"
        let jobApplicants = 0;
        for (const key in jobData) {
          if (key.startsWith('Applicant_')) {
            jobApplicants++;
            totalApplicants++;
          }
        }

        // Group by career track
        if (jobData.track) {
          applicantsByTrack[jobData.track] = (applicantsByTrack[jobData.track] || 0) + jobApplicants;
        }

        // Group by location
        if (jobData.location) {
          applicantsByLocation[jobData.location] = (applicantsByLocation[jobData.location] || 0) + jobApplicants;
        }

        // Group by experience level
        if (jobData.experienceRequired) {
          applicantsByExperience[jobData.experienceRequired] = (applicantsByExperience[jobData.experienceRequired] || 0) + jobApplicants;
        }
      }

      setStats({
        totalJobs,
        totalUsers,
        pendingApplications: totalApplicants,
      });

      setAnalyticsData({
        totalJobs,
        totalUsers,
        totalApplicants,
        applicantsByTrack,
        applicantsByLocation,
        applicantsByExperience,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-card p-6 rounded-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted text-sm mb-2">{label}</p>
          <p className="text-3xl font-bold glow-text">{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold glow-text mb-2">Admin Dashboard</h1>
          <p className="text-muted">Welcome back! Here's your platform overview.</p>
        </div>

        {/* Statistics Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={Briefcase}
              label="Total Jobs"
              value={stats.totalJobs}
              color="#A855F7"
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              color="#D500F9"
            />
            <StatCard
              icon={TrendingUp}
              label="Applications"
              value={stats.pendingApplications}
              color="#06B6D4"
            />
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="neon-card p-6 rounded-xl mb-8"
        >
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              onClick={() => window.location.href = '/admin/jobs'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-lg text-left transition-all duration-200"
              style={{
                background: 'linear-gradient(90deg,#A855F7,#D500F9)',
                boxShadow: '0 0 20px rgba(168,85,247,0.3)',
              }}
            >
              <Briefcase size={24} className="text-white mb-2" />
              <p className="font-semibold text-white">Manage Jobs</p>
              <p className="text-sm text-white/80">Create and edit job postings</p>
            </motion.button>

            <motion.button
              onClick={() => setShowAnalytics(!showAnalytics)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-lg text-left transition-all duration-200 border border-[rgba(168,85,247,0.3)] hover:border-[rgba(168,85,247,0.6)] hover:shadow-lg hover:shadow-[rgba(168,85,247,0.2)]"
              style={{
                background: 'rgba(168,85,247,0.06)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <BarChart3 size={24} className="text-primary mb-2" />
                  <p className="font-semibold" style={{ color: '#FFFFFF' }}>
                    View Analytics
                  </p>
                  <p className="text-sm text-muted">Platform statistics and insights</p>
                </div>
                {showAnalytics ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-primary" />}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Information Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-lg flex items-start space-x-4"
          style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-400">Admin Access Active</p>
            <p className="text-sm text-muted mt-1">
              You have full access to the platform management features. Use the sidebar to navigate between different admin tools.
            </p>
          </div>
        </motion.div>

        {/* Analytics Section */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 neon-card p-8 rounded-xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold glow-text flex items-center gap-3">
                <BarChart3 size={32} />
                Platform Analytics & Insights
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : !analyticsData ? (
              <div className="text-center py-12">
                <p className="text-muted text-lg">No analytics data available yet. Add some jobs and applicants to see insights!</p>
              </div>
            ) : (
              <>
                {/* Chart Tabs */}
            <div className="flex gap-2 flex-wrap mb-8">
              {['overview', 'track', 'location', 'experience'].map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveChart(tab)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    activeChart === tab
                      ? 'bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white shadow-lg'
                      : 'bg-white/10 text-main hover:bg-white/20'
                  }`}
                >
                  {tab === 'overview' && '📊 Overview'}
                  {tab === 'track' && '🎯 Career Tracks'}
                  {tab === 'location' && '📍 Locations'}
                  {tab === 'experience' && '💼 Experience'}
                </motion.button>
              ))}
            </div>

            {/* Chart Container */}
            <motion.div
              key={activeChart}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 border border-primary/20 rounded-xl p-8"
            >
              {activeChart === 'overview' && analyticsData.totalJobs > 0 && (
                <div className="h-96 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: ['Jobs Posted', 'Users', 'Applicants'],
                      datasets: [
                        {
                          label: 'Platform Overview',
                          data: [analyticsData.totalJobs, analyticsData.totalUsers, analyticsData.totalApplicants],
                          backgroundColor: [
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(6, 182, 212, 0.8)',
                            'rgba(34, 197, 94, 0.8)',
                          ],
                          borderColor: [
                            'rgb(168, 85, 247)',
                            'rgb(6, 182, 212)',
                            'rgb(34, 197, 94)',
                          ],
                          borderWidth: 3,
                          hoverOffset: 15,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: '#E0E0E0',
                            font: { size: 12, weight: '500' },
                            padding: 15,
                            usePointStyle: true,
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#E0E0E0',
                          borderColor: 'rgba(168, 85, 247, 0.5)',
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                        }
                      }
                    }}
                  />
                </div>
              )}

              {activeChart === 'track' && Object.keys(analyticsData.applicantsByTrack).length > 0 && (
                <div className="h-96">
                  <Bar
                    data={{
                      labels: Object.keys(analyticsData.applicantsByTrack),
                      datasets: [
                        {
                          label: 'Applicants by Career Track',
                          data: Object.values(analyticsData.applicantsByTrack),
                          backgroundColor: [
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(213, 0, 249, 0.8)',
                            'rgba(6, 182, 212, 0.8)',
                            'rgba(34, 197, 94, 0.8)',
                          ],
                          borderColor: [
                            'rgb(168, 85, 247)',
                            'rgb(213, 0, 249)',
                            'rgb(6, 182, 212)',
                            'rgb(34, 197, 94)',
                          ],
                          borderWidth: 2,
                          borderRadius: 8,
                        }
                      ]
                    }}
                    options={{
                      indexAxis: 'y',
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#E0E0E0',
                          borderColor: 'rgba(168, 85, 247, 0.5)',
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                        }
                      },
                      scales: {
                        y: {
                          ticks: { color: '#A0A0A0' },
                          grid: { color: 'rgba(168, 85, 247, 0.1)' }
                        },
                        x: {
                          ticks: { color: '#A0A0A0' },
                          grid: { color: 'rgba(168, 85, 247, 0.1)' }
                        }
                      }
                    }}
                  />
                </div>
              )}

              {activeChart === 'location' && Object.keys(analyticsData.applicantsByLocation).length > 0 && (
                <div className="h-96">
                  <Line
                    data={{
                      labels: Object.keys(analyticsData.applicantsByLocation),
                      datasets: [
                        {
                          label: 'Applicants by Location',
                          data: Object.values(analyticsData.applicantsByLocation),
                          borderColor: 'rgb(168, 85, 247)',
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: 'rgb(168, 85, 247)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 6,
                          pointHoverRadius: 8,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: '#E0E0E0',
                            font: { size: 12, weight: '500' },
                            padding: 15,
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#E0E0E0',
                          borderColor: 'rgba(168, 85, 247, 0.5)',
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                        }
                      },
                      scales: {
                        y: {
                          ticks: { color: '#A0A0A0' },
                          grid: { color: 'rgba(168, 85, 247, 0.1)' }
                        },
                        x: {
                          ticks: { color: '#A0A0A0' },
                          grid: { color: 'rgba(168, 85, 247, 0.1)' }
                        }
                      }
                    }}
                  />
                </div>
              )}

              {activeChart === 'experience' && Object.keys(analyticsData.applicantsByExperience).length > 0 && (
                <div className="h-96 flex items-center justify-center">
                  <Doughnut
                    data={{
                      labels: Object.keys(analyticsData.applicantsByExperience),
                      datasets: [
                        {
                          label: 'Applicants by Experience',
                          data: Object.values(analyticsData.applicantsByExperience),
                          backgroundColor: [
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(213, 0, 249, 0.8)',
                            'rgba(6, 182, 212, 0.8)',
                          ],
                          borderColor: [
                            'rgb(168, 85, 247)',
                            'rgb(213, 0, 249)',
                            'rgb(6, 182, 212)',
                          ],
                          borderWidth: 2,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: '#E0E0E0',
                            font: { size: 12, weight: '500' },
                            padding: 15,
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#fff',
                          bodyColor: '#E0E0E0',
                          borderColor: 'rgba(168, 85, 247, 0.5)',
                          borderWidth: 1,
                          padding: 12,
                          cornerRadius: 8,
                        }
                      }
                    }}
                  />
                </div>
              )}
            </motion.div>

            {/* Analytics Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-primary/30 p-6 rounded-lg text-center"
              >
                <p className="text-3xl font-bold glow-text">{analyticsData.totalJobs}</p>
                <p className="text-muted text-sm mt-2">Total Jobs</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-primary/30 p-6 rounded-lg text-center"
              >
                <p className="text-3xl font-bold glow-text">{analyticsData.totalUsers}</p>
                <p className="text-muted text-sm mt-2">Total Users</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-primary/30 p-6 rounded-lg text-center"
              >
                <p className="text-3xl font-bold glow-text">{analyticsData.totalApplicants}</p>
                <p className="text-muted text-sm mt-2">Total Applicants</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 border border-primary/30 p-6 rounded-lg text-center"
              >
                <p className="text-3xl font-bold glow-text">{analyticsData.totalJobs > 0 ? (analyticsData.totalApplicants / analyticsData.totalJobs).toFixed(1) : 0}</p>
                <p className="text-muted text-sm mt-2">Avg Per Job</p>
              </motion.div>
            </div>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
