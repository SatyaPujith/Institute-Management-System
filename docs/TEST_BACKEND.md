# Backend Server Test Guide

## Issue
Getting 404 errors for new endpoints:
- `/api/student/courses-list`
- `/api/student/all-payments`
- `/api/profile`

## Root Cause
The backend server is either:
1. Not running
2. Running old code (needs restart)
3. Running on wrong port

## Solution

### Step 1: Stop All Running Servers
```bash
# Press Ctrl+C in both terminal windows to stop:
# - Backend server (Terminal 1)
# - Frontend server (Terminal 2)
```

### Step 2: Start Backend Server
```bash
# Terminal 1
npm run backend
```

**Expected Output:**
```
✅ Connected to MongoDB
✅ Default admin created (or already exists)
📦 Seeding sample data... (if first time)
✅ Sample data seeded
🔄 Checking for students to migrate...
📦 Found X students to migrate (if any exist)
✅ Migrated X students to enrollments collection
🚀 Server running on http://localhost:3000
```

### Step 3: Test Backend Endpoints
Open a new terminal and test:

```bash
# Test 1: Check if server is running
curl http://localhost:3000

# Test 2: Test login (should work)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@institute.com","password":"admin123"}'

# Should return: {"token":"...","user":{...}}
```

### Step 4: Start Frontend Server
```bash
# Terminal 2
npm run frontend
```

**Expected Output:**
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Test in Browser
1. Open http://localhost:5173
2. Login as student
3. Check browser console (F12)
4. Should NOT see 404 errors

## Common Issues

### Issue 1: Port 3000 Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in server.ts:
const PORT = 3001;  // Use different port
```

### Issue 2: MongoDB Connection Failed
**Error:** `❌ MongoDB connection error`

**Solution:**
- Check `.env` file has correct MONGODB_URI
- Check internet connection
- Verify MongoDB Atlas credentials

### Issue 3: Old Code Still Running
**Symptom:** 404 errors persist

**Solution:**
```bash
# Kill all node processes
# Windows:
taskkill /F /IM node.exe

# Then restart:
npm run backend
npm run frontend
```

### Issue 4: TypeScript Compilation Errors
**Error:** `Error: Cannot find module...`

**Solution:**
```bash
# Reinstall dependencies
npm install

# Then restart
npm run backend
```

## Verify Endpoints Exist

Check server.ts has these endpoints:

```bash
# Search for endpoints
grep -n "app.get('/api/student/courses-list" server.ts
grep -n "app.get('/api/student/all-payments" server.ts
grep -n "app.get('/api/profile" server.ts
```

Should show line numbers where endpoints are defined.

## Debug Mode

Add console logs to verify endpoints are registered:

```javascript
// In server.ts, after all routes:
console.log('📋 Registered routes:');
console.log('  GET /api/student/courses-list');
console.log('  GET /api/student/all-payments');
console.log('  GET /api/profile');
```

## Network Tab Check

1. Open browser DevTools (F12)
2. Go to Network tab
3. Login as student
4. Navigate to Courses page
5. Check requests:
   - Should see: `http://localhost:3000/api/student/courses-list`
   - Status should be: `200 OK` (not 404)

If still 404:
- Backend not running
- Wrong URL (check proxy in vite.config.ts)
- CORS issue

## Proxy Configuration

Verify `vite.config.ts` has proxy:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

## Quick Fix Checklist

- [ ] Stop all servers (Ctrl+C)
- [ ] Run `npm run backend` in Terminal 1
- [ ] Wait for "Server running on http://localhost:3000"
- [ ] Run `npm run frontend` in Terminal 2
- [ ] Open http://localhost:5173
- [ ] Login as student
- [ ] Check for 404 errors in console
- [ ] If still 404, check backend terminal for errors

## Expected Behavior After Fix

### Backend Terminal:
```
✅ Connected to MongoDB
🔄 Checking for students to migrate...
✅ Migrated 1 students to enrollments collection
🚀 Server running on http://localhost:3000
```

### Frontend Terminal:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Browser Console:
```
✅ No 404 errors
✅ Data loads successfully
✅ Profile shows data
✅ Courses show enrolled courses
✅ Payments show payment items
```

## Still Not Working?

If you still see 404 errors after following all steps:

1. **Check backend is actually running:**
   ```bash
   curl http://localhost:3000/api/courses
   ```
   Should return course data (not 404)

2. **Check frontend proxy:**
   - Open http://localhost:5173/api/courses in browser
   - Should show course data (proxied from backend)

3. **Check authentication:**
   - 404 might actually be 401/403 (unauthorized)
   - Try logging out and logging in again

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R
   - Or clear cache in DevTools

5. **Check for multiple node processes:**
   ```bash
   # Windows
   tasklist | findstr node
   
   # Should only see 2 node processes (backend + frontend)
   ```

## Success Indicators

✅ Backend shows: "Server running on http://localhost:3000"
✅ Frontend shows: "Local: http://localhost:5173/"
✅ Browser console: No 404 errors
✅ Profile page: Shows student data
✅ Courses page: Shows enrolled courses
✅ Payments page: Shows payment items

If all indicators are ✅, the system is working correctly!
