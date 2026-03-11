# 🔧 Fix Render Configuration - Wrong Start Command

## Problem
Render is running `npm run dev` instead of `npm start`, causing this error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx'
```

## Root Cause
Your Render service is configured with the wrong **Start Command**. It should run the production build, not the development server.

## ✅ How to Fix in Render Dashboard

### Step 1: Go to Your Render Service
1. Log into [render.com](https://render.com)
2. Click on your backend service (e.g., "forex-institute-backend")
3. Go to the **Settings** tab

### Step 2: Update Start Command
1. Scroll down to **Build & Deploy** section
2. Find **Start Command** field
3. **Current (Wrong)**: `npm run dev`
4. **Change to**: `npm start`
5. Click **Save Changes**

### Step 3: Verify Build Command
Make sure these settings are correct:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `backend`

### Step 4: Redeploy
1. Click **Manual Deploy** → **Deploy latest commit**
2. Or push a new commit to trigger auto-deploy

## 📋 Correct Render Configuration

```
Environment: Node
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

## 🔍 Why This Happens

### Development vs Production Commands

**Development (`npm run dev`)**:
- Uses `tsx` to run TypeScript directly
- Good for local development with hot reload
- Requires `tsx` package (in devDependencies)

**Production (`npm start`)**:
- Runs compiled JavaScript from `dist/` folder
- Faster startup, no TypeScript compilation
- No `tsx` dependency needed

### Render Behavior
- Render doesn't install `devDependencies` in production
- If configured to run `npm run dev`, it fails because `tsx` is missing
- Must use `npm start` to run the compiled production build

## ✅ Expected Deployment Flow

1. **Build Phase**: `npm install && npm run build`
   - Installs dependencies
   - Compiles TypeScript to JavaScript in `dist/` folder

2. **Start Phase**: `npm start`
   - Runs `node dist/server.js`
   - Uses compiled JavaScript (fast startup)

## 🐛 Alternative Quick Fix

If you can't access Render dashboard right now, I've temporarily moved `tsx` to `dependencies` so `npm run dev` will work. But you should still fix the Render configuration to use `npm start` for better performance.

## 🎯 Verification

After fixing the configuration, your Render logs should show:
```
==> Running 'npm start'
> forex-institute-backend@1.0.0 start
> node dist/server.js

✅ Connected to MongoDB
🚀 Production mode
📡 API Server ready
🚀 Server running on port 10000
```

## 📞 If You Need Help

If you can't find the Settings tab or Start Command field:
1. Make sure you're looking at the **Web Service** (not Static Site)
2. The Settings tab is usually next to "Logs" and "Events"
3. The Build & Deploy section is in the middle of the settings page

The key is changing **Start Command** from `npm run dev` to `npm start`!