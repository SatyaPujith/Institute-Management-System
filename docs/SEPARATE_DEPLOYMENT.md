# 🚀 Separate Frontend & Backend Deployment Guide

## 📁 New Project Structure

```
institute-management-system/
├── frontend/                    # React Frontend
│   ├── src/                    # React components
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── vercel.json           # Vercel deployment config
│   ├── .env.example          # Frontend environment template
│   └── index.html            # HTML template
├── backend/                     # Node.js Backend
│   ├── server/                # Database connection
│   ├── server.ts             # Express server
│   ├── package.json          # Backend dependencies
│   └── .env.example          # Backend environment template
├── docs/                       # Documentation
├── README.md                  # Project overview
└── LICENSE                    # MIT License
```

---

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub repository

### 1.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `forex-institute-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (for testing) or `Starter` (for production)

### 1.3 Set Environment Variables
In Render dashboard, add these environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 1.4 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://your-backend-name.onrender.com`

### 1.5 Test Backend
Visit `https://your-backend-name.onrender.com/health` to verify it's working.

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Update vercel.json
In `frontend/vercel.json`, replace `YOUR_BACKEND_URL.onrender.com` with your actual Render backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-actual-backend.onrender.com/api/$1"
    }
  ]
}
```

### 2.2 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2.3 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.4 Set Environment Variables (Optional)
If needed, add frontend environment variables:
```env
VITE_API_URL=https://your-backend-name.onrender.com
```

### 2.5 Deploy
1. Click "Deploy"
2. Wait for build and deployment (2-5 minutes)
3. Get your frontend URL: `https://your-frontend-name.vercel.app`

---

## 🔄 Step 3: Update Backend CORS

### 3.1 Update Backend Environment
Go back to Render and update your backend environment variables:
```env
FRONTEND_URL=https://your-frontend-name.vercel.app
```

### 3.2 Redeploy Backend
Render will automatically redeploy when you update environment variables.

---

## 🧪 Step 4: Test Complete Setup

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

## 📝 Local Development Setup

### Backend Development
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
cp .env.example .env
# Edit .env with backend URL (http://localhost:3000 for local)
npm install
npm run dev
```

### Run Both Locally
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🚀 Deployment Commands

### Deploy Backend (Render)
```bash
# Push to GitHub - Render auto-deploys
git add backend/
git commit -m "Update backend"
git push origin main
```

### Deploy Frontend (Vercel)
```bash
# Push to GitHub - Vercel auto-deploys
git add frontend/
git commit -m "Update frontend"
git push origin main
```

---

## 🐛 Troubleshooting

### "Missing script: start" Error
- ✅ **Fixed**: Backend now has proper `package.json` with `start` script

### CORS Errors
- Update `FRONTEND_URL` in backend environment variables
- Ensure frontend URL is correct in backend CORS configuration

### Build Errors
- Check Node.js version compatibility (>=18.0.0)
- Verify all dependencies are in respective package.json files
- Check build logs for specific errors

### API 404 Errors
- Verify `vercel.json` rewrite rules point to correct backend URL
- Test backend URL directly
- Check network tab in browser dev tools

---

## 📊 Benefits of Separate Deployment

### ✅ Advantages
- **Independent scaling** - Scale frontend and backend separately
- **Better performance** - Frontend on Vercel CDN, backend on Render
- **Easier debugging** - Separate logs and monitoring
- **Technology flexibility** - Can change frontend/backend independently
- **Team workflow** - Frontend and backend teams can work independently

### 📈 Performance
- **Frontend**: Vercel's global CDN for fast loading
- **Backend**: Render's optimized Node.js hosting
- **Database**: MongoDB Atlas with global clusters

---

## 🎉 Success!

Your application is now deployed with:
- ✅ **Frontend**: Fast React app on Vercel
- ✅ **Backend**: Reliable API server on Render
- ✅ **Database**: MongoDB Atlas
- ✅ **Payments**: Razorpay integration
- ✅ **Security**: Environment variables properly configured
- ✅ **Auto-deployment**: Both platforms deploy on git push

**Frontend URL**: `https://your-frontend.vercel.app`
**Backend URL**: `https://your-backend.onrender.com`

Share your frontend URL with users for the best experience!