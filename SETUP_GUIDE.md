# CareerPath - Setup & Deployment Guide

## 🚀 Quick Start (Development)

### Prerequisites

- Node.js v18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git (optional)

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example in root)
# Edit with your values:
# MONGO_URI=mongodb://localhost:27017/careerpath
# JWT_SECRET=your_random_secret_key_here
# PORT=5000

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

```powershell
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file (optional, defaults to proxy)
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 3. Test the Application

1. Open browser to `http://localhost:5173`
2. Click "Get Started" to register a new account
3. Fill in profile with skills (e.g., JavaScript, React, HTML, CSS)
4. Go to Dashboard to see personalized recommendations
5. Browse Jobs and Resources pages

---

## 📁 Project Structure

```
IIUC_25/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register/Login
│   │   ├── userController.js     # Profile management
│   │   ├── jobController.js      # Job listings
│   │   ├── resourceController.js # Learning resources
│   │   ├── recommendationController.js  # Matching logic
│   │   └── contactController.js  # Contact form
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Job.js               # Job schema
│   │   └── Resource.js          # Resource schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── contactRoutes.js
│   │   └── seedRoutes.js
│   ├── seed/
│   │   └── seed.js              # Database seeding script
│   ├── package.json
│   └── server.js                # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation with dark mode
│   │   │   ├── Footer.jsx       # Site footer
│   │   │   └── ProtectedRoute.jsx  # Auth guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── About.jsx        # Mission page
│   │   │   ├── Login.jsx        # Login form
│   │   │   ├── Register.jsx     # Registration form
│   │   │   ├── Dashboard.jsx    # User dashboard
│   │   │   ├── Profile.jsx      # Profile editor
│   │   │   ├── Jobs.jsx         # Job listings
│   │   │   ├── JobDetails.jsx   # Job detail view
│   │   │   ├── Resources.jsx    # Learning resources
│   │   │   └── Contact.jsx      # Contact form
│   │   ├── utils/
│   │   │   └── api.js           # Axios instance
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🌐 Deployment

### Backend Deployment (Render)

1. **Create Render Account** at https://render.com

2. **Create New Web Service**

   - Connect your GitHub repository
   - Select `backend` as root directory
   - Configure:
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Environment: Node

3. **Add Environment Variables**

   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/careerpath
   JWT_SECRET=your_production_secret_key_here
   PORT=5000
   NODE_ENV=production
   ```

4. **Deploy** - Render will automatically build and deploy

### Frontend Deployment (Vercel)

1. **Create Vercel Account** at https://vercel.com

2. **Import Project**

   - Connect GitHub repository
   - Framework Preset: Vite
   - Root Directory: `frontend`

3. **Configure Environment Variable**

   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

4. **Deploy** - Vercel will build and deploy automatically

### Alternative: Railway (Full-stack)

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

---

## 🧪 Testing Recommendations

### Get Personalized Recommendations

1. **Register** with email and password
2. **Add Skills** in Profile page (e.g., JavaScript, React, Python)
3. **Go to Dashboard** to see matched jobs and resources
4. Each recommendation shows WHY it matches (transparent reasoning)

### API Endpoint Testing

```bash
# Get recommendations for a user (replace USER_ID)
GET http://localhost:5000/api/recommendations/USER_ID

# Response includes:
{
  "user": { "skills": [...], "careerTrack": "..." },
  "recommendations": {
    "jobs": [{ "matchReason": "Matches: JavaScript, React", ... }],
    "resources": [{ "matchReason": "Matches: JavaScript", ... }]
  }
}
```

---

## 🎨 Design System

### Colors

- **Primary**: `#00C16A` (Green - SDG 8 theme)
- **Primary Dark**: `#009956`
- **Background**: `#FFFFFF`
- **Text**: `#1A1A1A`
- **Muted**: `#6B7280`
- **Border**: `#E5E7EB`

### Typography

- **Headings**: Poppins (bold, 600-800)
- **Body**: Inter (400-600)

### Components

- Rounded corners (8-16px)
- Subtle shadows
- Smooth transitions (200ms)
- Hover effects (lift, scale)
- Dark mode support

---

## 📊 Seed Data

The database includes:

### Jobs (20 samples)

- **Types**: Internship, Part-time, Full-time, Freelance, Contract
- **Levels**: Student, Fresher, Junior, Mid-level
- **Skills**: HTML, CSS, JavaScript, React, Python, Excel, Design, etc.
- **Locations**: Remote, Dhaka, Chittagong, Sylhet

### Resources (20 samples)

- **Platforms**: Udemy, Coursera, YouTube, FreeCodeCamp, MongoDB University
- **Costs**: Free, Paid, Freemium
- **Skills**: Programming, Design, Marketing, Data Analysis, etc.

---

## 🔐 Security Notes

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire in 30 days
- Protected routes require valid token
- CORS enabled for frontend communication
- Input validation on forms
- Environment variables for secrets

---

## 🐛 Troubleshooting

### Backend won't start

- Check MongoDB is running: `mongod` or Atlas connection string
- Verify `.env` file exists with correct values
- Check port 5000 is not in use

### Frontend can't connect to backend

- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS is enabled in backend

### Seed script fails

- Ensure MongoDB is connected
- Check for duplicate data (run seed again to clear and re-seed)
- Verify models are correctly defined

### Recommendations not showing

- User must have skills added in profile
- Jobs/Resources must exist in database (run seed)
- Check browser console for errors

---

## 🎯 Next Steps (Part 2 - AI Features)

Future enhancements could include:

1. **AI-powered recommendations** using OpenAI/Gemini
2. **Resume parsing** to auto-extract skills
3. **Chatbot assistant** for career guidance
4. **Job description generation** for employers
5. **Skill gap analysis** with learning path suggestions

---

## 📞 Support

For issues or questions:

- Check console logs (browser & terminal)
- Review error messages carefully
- Ensure all dependencies are installed
- Verify environment variables are set

---

**Built with ❤️ for SDG 8 - Decent Work & Economic Growth**
