/**
 * Analytics Modal Component
 * Displays interactive charts with smooth animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Users, Briefcase, Activity } from 'lucide-react';
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
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

const AnalyticsModal = ({ isOpen, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      loadAnalyticsData();
    }
  }, [isOpen]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Get all jobs
      const jobsRef = collection(db, 'jobs');
      const jobsSnapshot = await getDocs(jobsRef);
      const jobs = [];
      const applicantsByTrack = {};
      const applicantsByLocation = {};
      const applicantsByExperience = {};

      let totalApplicants = 0;

      jobsSnapshot.forEach((doc) => {
        const jobData = doc.data();
        jobs.push(jobData);

        // Count applicants
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
      });

      // Get users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      setAnalyticsData({
        totalJobs: jobs.length,
        totalUsers,
        totalApplicants,
        applicantsByTrack,
        applicantsByLocation,
        applicantsByExperience,
        jobs
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Chart data for Applicants by Track
  const trackChartData = {
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
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(168, 85, 247)',
          'rgb(213, 0, 249)',
          'rgb(6, 182, 212)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(213, 0, 249, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)',
        ]
      }
    ]
  };

  // Chart data for Applicants by Location
  const locationChartData = {
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
  };

  // Chart data for Experience Level Distribution
  const experienceChartData = {
    labels: Object.keys(analyticsData.applicantsByExperience),
    datasets: [
      {
        label: 'Applicants',
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
  };

  // Platform Overview Doughnut Chart
  const overviewChartData = {
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
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#E0E0E0',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#E0E0E0',
        borderColor: 'rgba(168, 85, 247, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#A0A0A0',
        },
        grid: {
          color: 'rgba(168, 85, 247, 0.1)',
        }
      },
      x: {
        ticks: {
          color: '#A0A0A0',
        },
        grid: {
          color: 'rgba(168, 85, 247, 0.1)',
        }
      },
      r: {
        ticks: {
          color: '#A0A0A0',
        },
        grid: {
          color: 'rgba(168, 85, 247, 0.1)',
        }
      }
    }
  };

  const StatBox = ({ icon: Icon, label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-card p-6 rounded-xl flex items-start gap-4"
    >
      <div
        className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon size={28} style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-muted text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold glow-text">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a2e] rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#A855F7] to-[#D500F9] p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity size={28} />
                Platform Analytics & Insights
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {/* Overview Stats */}
                <div>
                  <h3 className="text-xl font-bold glow-text mb-4">Platform Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox
                      icon={Briefcase}
                      label="Total Jobs"
                      value={analyticsData.totalJobs}
                      color="#A855F7"
                    />
                    <StatBox
                      icon={Users}
                      label="Total Users"
                      value={analyticsData.totalUsers}
                      color="#06B6D4"
                    />
                    <StatBox
                      icon={TrendingUp}
                      label="Total Applicants"
                      value={analyticsData.totalApplicants}
                      color="#22C55E"
                    />
                    <StatBox
                      icon={Activity}
                      label="Avg Per Job"
                      value={analyticsData.totalJobs > 0 ? (analyticsData.totalApplicants / analyticsData.totalJobs).toFixed(1) : 0}
                      color="#F97316"
                    />
                  </div>
                </div>

                {/* Charts Tabs */}
                <div className="space-y-6">
                  <div className="flex gap-2 flex-wrap">
                    {['overview', 'track', 'location', 'experience'].map((tab) => (
                      <motion.button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                          activeTab === tab
                            ? 'bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white shadow-lg'
                            : 'bg-white/10 text-main hover:bg-white/20'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </motion.button>
                    ))}
                  </div>

                  {/* Chart Container */}
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="neon-card p-8 rounded-xl"
                  >
                    {activeTab === 'overview' && (
                      <div className="h-96 flex items-center justify-center">
                        <div className="w-full h-full relative">
                          <Doughnut
                            data={overviewChartData}
                            options={{
                              ...chartOptions,
                              plugins: {
                                ...chartOptions.plugins,
                                legend: {
                                  ...chartOptions.plugins.legend,
                                  position: 'bottom'
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'track' && (
                      <div className="h-96">
                        <Bar
                          data={trackChartData}
                          options={{
                            ...chartOptions,
                            indexAxis: 'y',
                            plugins: {
                              ...chartOptions.plugins,
                              legend: {
                                display: false
                              }
                            }
                          }}
                        />
                      </div>
                    )}

                    {activeTab === 'location' && (
                      <div className="h-96">
                        <Line
                          data={locationChartData}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              filler: {
                                propagate: true
                              }
                            }
                          }}
                        />
                      </div>
                    )}

                    {activeTab === 'experience' && (
                      <div className="h-96">
                        <Doughnut
                          data={experienceChartData}
                          options={{
                            ...chartOptions,
                            plugins: {
                              ...chartOptions.plugins,
                              legend: {
                                ...chartOptions.plugins.legend,
                                position: 'right'
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </motion.div>

                  {/* Chart Descriptions */}
                  <div className="bg-white/5 border border-primary/30 rounded-lg p-4">
                    <p className="text-sm text-muted">
                      {activeTab === 'overview' && '📊 Platform Overview: Displays the distribution of total jobs, users, and applicants on the platform.'}
                      {activeTab === 'track' && '🎯 Career Tracks: Shows the distribution of applicants across different career tracks.'}
                      {activeTab === 'location' && '📍 Locations: Illustrates applicant trends across different job locations.'}
                      {activeTab === 'experience' && '💼 Experience Levels: Breaks down applicants by required experience levels.'}
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-8 py-3 bg-gradient-to-r from-[#A855F7] to-[#D500F9] text-white rounded-lg font-semibold transition-all"
                  >
                    Close Analytics
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsModal;
