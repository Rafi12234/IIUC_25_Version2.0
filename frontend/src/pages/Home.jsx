/**
 * Home Page
 * Landing page with hero section, features, and CTAs
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Target, BookOpen, Users, Sparkles, TrendingUp, Award } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Target,
      title: 'Connect Skills to Opportunities',
      description: 'Match your unique skills with relevant job openings tailored for students and fresh graduates.',
    },
    {
      icon: BookOpen,
      title: 'Personalized Learning Pathways',
      description: 'Get curated resources and courses that align with your career goals and current skill level.',
    },
    {
      icon: Users,
      title: 'Designed for Youth',
      description: 'Built specifically for students and early-career professionals seeking meaningful opportunities.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Job Opportunities' },
    { number: '100+', label: 'Learning Resources' },
    { number: '1000+', label: 'Active Users' },
  ];

  return (
    <div className="bg-white dark:bg-bg-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          />
        </div>

        <div className="section-container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles className="text-primary" size={16} />
                <span className="text-sm font-medium text-primary">Aligned with SDG 8</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Discover your path.
                <br />
                <span className="text-primary">Shape your career.</span>
              </h1>

              <p className="text-lg text-text-muted mb-8 max-w-xl">
                Match your skills to relevant jobs and learning resources — build a roadmap that leads to real opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary flex items-center justify-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/jobs" className="btn-outline flex items-center justify-center space-x-2">
                  <span>Explore Jobs</span>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="text-3xl font-heading font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-text-muted">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Illustration/Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Placeholder illustration */}
                <img
                  src="https://picsum.photos/600/600?random=1"
                  alt="Career growth illustration"
                  className="rounded-2xl shadow-lift"
                />
                
                {/* Floating card 1 */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-10 -left-6 card p-4 shadow-lift"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-primary" size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-text-muted">Career Growth</div>
                      <div className="font-semibold">85% Match</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card 2 */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-10 -right-6 card p-4 shadow-lift"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Award className="text-primary" size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-text-muted">Skills Gained</div>
                      <div className="font-semibold">12 New</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-bg-muted dark:bg-gray-900">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Why Choose CareerPath?
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              We're dedicated to empowering youth with the tools and opportunities needed for career success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card p-8 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="text-primary" size={32} />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-12 text-center text-white"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Your Career Journey?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of students and fresh graduates discovering their perfect career path.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:shadow-lift transition-all active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
