import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Jobs Service
export const jobsService = {
  // Get all jobs
  getAllJobs: async () => {
    const jobsCollection = collection(db, 'jobs');
    const jobsSnapshot = await getDocs(jobsCollection);
    return jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get jobs with real-time listener
  subscribeToJobs: (callback) => {
    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(jobs);
    });
  },

  // Search jobs
  searchJobs: async (searchTerm, filters = {}) => {
    let q = collection(db, 'jobs');
    
    if (filters.location) {
      q = query(q, where('location', '==', filters.location));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    const snapshot = await getDocs(q);
    let jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Client-side search for title/company
    if (searchTerm) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return jobs;
  },

  // Add job (admin only)
  addJob: async (jobData, userId) => {
    return await addDoc(collection(db, 'jobs'), {
      ...jobData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      applications: []
    });
  }
};

// Applications Service
export const applicationsService = {
  // Apply to job
  applyToJob: async (jobId, userId, applicationData) => {
    return await addDoc(collection(db, 'applications'), {
      jobId,
      userId,
      ...applicationData,
      status: 'pending',
      appliedAt: serverTimestamp()
    });
  },

  // Get user applications
  getUserApplications: async (userId) => {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    // Sort client-side to avoid needing a Firestore index
    const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return applications.sort((a, b) => {
      const dateA = a.appliedAt?.toDate?.() || new Date(0);
      const dateB = b.appliedAt?.toDate?.() || new Date(0);
      return dateB - dateA; // desc order
    });
  },

  // Get applications for a job
  getJobApplications: async (jobId) => {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// User Profile Service
export const userService = {
  // Update user profile
  updateProfile: async (userId, profileData) => {
    const userRef = doc(db, 'users', userId);
    return await updateDoc(userRef, {
      profile: profileData,
      updatedAt: serverTimestamp()
    });
  },

  // Get user profile
  getUserProfile: async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  }
};

// Contact Service
export const contactService = {
  // Submit contact form
  submitContactForm: async (formData) => {
    return await addDoc(collection(db, 'contacts'), {
      ...formData,
      createdAt: serverTimestamp(),
      status: 'unread'
    });
  },

  // Get all contact submissions (admin only)
  getAllContacts: async () => {
    const contactsCollection = collection(db, 'contacts');
    const q = query(contactsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Resources Service
export const resourcesService = {
  // Get all resources
  getAllResources: async () => {
    const resourcesCollection = collection(db, 'resources');
    const q = query(resourcesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get resources by category
  getResourcesByCategory: async (category) => {
    const resourcesCollection = collection(db, 'resources');
    const q = query(
      resourcesCollection,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Search resources
  searchResources: async (searchTerm) => {
    const resourcesCollection = collection(db, 'resources');
    const snapshot = await getDocs(resourcesCollection);
    const resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return resources.filter(resource =>
      resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
};
