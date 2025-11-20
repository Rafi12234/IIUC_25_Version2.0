# Deployment Guide

This guide will help you deploy the Career Path application to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Firebase project with credentials
- Google Gemini API key

## Option 1: Deploy as Separate Services (Recommended)

### Step 1: Deploy Frontend to Vercel

1. **Push code to GitHub** (if not already done):

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository `IIUC_25_Version2.0`
   - Configure project:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Add Environment Variables** in Vercel dashboard:

   You can either add them manually or import from your `.env` file:

   - Click **Import .env** button and paste the contents of your `frontend/.env` file
   - Or add them individually:

   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=iiuc25.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=iiuc25
   VITE_FIREBASE_STORAGE_BUCKET=iiuc25.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

4. Click **Deploy**

### Step 2: Deploy Backend to Vercel

1. **Create a new Vercel project** for the backend:

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the same repository
   - Configure project:
     - **Framework Preset**: Other
     - **Root Directory**: `backend`
     - **Build Command**: Leave empty
     - **Output Directory**: Leave empty

2. **Add Environment Variables**:

   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Update CORS in backend/main.py**:
   Replace the CORS origins with your Vercel frontend URL:

   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://your-frontend-app.vercel.app",
           "http://localhost:5173"
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. Click **Deploy**

### Step 3: Connect Frontend to Backend

1. Go to your **frontend** Vercel project
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_URL` to your backend Vercel URL:
   ```
   VITE_API_URL=https://your-backend-app.vercel.app
   ```
4. Redeploy the frontend

## Option 2: Alternative Backend Hosting (Railway)

If Vercel doesn't work well for the Python backend, use Railway:

### Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```
6. Railway will provide a URL like `https://your-app.up.railway.app`
7. Update frontend's `VITE_API_URL` to this Railway URL

## Post-Deployment Steps

### 1. Update Firebase Settings

Go to Firebase Console → Authentication → Settings → Authorized domains
Add your Vercel domains:

- `your-app.vercel.app`
- `your-app-git-main.vercel.app`

### 2. Test the Deployment

1. Visit your frontend URL
2. Try logging in with Google
3. Test the AI chatbot
4. Check if job listings load
5. Test all features

### 3. Set up Custom Domain (Optional)

In Vercel:

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

## Environment Variables Summary

### Frontend (.env)

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=iiuc25.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=iiuc25
VITE_FIREBASE_STORAGE_BUCKET=iiuc25.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=https://your-backend-url.vercel.app
```

### Backend (.env)

```env
GEMINI_API_KEY=your_gemini_api_key
```

## Troubleshooting

### Frontend build fails

- Check if all dependencies are in `package.json`
- Ensure Node version is 18 or higher
- Check build logs for specific errors

### Backend deployment fails

- Verify `requirements.txt` has all dependencies
- Check Python version compatibility
- Ensure `main.py` doesn't have syntax errors

### CORS errors

- Add your frontend URL to backend CORS origins
- Include both production and preview URLs

### API calls fail

- Verify `VITE_API_URL` is set correctly
- Check backend is running and accessible
- Look at browser console for specific errors

### Firebase errors

- Verify all Firebase environment variables are set
- Check Firebase authorized domains include Vercel URLs
- Ensure Firebase rules allow your operations

## Continuous Deployment

Once set up, Vercel will automatically deploy:

- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

## Monitoring

- Check Vercel dashboard for deployment status
- View logs in Vercel → Deployments → [Your Deployment] → Logs
- Monitor Firebase Console for database and auth usage

## Support

For issues:

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Firebase Docs: https://firebase.google.com/docs
