import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Briefcase, Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobMarketInsights = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employment');

  const data = {
    "youthEmploymentRates": [
      { "year": 2010, "employmentRate": 52.3, "unemploymentRate": 17.2 },
      { "year": 2011, "employmentRate": 53.8, "unemploymentRate": 16.5 },
      { "year": 2012, "employmentRate": 55.1, "unemploymentRate": 15.8 },
      { "year": 2013, "employmentRate": 56.4, "unemploymentRate": 15.2 },
      { "year": 2014, "employmentRate": 57.9, "unemploymentRate": 14.5 },
      { "year": 2015, "employmentRate": 59.2, "unemploymentRate": 13.8 },
      { "year": 2016, "employmentRate": 60.5, "unemploymentRate": 13.2 },
      { "year": 2017, "employmentRate": 61.8, "unemploymentRate": 12.5 },
      { "year": 2018, "employmentRate": 63.2, "unemploymentRate": 11.8 },
      { "year": 2019, "employmentRate": 64.5, "unemploymentRate": 11.2 },
      { "year": 2020, "employmentRate": 58.3, "unemploymentRate": 15.6 },
      { "year": 2021, "employmentRate": 61.7, "unemploymentRate": 13.4 },
      { "year": 2022, "employmentRate": 66.8, "unemploymentRate": 10.5 },
      { "year": 2023, "employmentRate": 69.4, "unemploymentRate": 9.2 },
      { "year": 2024, "employmentRate": 71.6, "unemploymentRate": 8.1 },
      { "year": 2025, "employmentRate": 73.2, "unemploymentRate": 7.5 }
    ],
    "industryGrowth": [
      { "sector": "ICT", "growthRate": 22.5, "averageSalaryBDT": 45000 },
      { "sector": "Garments", "growthRate": 6.8, "averageSalaryBDT": 18000 },
      { "sector": "Agriculture", "growthRate": 4.2, "averageSalaryBDT": 15000 },
      { "sector": "Freelancing", "growthRate": 25.0, "averageSalaryBDT": 38000 },
      { "sector": "Fintech", "growthRate": 19.3, "averageSalaryBDT": 52000 },
      { "sector": "Logistics", "growthRate": 14.7, "averageSalaryBDT": 28000 },
      { "sector": "Healthcare", "growthRate": 11.5, "averageSalaryBDT": 42000 },
      { "sector": "E-commerce", "growthRate": 18.9, "averageSalaryBDT": 32000 },
      { "sector": "Digital Marketing", "growthRate": 21.2, "averageSalaryBDT": 35000 },
      { "sector": "Education Technology", "growthRate": 16.4, "averageSalaryBDT": 38000 },
      { "sector": "Manufacturing", "growthRate": 7.3, "averageSalaryBDT": 22000 },
      { "sector": "Banking", "growthRate": 8.6, "averageSalaryBDT": 48000 },
      { "sector": "Telecommunications", "growthRate": 12.1, "averageSalaryBDT": 46000 },
      { "sector": "Construction", "growthRate": 9.4, "averageSalaryBDT": 25000 },
      { "sector": "Pharmaceuticals", "growthRate": 13.8, "averageSalaryBDT": 40000 }
    ],
    "topJobs2025": [
      { "id": "job001", "jobTitle": "Software Developer", "industry": "ICT", "difficultyLevel": "medium", "avgSalaryBDT": 50000, "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB", "Git"], "hiringTrend": "rising" },
      { "id": "job002", "jobTitle": "Digital Marketing Specialist", "industry": "Digital Marketing", "difficultyLevel": "easy", "avgSalaryBDT": 32000, "requiredSkills": ["SEO", "Social Media Marketing", "Google Analytics", "Content Writing"], "hiringTrend": "rising" },
      { "id": "job003", "jobTitle": "Data Analyst", "industry": "ICT", "difficultyLevel": "medium", "avgSalaryBDT": 48000, "requiredSkills": ["Python", "SQL", "Excel", "Data Visualization", "Statistics"], "hiringTrend": "rising" },
      { "id": "job004", "jobTitle": "Freelance Web Designer", "industry": "Freelancing", "difficultyLevel": "easy", "avgSalaryBDT": 35000, "requiredSkills": ["Figma", "Adobe XD", "HTML", "CSS", "UI/UX Design"], "hiringTrend": "rising" },
      { "id": "job005", "jobTitle": "Mobile App Developer", "industry": "ICT", "difficultyLevel": "hard", "avgSalaryBDT": 58000, "requiredSkills": ["Flutter", "React Native", "Firebase", "REST API", "Mobile UI Design"], "hiringTrend": "rising" },
      { "id": "job006", "jobTitle": "Garment Quality Inspector", "industry": "Garments", "difficultyLevel": "easy", "avgSalaryBDT": 18000, "requiredSkills": ["Quality Control", "Fabric Knowledge", "Attention to Detail"], "hiringTrend": "stable" },
      { "id": "job007", "jobTitle": "Fintech Product Manager", "industry": "Fintech", "difficultyLevel": "hard", "avgSalaryBDT": 75000, "requiredSkills": ["Product Management", "Agile", "Financial Systems", "User Research", "Data Analysis"], "hiringTrend": "rising" },
      { "id": "job008", "jobTitle": "E-commerce Operations Manager", "industry": "E-commerce", "difficultyLevel": "medium", "avgSalaryBDT": 42000, "requiredSkills": ["Supply Chain", "Inventory Management", "Customer Service", "Excel"], "hiringTrend": "rising" },
      { "id": "job009", "jobTitle": "Cybersecurity Analyst", "industry": "ICT", "difficultyLevel": "hard", "avgSalaryBDT": 62000, "requiredSkills": ["Network Security", "Penetration Testing", "Linux", "Firewalls", "Incident Response"], "hiringTrend": "rising" },
      { "id": "job010", "jobTitle": "Content Creator", "industry": "Digital Marketing", "difficultyLevel": "easy", "avgSalaryBDT": 28000, "requiredSkills": ["Video Editing", "Copywriting", "Social Media", "Photography"], "hiringTrend": "rising" }
    ],
    "sectorOpportunityScore": [
      { "sector": "ICT", "opportunityScore": 92 },
      { "sector": "Garments", "opportunityScore": 58 },
      { "sector": "Agriculture", "opportunityScore": 45 },
      { "sector": "Freelancing", "opportunityScore": 88 },
      { "sector": "Fintech", "opportunityScore": 85 },
      { "sector": "Logistics", "opportunityScore": 72 },
      { "sector": "Healthcare", "opportunityScore": 68 },
      { "sector": "E-commerce", "opportunityScore": 78 },
      { "sector": "Digital Marketing", "opportunityScore": 82 },
      { "sector": "Education Technology", "opportunityScore": 75 },
      { "sector": "Manufacturing", "opportunityScore": 52 },
      { "sector": "Banking", "opportunityScore": 64 },
      { "sector": "Telecommunications", "opportunityScore": 70 },
      { "sector": "Construction", "opportunityScore": 55 },
      { "sector": "Pharmaceuticals", "opportunityScore": 66 }
    ]
  };

  const getTrendColor = (trend) => {
    if (trend === 'rising') return 'text-green-400';
    if (trend === 'falling') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getDifficultyColor = (level) => {
    if (level === 'easy') return 'bg-green-500/20 text-green-400 border-green-500/40';
    if (level === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    return 'bg-red-500/20 text-red-400 border-red-500/40';
  };

  return (
    <div className="min-h-screen bg-base py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/jobs')}
            className="mb-4 flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Jobs
          </button>
          <h1 className="text-4xl md:text-5xl font-bold glow-text mb-4">
            Bangladesh Job Market Insights 2025
          </h1>
          <p className="text-muted text-lg">
            Youth employment data, industry trends, and top opportunities
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('employment')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'employment'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-[rgba(255,255,255,0.05)] text-muted hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            Employment Rates
          </button>
          <button
            onClick={() => setActiveTab('industry')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'industry'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-[rgba(255,255,255,0.05)] text-muted hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            Industry Growth
          </button>
          <button
            onClick={() => setActiveTab('topjobs')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'topjobs'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-[rgba(255,255,255,0.05)] text-muted hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            Top Jobs 2025
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'opportunities'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-[rgba(255,255,255,0.05)] text-muted hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            Sector Opportunities
          </button>
        </div>

        {/* Employment Rates Tab */}
        {activeTab === 'employment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {data.youthEmploymentRates.slice(-6).map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="neon-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-main">{item.year}</h3>
                    <TrendingUp className="text-primary" size={24} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted mb-1">Employment Rate</p>
                      <p className="text-3xl font-bold text-green-400">{item.employmentRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted mb-1">Unemployment Rate</p>
                      <p className="text-3xl font-bold text-red-400">{item.unemploymentRate}%</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Industry Growth Tab */}
        {activeTab === 'industry' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data.industryGrowth
              .sort((a, b) => b.growthRate - a.growthRate)
              .map((item, index) => (
                <motion.div
                  key={item.sector}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="neon-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="text-primary" size={24} />
                    <h3 className="text-lg font-bold text-main">{item.sector}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted mb-1">Growth Rate</p>
                      <p className="text-2xl font-bold text-green-400">+{item.growthRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted mb-1">Avg Salary</p>
                      <p className="text-xl font-bold text-primary">৳{item.averageSalaryBDT.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}

        {/* Top Jobs Tab */}
        {activeTab === 'topjobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {data.topJobs2025.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="neon-card p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-main mb-2">{job.jobTitle}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                        {job.industry}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm border ${getDifficultyColor(job.difficultyLevel)}`}>
                        {job.difficultyLevel}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getTrendColor(job.hiringTrend)}`}>
                        {job.hiringTrend}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted mb-1">Average Salary</p>
                    <p className="text-2xl font-bold text-primary">৳{job.avgSalaryBDT.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm text-main"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Sector Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {data.sectorOpportunityScore
              .sort((a, b) => b.opportunityScore - a.opportunityScore)
              .map((item, index) => (
                <motion.div
                  key={item.sector}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="neon-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="text-primary" size={24} />
                    <h3 className="text-lg font-bold text-main">{item.sector}</h3>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-2">Opportunity Score</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-bold text-primary">{item.opportunityScore}</p>
                      <p className="text-muted mb-1">/100</p>
                    </div>
                    <div className="mt-3 w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.opportunityScore}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobMarketInsights;
