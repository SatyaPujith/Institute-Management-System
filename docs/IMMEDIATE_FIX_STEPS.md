# 🚨 IMMEDIATE FIX - API 404 Error

## Current Problem
- ✅ Backend is running (health endpoint works)
- ❌ API endpoints return 404 (database connection failing)
- ❌ Environment variables not set in Render

## 🔧 URGENT: Set Environment Variables in Render

### Step 1: Go to Render Dashboard
1. Open [render.com](https://render.com)
2. Click on your service: **institute-management-system-3**
3. Click the **Environment** tab

### Step 2: Add Environment Variables
Click **"Add Environment Variable"** for each of these:

#### Variable 1: MONGODB_URI
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://satyapujith:Satya%409100@cluster0.qtr33fw.mongodb.net/institute_management?retryWrites=true&w=majority`

#### Variable 2: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: `ForexInstitute2026SecretKey123!@#`

#### Variable 3: NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`

#### Variable 4: FRONTEND_URL
- **Key**: `FRONTEND_URL`
- **Value**: `https://institute-management-system-gules.vercel.app`

### Step 3: Save Changes
1. Click **"Save Changes"**
2. Render will automatically redeploy (takes 2-3 minutes)

## 🔧 URGENT: MongoDB Atlas IP Whitelist

### Step 1: Go to MongoDB Atlas
1. Open [cloud.mongodb.com](https://cloud.mongodb.com)
2. Go to **Network Access** (left sidebar)

### Step 2: Add IP Address
1. Click **"Add IP Address"**
2. Select **"Allow Access from Anywhere"**
3. Or manually enter: `0.0.0.0/0`
4. Click **"Confirm"**

## 🎯 Expected Result

After setting environment variables, your Render logs should show:
```
✅ Connected to MongoDB
🔄 Checking for students to migrate...
🚀 Production mode
📡 API Server ready
🚀 Server running on port 10000
```

Then the API endpoints will work:
- ✅ `/api/auth/login` will return proper response (not 404)
- ✅ Frontend login will work

## 🔍 How to Check Progress

### 1. Watch Render Logs
- **Render Dashboard** → Your Service → **Logs**
- Wait for "Connected to MongoDB" message

### 2. Test API Endpoint
```bash
curl -X POST https://institute-management-system-3.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@institute.com","password":"admin123"}'
```

### 3. Test Frontend Login
- Go to your frontend: https://institute-management-system-gules.vercel.app
- Try logging in with: `admin@institute.com` / `admin123`

## ⚡ Why This Fixes the Issue

**Current State**:
- Server starts ✅
- Health endpoint works ✅ (no database required)
- Database connection fails ❌ (no environment variables)
- API routes not registered ❌ (due to DB connection failure)

**After Fix**:
- Server starts ✅
- Database connects ✅ (environment variables provided)
- API routes registered ✅ (database connection successful)
- Login works ✅

## 🚨 Critical: Do This Now

1. **Set environment variables in Render** (most important)
2. **Add IP whitelist in MongoDB Atlas**
3. **Wait 2-3 minutes** for redeploy
4. **Test login** on frontend

The API 404 error will be fixed once the database connection is established!