/**
 * Footer Component
 * Site-wide footer with links and information
 */

import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: 'About Us', to: '/about' },
      { label: 'Jobs', to: '/jobs' },
      { label: 'Resources', to: '/resources' },
      { label: 'Contact', to: '/contact' },
      { label: 'Stratify', to: 'https://stratifyai-gray.vercel.app/', external: true },
    ],
    support: [
      { label: 'Help Center', to: '#' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Mail, href: 'mailto:support@careerpath.com', label: 'Email' },
  ];

  return (
    <footer className="bg-base border-t" style={{borderColor:'rgba(255,255,255,0.04)'}}>
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(90deg,#6A00F5,#D500F9)'}}>
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-heading text-xl font-bold">CareerPath</span>
            </div>
            <p className="text-muted text-sm">
              Empowering youth with career opportunities and personalized learning paths aligned with SDG 8.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-section hover:shadow-neon-glow transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.to}
                      className="text-muted hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-muted hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (placeholder) */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Stay Updated</h3>
            <p className="text-muted text-sm mb-3">
              Get notified about new job opportunities and resources.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm rounded-l-lg input-field"
                aria-label="Email for newsletter"
              />
              <button className="px-4 py-2 text-white rounded-r-lg bg-gradient-to-br from-[#A855F7] to-[#7C3AED] hover:shadow-neon-glow transition-all text-sm font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0" style={{borderColor:'rgba(255,255,255,0.04)'}}>
          <p className="text-muted text-sm flex items-center">
            © {currentYear} CareerPath. Built with <Heart size={16} className="mx-1 text-pink-500" /> for youth employment
          </p>
          <p className="text-muted text-sm">
            Aligned with <span className="font-semibold text-primary">SDG 8</span> - Decent Work & Economic Growth
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
