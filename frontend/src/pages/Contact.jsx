/**
 * Contact Page
 * Contact form for user inquiries
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactService } from '../services/firestoreService';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactService.submitContactForm({
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      toast.success("Message sent successfully!");
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    }

    setLoading(false);
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'support@careerpath.com' },
    { icon: Phone, label: 'Phone', value: '+880 1234-567890' },
    { icon: MapPin, label: 'Location', value: 'Dhaka, Bangladesh' },
  ];

  return (
    <div className="contact-page">
      <div className="page-padding bg-base">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-heading text-4xl font-bold mb-4">Get In Touch</h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="neon-card p-8"
            >
              <form onSubmit={handleSubmit} className="contact-form space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Tell us more..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
                {contactInfo.map((info) => (
                  <div key={info.label} className="neon-card p-6 flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'rgba(168,85,247,0.06)'}}>
                      <info.icon className="text-primary glow-icon" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{info.label}</h3>
                      <p className="text-muted">{info.value}</p>
                    </div>
                  </div>
                ))}

                <div className="neon-card p-8" style={{background:'rgba(168,85,247,0.04)', border:'1px solid rgba(168,85,247,0.08)'}}>
                  <MessageSquare className="text-primary mb-4 glow-icon" size={32} />
                  <h3 className="font-heading text-xl font-semibold mb-2 glow-text">Quick Response</h3>
                  <p className="text-muted">
                    We typically respond within 24-48 hours. For urgent matters, please mention it in your message.
                  </p>
                </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
