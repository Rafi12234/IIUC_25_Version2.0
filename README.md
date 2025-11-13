# CareerPath - Youth Employment & Career Roadmap Platform

**An AI-Ready youth employment platform aligned with SDG 8** — connecting students and fresh graduates to relevant jobs and personalized learning resources.

## 🚀 Tech Stack

### Frontend

- **React 18** with Vite
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router DOM** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **CORS** & **dotenv** for configuration

## 📁 Project Structure

```
/project-root
  /frontend          # React + Vite frontend
  /backend           # Express + MongoDB backend
  README.md          # This file
  .env.example       # Environment variables template
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
# MONGO_URI=mongodb://localhost:27017/careerpath
# JWT_SECRET=your_super_secret_key
# PORT=5000

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🌱 Seeding Data

The seed script populates the database with:

- **15-20 Jobs** (Internships, Full-time, Freelance, etc.)
- **15-20 Learning Resources** (Courses, tutorials, etc.)

Run: `npm run seed` from the `/backend` directory

## 🎯 Features

### For Students & Fresh Graduates

- ✅ **Smart Job Matching** — Discover jobs aligned with your skills
- 📚 **Personalized Learning Paths** — Get relevant courses and resources
- 📝 **CV & Profile Builder** — Showcase your experience and aspirations
- 🎯 **Transparent Recommendations** — See exactly why each job/resource matches you

### For Platform

- 🔐 **Secure Authentication** — JWT-based login/register
- 🎨 **Beautiful UI** — Notion/Linear-inspired minimal design
- 📱 **Fully Responsive** — Mobile, tablet, desktop optimized
- ♿ **Accessible** — ARIA labels and keyboard navigation
- 🌙 **Dark Mode** — Optional theme toggle

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and get JWT token

### Users

- `GET /api/users/me` — Get current user profile (protected)
- `PUT /api/users/:id` — Update user profile (protected)

### Jobs

- `GET /api/jobs` — List all jobs (supports filters)
- `GET /api/jobs/:id` — Get job details

### Resources

- `GET /api/resources` — List all learning resources (supports filters)

### Recommendations

- `GET /api/recommendations/:userId` — Get personalized job & resource recommendations

### Utilities

- `POST /api/contact` — Submit contact form
- `POST /api/seed` — Seed database (development only)

## 🚢 Deployment

### Frontend (Vercel/Netlify)

**Vercel:**

```bash
cd frontend
vercel
```

**Netlify:**

```bash
cd frontend
npm run build
# Upload 'dist' folder to Netlify
```

Set environment variable:

- `VITE_API_URL` → Your backend URL

### Backend (Render/Railway)

**Render:**

1. Connect your GitHub repo
2. Select `/backend` as root directory
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in Render dashboard

**Railway:**

```bash
cd backend
railway login
railway init
railway up
```

Set environment variables:

- `MONGO_URI` → MongoDB connection string
- `JWT_SECRET` → Random secret key
- `PORT` → 5000 (or Railway assigns)

## 🎨 Design System

### Colors

- Background: `#FFFFFF`
- Primary: `#00C16A` (Green)
- Primary Dark: `#009956`
- Text: `#1A1A1A`
- Muted: `#6B7280`
- Border: `#E5E7EB`

### Typography

- **Headings:** Poppins
- **Body:** Inter

## 🧪 Testing Recommendations Endpoint

```bash
# Get recommendations for user
GET http://localhost:5000/api/recommendations/USER_ID_HERE

# Example response includes matched skills and reasoning
```

## 📝 License

MIT License - Built for SDG 8 Youth Employment Initiative

## 🤝 Contributing

This is a hackathon/demo project. Feel free to fork and extend with AI features in Part 2!

---

**Built with ❤️ for youth employment and career development**
