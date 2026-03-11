# 🚀 Deploy Frontend to Vercel + Backend to Render

This guide shows you how to deploy the frontend to Vercel and backend to Render for optimal performance and scalability.

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free)
- Render account (free tier available)
- MongoDB Atlas database
- Razorpay account (optional)

## 🎯 Deployment Overview

1. **Backend on Render** - API server at `https://your-app.onrender.com`
2. **Frontend on Vercel** - React app at `https://your-app.vercel.app`
3. **Frontend calls Backend** - API requests proxied to Render

---

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

### 1.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `forex-institute-backend` (or your choice)
   - **Environment**: `Node`
   - **Root Directory**: `backend` (important!)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (for testing) or `Starter` (for production)

**⚠️ Important**: The backend now includes TypeScript compilation. Make sure your `package.json` has TypeScript and type definitions in `dependencies` (not `devDependencies`) for the build to work on Render.

### 1.3 Set Environment Variables ⚠️ **CRITICAL STEP**
In Render dashboard, add these environment variables (the server won't start without them):

**Required:**
```env
MONGODB_URI=mongodb+srv://satyapujith:Satya%409100@cluster0.qtr33fw.mongodb.net/institute_management
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
```

**Optional:**
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=https://your-frontend-app.vercel.app
```

**⚠️ Important**: Generate a secure JWT_SECRET (at least 32 characters). The server will exit with status 1 if these variables are missing.

### 1.4 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://your-app-name.onrender.com`

### 1.5 Test Backend
Visit `https://your-app-name.onrender.com/health` to verify it's working.

---

## 🎨 Step 2: Configure Frontend for Vercel

### 2.1 Create vercel.json
Create `vercel.json` in your project root:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.onrender.com/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

**⚠️ Important**: Replace `your-backend-url.onrender.com` with your actual Render backend URL.

### 2.2 Update vite.config.ts (Optional)
For local development, keep the existing proxy:

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

### 2.3 Update Backend CORS (Important!)
Update your `server.ts` to allow Vercel domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-frontend-url.vercel.app',
        'https://*.vercel.app' // Allow all Vercel preview deployments
      ]
    : ['http://localhost:5173'],
  credentials: true
}));
```

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Install Vercel CLI (optional): `npm i -g vercel`

### 3.2 Deploy via Dashboard
1. Click "New Project"
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (important!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.3 Set Environment Variables (Optional)
If you need any frontend environment variables:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build and deployment (2-5 minutes)
3. Get your frontend URL: `https://your-app.vercel.app`

### 3.5 Update Backend CORS
Go back to Render and update your backend environment variables:
```env
FRONTEND_URL=https://your-app.vercel.app
```

Then update `server.ts`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Redeploy your backend on Render.

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend
- Visit: `https://your-backend.onrender.com/health`
- Should return: `{"status":"OK","timestamp":"...","uptime":...}`

### 4.2 Test Frontend
- Visit: `https://your-frontend.vercel.app`
- Should load the login page
- Try logging in with admin credentials

### 4.3 Test API Connection
- Open browser dev tools (F12)
- Go to Network tab
- Try logging in
- Verify API calls go to your Render backend URL

---

## 🔧 Configuration Files Summary

### vercel.json (Required)
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR_BACKEND_URL.onrender.com/api/$1"
    }
  ]
}
```

### Environment Variables

**Render (Backend):**
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Vercel (Frontend):**
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## 🚀 Deployment Commands

### Deploy Backend to Render
```bash
# Push to GitHub
git add .
git commit -m "Deploy backend to Render"
git push origin main

# Render will auto-deploy from GitHub
```

### Deploy Frontend to Vercel
```bash
# Option 1: Via Dashboard (Recommended)
# Just push to GitHub, Vercel auto-deploys

# Option 2: Via CLI
npm i -g vercel
vercel --prod
```

---

## 🔄 Continuous Deployment

Both platforms support automatic deployment:

### Render
- Automatically deploys when you push to `main` branch
- Shows build logs and deployment status
- Free tier has some limitations (sleeps after 15 min of inactivity)

### Vercel
- Automatically deploys on every push
- Creates preview deployments for pull requests
- Excellent performance and CDN

---

## 🐛 Troubleshooting

### CORS Errors
**Problem**: API calls blocked by CORS policy
**Solution**: 
1. Update backend CORS configuration
2. Add your Vercel domain to allowed origins
3. Redeploy backend

### 404 API Errors
**Problem**: API calls return 404
**Solution**:
1. Check `vercel.json` rewrite rules
2. Verify backend URL is correct
3. Test backend URL directly

### Build Errors on Vercel
**Problem**: Build fails during deployment
**Solution**:
1. Check Node.js version compatibility
2. Verify all dependencies in package.json
3. Check build logs for specific errors

### Backend Sleep (Render Free Tier)
**Problem**: First request takes 30+ seconds
**Solution**:
1. Upgrade to paid tier for always-on
2. Use a service to ping your backend periodically
3. Implement proper loading states in frontend

### Environment Variables Not Working
**Problem**: App can't connect to database
**Solution**:
1. Double-check variable names (case-sensitive)
2. Verify MongoDB URI format
3. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for Render)

---

## 📊 Performance Tips

### Backend (Render)
- Use Starter plan for better performance
- Enable HTTP/2
- Implement proper caching headers
- Use MongoDB connection pooling

### Frontend (Vercel)
- Enable Vercel Analytics
- Use Vercel Image Optimization
- Implement code splitting
- Enable compression

---

## 💰 Cost Estimation

### Free Tier
- **Render**: 750 hours/month (sleeps after 15 min)
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Total**: $0/month

### Production Tier
- **Render Starter**: $7/month (always-on)
- **Vercel Pro**: $20/month (team features)
- **Total**: $27/month

---

## 🎉 Success!

Your application is now deployed with:
- ✅ Frontend on Vercel (fast, global CDN)
- ✅ Backend on Render (reliable, auto-scaling)
- ✅ Secure environment variables
- ✅ Automatic deployments
- ✅ HTTPS enabled

**Frontend URL**: `https://your-app.vercel.app`
**Backend URL**: `https://your-backend.onrender.com`

Share your frontend URL with users - they'll have a fast, reliable experience!