/**
 * Database Seed Script
 * Populates the database with sample jobs and learning resources
 * Run: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Resource from '../models/Resource.js';
import connectDB from '../config/db.js';

dotenv.config();

// Sample Jobs Data (20 jobs)
const jobs = [
  {
    title: 'Frontend Developer Intern',
    company: 'TechStart Inc.',
    location: 'Remote',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    experienceLevel: 'Student',
    type: 'Internship',
    description: 'Join our team to build modern web applications. Perfect for students learning frontend development.',
  },
  {
    title: 'Junior Web Developer',
    company: 'Digital Solutions Ltd.',
    location: 'Dhaka, Bangladesh',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Node.js'],
    experienceLevel: 'Fresher',
    type: 'Full-time',
    description: 'Looking for a passionate developer to join our growing team. Training provided.',
  },
  {
    title: 'UI/UX Design Intern',
    company: 'Creative Studio',
    location: 'Remote',
    requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
    experienceLevel: 'Student',
    type: 'Internship',
    description: 'Learn professional design practices while working on real client projects.',
  },
  {
    title: 'Content Writer',
    company: 'ContentPro',
    location: 'Remote',
    requiredSkills: ['Writing', 'SEO', 'Communication', 'Research'],
    experienceLevel: 'Fresher',
    type: 'Freelance',
    description: 'Write engaging blog posts and articles for various clients. Flexible hours.',
  },
  {
    title: 'Data Entry Specialist',
    company: 'DataCorp',
    location: 'Chittagong, Bangladesh',
    requiredSkills: ['Excel', 'Typing', 'Attention to Detail'],
    experienceLevel: 'Student',
    type: 'Part-time',
    description: 'Part-time opportunity for students. Manage data entry tasks with accuracy.',
  },
  {
    title: 'Social Media Manager',
    company: 'Brand Builders',
    location: 'Remote',
    requiredSkills: ['Social Media Marketing', 'Content Creation', 'Communication'],
    experienceLevel: 'Fresher',
    type: 'Full-time',
    description: 'Manage social media accounts for multiple brands. Creative mindset required.',
  },
  {
    title: 'React Developer',
    company: 'AppWorks',
    location: 'Dhaka, Bangladesh',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Redux'],
    experienceLevel: 'Junior',
    type: 'Full-time',
    description: 'Build scalable React applications. 1+ years experience preferred.',
  },
  {
    title: 'Graphic Design Intern',
    company: 'DesignHub',
    location: 'Remote',
    requiredSkills: ['Photoshop', 'Illustrator', 'Graphic Design', 'Creativity'],
    experienceLevel: 'Student',
    type: 'Internship',
    description: 'Create stunning visuals for marketing campaigns. Portfolio required.',
  },
  {
    title: 'Python Developer',
    company: 'DataTech Solutions',
    location: 'Remote',
    requiredSkills: ['Python', 'Django', 'SQL', 'API Development'],
    experienceLevel: 'Fresher',
    type: 'Full-time',
    description: 'Work on backend systems and APIs. Good understanding of Python required.',
  },
  {
    title: 'Customer Support Representative',
    company: 'SupportNow',
    location: 'Sylhet, Bangladesh',
    requiredSkills: ['Communication', 'Problem Solving', 'Empathy'],
    experienceLevel: 'Student',
    type: 'Part-time',
    description: 'Provide excellent customer support via chat and email. Evening shifts available.',
  },
  {
    title: 'Mobile App Developer',
    company: 'MobileFirst',
    location: 'Remote',
    requiredSkills: ['React Native', 'JavaScript', 'Mobile Development'],
    experienceLevel: 'Junior',
    type: 'Full-time',
    description: 'Develop cross-platform mobile applications using React Native.',
  },
  {
    title: 'Digital Marketing Intern',
    company: 'MarketGrowth',
    location: 'Dhaka, Bangladesh',
    requiredSkills: ['SEO', 'Google Analytics', 'Social Media Marketing'],
    experienceLevel: 'Student',
    type: 'Internship',
    description: 'Learn digital marketing strategies and execute campaigns.',
  },
  {
    title: 'Video Editor',
    company: 'MediaPro',
    location: 'Remote',
    requiredSkills: ['Adobe Premiere', 'Video Editing', 'Creativity'],
    experienceLevel: 'Fresher',
    type: 'Freelance',
    description: 'Edit videos for YouTube channels and marketing content.',
  },
  {
    title: 'Full Stack Developer',
    company: 'WebSolutions',
    location: 'Remote',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
    experienceLevel: 'Junior',
    type: 'Full-time',
    description: 'Build complete web applications from frontend to backend.',
  },
  {
    title: 'Virtual Assistant',
    company: 'RemoteHelp',
    location: 'Remote',
    requiredSkills: ['Organization', 'Communication', 'Time Management'],
    experienceLevel: 'Student',
    type: 'Part-time',
    description: 'Assist with administrative tasks, scheduling, and email management.',
  },
  {
    title: 'WordPress Developer',
    company: 'WebCraft',
    location: 'Dhaka, Bangladesh',
    requiredSkills: ['WordPress', 'PHP', 'HTML', 'CSS'],
    experienceLevel: 'Fresher',
    type: 'Full-time',
    description: 'Customize WordPress themes and plugins for client websites.',
  },
  {
    title: 'Data Analyst Intern',
    company: 'Analytics Hub',
    location: 'Remote',
    requiredSkills: ['Excel', 'Data Analysis', 'SQL', 'Python'],
    experienceLevel: 'Student',
    type: 'Internship',
    description: 'Analyze data sets and create reports. Great learning opportunity.',
  },
  {
    title: 'English Tutor',
    company: 'EduOnline',
    location: 'Remote',
    requiredSkills: ['English', 'Teaching', 'Communication'],
    experienceLevel: 'Student',
    type: 'Part-time',
    description: 'Teach English to students online. Flexible schedule.',
  },
  {
    title: 'SEO Specialist',
    company: 'SearchMasters',
    location: 'Remote',
    requiredSkills: ['SEO', 'Content Optimization', 'Google Analytics'],
    experienceLevel: 'Fresher',
    type: 'Full-time',
    description: 'Optimize websites for search engines and track performance.',
  },
  {
    title: 'QA Tester',
    company: 'QualitySoft',
    location: 'Dhaka, Bangladesh',
    requiredSkills: ['Testing', 'Attention to Detail', 'Documentation'],
    experienceLevel: 'Fresher',
    type: 'Full-time',
    description: 'Test software applications and report bugs. No coding required.',
  },
];

// Sample Resources Data (20 resources)
const resources = [
  {
    title: 'Complete Web Development Bootcamp',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    relatedSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    cost: 'Paid',
    description: 'Learn web development from scratch with hands-on projects.',
  },
  {
    title: 'JavaScript Tutorial for Beginners',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    relatedSkills: ['JavaScript'],
    cost: 'Free',
    description: 'Comprehensive JavaScript tutorial covering all basics.',
  },
  {
    title: 'React - The Complete Guide',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/react-the-complete-guide/',
    relatedSkills: ['React', 'JavaScript', 'Redux'],
    cost: 'Paid',
    description: 'Master React with hooks, context, and advanced patterns.',
  },
  {
    title: 'Figma UI Design Tutorial',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8',
    relatedSkills: ['Figma', 'UI Design', 'UX Design'],
    cost: 'Free',
    description: 'Learn Figma from basics to advanced UI design.',
  },
  {
    title: 'Python for Everybody',
    platform: 'Coursera',
    url: 'https://www.coursera.org/specializations/python',
    relatedSkills: ['Python', 'Programming'],
    cost: 'Free',
    description: 'University of Michigan\'s popular Python course for beginners.',
  },
  {
    title: 'Digital Marketing Masterclass',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/digital-marketing-masterclass/',
    relatedSkills: ['SEO', 'Social Media Marketing', 'Google Analytics'],
    cost: 'Paid',
    description: 'Complete guide to digital marketing strategies and tools.',
  },
  {
    title: 'Excel Skills for Business',
    platform: 'Coursera',
    url: 'https://www.coursera.org/specializations/excel',
    relatedSkills: ['Excel', 'Data Analysis'],
    cost: 'Free',
    description: 'Learn Excel from basics to advanced data analysis.',
  },
  {
    title: 'Photoshop Tutorial for Beginners',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=IyR_uYsRdPs',
    relatedSkills: ['Photoshop', 'Graphic Design'],
    cost: 'Free',
    description: 'Complete Photoshop course for graphic design beginners.',
  },
  {
    title: 'Node.js - The Complete Guide',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/nodejs-the-complete-guide/',
    relatedSkills: ['Node.js', 'Express', 'MongoDB'],
    cost: 'Paid',
    description: 'Build scalable backend applications with Node.js.',
  },
  {
    title: 'SQL for Data Science',
    platform: 'Coursera',
    url: 'https://www.coursera.org/learn/sql-for-data-science',
    relatedSkills: ['SQL', 'Data Analysis', 'Database'],
    cost: 'Free',
    description: 'Learn SQL for data analysis and database management.',
  },
  {
    title: 'UI/UX Design Fundamentals',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/ui-ux-web-design-using-adobe-xd/',
    relatedSkills: ['Adobe XD', 'UI Design', 'UX Research'],
    cost: 'Paid',
    description: 'Master UI/UX design principles with Adobe XD.',
  },
  {
    title: 'Git & GitHub Crash Course',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    relatedSkills: ['Git', 'Version Control'],
    cost: 'Free',
    description: 'Learn Git and GitHub for version control.',
  },
  {
    title: 'The Complete Digital Marketing Course',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/learn-digital-marketing-course/',
    relatedSkills: ['Digital Marketing', 'SEO', 'Content Marketing'],
    cost: 'Paid',
    description: '12 courses in 1 covering all aspects of digital marketing.',
  },
  {
    title: 'TypeScript Course for Beginners',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
    relatedSkills: ['TypeScript', 'JavaScript'],
    cost: 'Free',
    description: 'Learn TypeScript from scratch with practical examples.',
  },
  {
    title: 'React Native - The Practical Guide',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/react-native-the-practical-guide/',
    relatedSkills: ['React Native', 'Mobile Development', 'JavaScript'],
    cost: 'Paid',
    description: 'Build iOS and Android apps with React Native.',
  },
  {
    title: 'Communication Skills Training',
    platform: 'Coursera',
    url: 'https://www.coursera.org/learn/wharton-communication-skills',
    relatedSkills: ['Communication', 'Presentation'],
    cost: 'Free',
    description: 'Improve your professional communication skills.',
  },
  {
    title: 'WordPress Theme Development',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=8OBfr46Y6HQ',
    relatedSkills: ['WordPress', 'PHP', 'HTML', 'CSS'],
    cost: 'Free',
    description: 'Learn to create custom WordPress themes.',
  },
  {
    title: 'Data Science with Python',
    platform: 'Coursera',
    url: 'https://www.coursera.org/specializations/data-science-python',
    relatedSkills: ['Python', 'Data Science', 'Machine Learning'],
    cost: 'Free',
    description: 'Complete data science specialization with Python.',
  },
  {
    title: 'Adobe Premiere Pro Tutorial',
    platform: 'YouTube',
    url: 'https://www.youtube.com/watch?v=Hls3Tp7JS8E',
    relatedSkills: ['Adobe Premiere', 'Video Editing'],
    cost: 'Free',
    description: 'Complete video editing course using Premiere Pro.',
  },
  {
    title: 'Introduction to MongoDB',
    platform: 'MongoDB University',
    url: 'https://university.mongodb.com/',
    relatedSkills: ['MongoDB', 'Database', 'NoSQL'],
    cost: 'Free',
    description: 'Official MongoDB courses from beginner to advanced.',
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Job.deleteMany();
    await Resource.deleteMany();

    console.log('🌱 Seeding jobs...');
    await Job.insertMany(jobs);
    console.log(`✅ ${jobs.length} jobs created`);

    console.log('🌱 Seeding resources...');
    await Resource.insertMany(resources);
    console.log(`✅ ${resources.length} resources created`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
