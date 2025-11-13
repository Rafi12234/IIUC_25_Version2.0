/**
 * About Page
 * Mission and purpose of CareerPath
 */

import { motion } from 'framer-motion';
import { Target, Heart, Zap, Globe } from 'lucide-react';

const About = () => {
  const missions = [
    {
      icon: Target,
      title: 'Connect Skills to Opportunities',
      description: 'We bridge the gap between what you know and where you can apply it, making job discovery transparent and skills-focused.',
    },
    {
      icon: Heart,
      title: 'Personalized Learning Pathways',
      description: 'Every learner is unique. We recommend courses and resources aligned with your goals, experience, and career interests.',
    },
    {
      icon: Zap,
      title: 'Designed for Students & Fresh Graduates',
      description: 'Built specifically for youth entering the workforce—whether you\'re a student, recent grad, or career switcher.',
    },
  ];

  return (
    <div className="page-padding">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Globe className="text-primary" size={16} />
            <span className="text-sm font-medium text-primary">SDG 8: Decent Work & Economic Growth</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">
            Our Mission
          </h1>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            CareerPath is a youth employment platform designed to empower students and fresh graduates 
            by connecting them with meaningful job opportunities and personalized learning resources.
          </p>
        </motion.div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {missions.map((mission, index) => (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-8"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <mission.icon className="text-primary" size={28} />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">{mission.title}</h3>
              <p className="text-text-muted">{mission.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="card p-8 md:p-12">
            <h2 className="font-heading text-2xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-text-muted">
              <p>
                CareerPath was born from a simple observation: too many talented young people struggle 
                to find their first opportunities, not because they lack skills, but because they don't 
                know where to start.
              </p>
              <p>
                We built a platform that makes career discovery transparent, accessible, and personalized. 
                By matching your existing skills with real job openings and recommending learning resources 
                to fill gaps, we help you build a clear roadmap from where you are to where you want to be.
              </p>
              <p>
                Aligned with the United Nations' Sustainable Development Goal 8 (Decent Work and Economic Growth), 
                CareerPath aims to promote sustained, inclusive, and sustainable economic growth, full and 
                productive employment, and decent work for all youth.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <div className="mt-16 text-center">
          <h2 className="font-heading text-3xl font-bold mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Transparency', 'Accessibility', 'Empowerment', 'Innovation'].map((value, index) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-6 bg-primary/5 rounded-xl"
              >
                <h3 className="font-heading font-semibold text-lg">{value}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
