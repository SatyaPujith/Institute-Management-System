# 🔧 Debug API Connection Issues

## Current Status
✅ Frontend deployed: https://institute-management-system-gules.vercel.app/  
✅ Backend deployed: https://institute-management-system-3.onrender.com/  
✅ Health endpoint working: `/health` returns 200 OK  
❌ API endpoints failing: `/api/auth/login` returns 404  

## Root Cause Analysis

### Issue 1: vercel.json Configuration ✅ FIXED
**Problem**: `vercel.json` had placeholder URL instead of actual backend URL  
**Solution**: Updated to use `https://institute-management-system-3.onrender.com`

### Issue 2: Possible Database Connection Failure
**Symptoms**: 
- Health endpoint works (no DB required)
- API endpoints return 404 (DB required)
- Server starts but API routes may not be registered due to DB connection failure

## 🔧 Immediate Fixes Applied

### 1. Updated vercel.json
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://institute-management-system-3.onrender.com/api/$1"
    }
  ]
}
```

### 2. Environment Variables Check
Verify these are set in **Render Dashboard** → **Environment**:

```
MONGODB_URI=mongodb+srv://satyapujith:Satya%409100@cluster0.qtr33fw.mongodb.net/institute_management?retryWrites=true&w=majority
JWT_SECRET=ForexInstitute2026SecretKey123!@#
NODE_ENV=production
FRONTEND_URL=https://institute-management-system-gules.vercel.app
```

### 3. MongoDB Atlas IP Whitelist
**MongoDB Atlas** → **Network Access** → Add IP: `0.0.0.0/0`

## 🧪 Testing Steps

### Test 1: Health Endpoint ✅
```bash
curl https://institute-management-system-3.onrender.com/health
# Expected: {"status":"OK","timestamp":"...","uptime":...}
```

### Test 2: API Endpoint (Currently Failing)
```bash
curl -X POST https://institute-management-system-3.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@institute.com","password":"admin123"}'
# Current: 404 Not Found
# Expected: Login response or authentication error
```

### Test 3: Direct API Call (Bypass Vercel)
```bash
# Test from browser console on your frontend
fetch('https://institute-management-system-3.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({email: 'admin@institute.com', password: 'admin123'})
})
```

## 🔍 Debugging Process

### Step 1: Check Render Logs
1. **Render Dashboard** → Your Service → **Logs**
2. Look for:
   - `✅ Connected to MongoDB` (should appear)
   - `🚀 Server running on port 10000` (should appear)
   - Any error messages during startup

### Step 2: Expected Log Output
```
✅ Connected to MongoDB
🔄 Checking for students to migrate...
🚀 Production mode
📡 API Server ready
🚀 Server running on port 10000
```

### Step 3: If MongoDB Connection Fails
```
❌ MongoDB connection error: MongoServerSelectionError
==> Exited with status 1
```

## 🚀 Next Actions

### Immediate (Push Changes)
1. **Commit and push** the `vercel.json` fix
2. **Wait for Vercel redeploy** (2-3 minutes)
3. **Test login** from frontend

### If Still Failing
1. **Check Render logs** for MongoDB connection errors
2. **Verify environment variables** are set correctly
3. **Check MongoDB Atlas** IP whitelist and user permissions

### Environment Variables Priority
1. **MONGODB_URI** - Most critical (server won't start without DB)
2. **JWT_SECRET** - Required for authentication
3. **FRONTEND_URL** - Required for CORS
4. **NODE_ENV** - Should be "production"

## 🎯 Expected Result

After fixes, the login should work:
1. **Frontend**: Login form submits to `/api/auth/login`
2. **Vercel**: Rewrites to `https://institute-management-system-3.onrender.com/api/auth/login`
3. **Backend**: Processes login and returns JWT token
4. **Frontend**: Receives token and redirects to dashboard

## 🔧 Quick Test

Try this in your browser console on the frontend:
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@institute.com',
    password: 'admin123'
  })
}).then(r => r.json()).then(console.log)
```

This should return either a successful login or a proper error (not 404).