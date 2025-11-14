import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './featureReveal.css';

gsap.registerPlugin(ScrollTrigger);

const FeatureReveal = () => {
  const galleryRef = useRef(null);
  const featuresRef = useRef([]);
  const photosRef = useRef([]);
  const headingsRef = useRef([]);

  // Background colors for each feature section - Neon dark theme
  const colors = [
    '#11152B', // Dark section
    '#161A34', // Slightly lighter dark
    '#0B0E1C', // Base dark
    '#11152B', // Dark section
  ];

  // Feature data
  const features = [
    {
      id: 1,
      title: 'Smart Job Matching',
      description: 'Our AI-powered algorithm matches you with the perfect career opportunities based on your skills, experience, and preferences.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2084&q=80',
      gradient: 'from-[#A855F7] to-[#7C3AED]'
    },
    {
      id: 2,
      title: 'Career Analytics',
      description: 'Get detailed insights into your career progress with comprehensive analytics and personalized recommendations.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      gradient: 'from-[#D500F9] to-[#A855F7]'
    },
    {
      id: 3,
      title: 'Skill Development',
      description: 'Access curated learning resources and track your skill development journey with our integrated learning platform.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      gradient: 'from-[#7C3AED] to-[#D500F9]'
    },
    {
      id: 4,
      title: 'Network Building',
      description: 'Connect with industry professionals and build meaningful relationships that advance your career goals.',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      gradient: 'from-[#A855F7] to-[#D500F9]'
    }
  ];

  useEffect(() => {
    const gallery = galleryRef.current;
    const features = featuresRef.current;
    const photos = photosRef.current;
    const headings = headingsRef.current;

    if (!gallery || !features.length || !photos.length) return;

    // GSAP Match Media for responsive behavior
    const mm = gsap.matchMedia();

    // Desktop behavior (min-width: 666px)
    mm.add("(min-width: 666px)", () => {
      // Initial setup - hide all photos except first
      photos.forEach((photo, index) => {
        gsap.set(photo, {
          clipPath: index === 0 ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
          autoAlpha: index === 0 ? 1 : 0
        });
      });

      // Animate headings on scroll
      headings.forEach((heading) => {
        if (heading) {
          gsap.fromTo(heading, 
            {
              y: 50,
              opacity: 0
            },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: heading,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });

      // Feature sections scroll animation
      features.forEach((feature, index) => {
        if (feature && photos[index]) {
          ScrollTrigger.create({
            trigger: feature,
            start: "top center",
            end: "bottom center",
            onEnter: () => {
              // Change gallery background color
              gsap.to(gallery, {
                backgroundColor: colors[index] || colors[0],
                duration: 0.8,
                ease: "power2.out"
              });

              // Show current photo
              gsap.to(photos[index], {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                autoAlpha: 1,
                duration: 1.2,
                ease: "power3.out"
              });

              // Hide other photos
              photos.forEach((photo, photoIndex) => {
                if (photoIndex !== index && photo) {
                  gsap.to(photo, {
                    clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
                    autoAlpha: 0,
                    duration: 0.8,
                    ease: "power3.out"
                  });
                }
              });
            },
            onEnterBack: () => {
              // Change gallery background color
              gsap.to(gallery, {
                backgroundColor: colors[index] || colors[0],
                duration: 0.8,
                ease: "power2.out"
              });

              // Show current photo
              gsap.to(photos[index], {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                autoAlpha: 1,
                duration: 1.2,
                ease: "power3.out"
              });

              // Hide other photos
              photos.forEach((photo, photoIndex) => {
                if (photoIndex !== index && photo) {
                  gsap.to(photo, {
                    clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
                    autoAlpha: 0,
                    duration: 0.8,
                    ease: "power3.out"
                  });
                }
              });
            }
          });
        }
      });
    });

    // Mobile behavior (max-width: 665px)
    mm.add("(max-width: 665px)", () => {
      // Mobile: simpler stacking animation
      photos.forEach((photo, index) => {
        if (photo) {
          gsap.set(photo, {
            autoAlpha: 1,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
          });

          gsap.fromTo(photo, 
            {
              y: 60,
              opacity: 0,
              scale: 0.9
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: photo,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });

      // Mobile heading animations
      headings.forEach((heading) => {
        if (heading) {
          gsap.fromTo(heading, 
            {
              y: 30,
              opacity: 0
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: heading,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    });

    // Cleanup function
    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [colors]);

  return (
    <section className="feature-reveal-section bg-base">
      <div className="container mx-auto px-4 py-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 reveal glow-text"
            ref={el => headingsRef.current[0] = el}
          >
            Powerful Features for Your Career
          </h2>
          <p 
            className="text-xl text-muted max-w-3xl mx-auto reveal"
            ref={el => headingsRef.current[1] = el}
          >
            Discover how পথচলা empowers professionals with cutting-edge tools and insights
          </p>
        </div>

        <div className="feature-layout">
          {/* Desktop Gallery */}
          <div 
            className="feature-gallery desktop-only"
            ref={galleryRef}
          >
            {features.map((feature, index) => (
              <div 
                key={feature.id}
                className="desktop-photo"
                ref={el => photosRef.current[index] = el}
              >
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
                <div className={`photo-overlay bg-gradient-to-br ${feature.gradient}`} />
              </div>
            ))}
          </div>

          {/* Feature Content Sections */}
          <div className="feature-content">
            {features.map((feature, index) => (
              <div 
                key={feature.id}
                className="desktop-content-section"
                ref={el => featuresRef.current[index] = el}
              >
                <div className="feature-text">
                  <h3 
                    className="feature-title reveal glow-text"
                    ref={el => headingsRef.current[index + 2] = el}
                  >
                    {feature.title}
                  </h3>
                  <p className="feature-description text-muted">
                    {feature.description}
                  </p>
                  <button className="cursor-hover feature-cta btn-primary">
                    Learn More
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>

                {/* Mobile Image */}
                <div 
                  className="mobile-photo mobile-only"
                  ref={el => photosRef.current[index + features.length] = el}
                >
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className={`photo-overlay bg-gradient-to-br ${feature.gradient} rounded-2xl`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureReveal;
