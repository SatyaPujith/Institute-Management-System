# Fix 404 Errors - Simple Steps

## The Problem
Your backend server is running old code. The new endpoints exist in the files but aren't loaded yet.

## The Solution (30 seconds)

### Step 1: Stop Backend
In the terminal running `npm run backend`:
```
Press Ctrl+C
```

### Step 2: Start Backend
```bash
npm run backend
```

### Step 3: Verify
You should see:
```
✅ Connected to MongoDB
🔄 Checking for students to migrate...
✅ Migrated X students to enrollments collection
🚀 Server running on http://localhost:3000
```

### Step 4: Test
- Refresh browser
- Login as student (john@example.com / student123)
- Check console - NO 404 errors
- Profile shows data
- Courses page works
- Payment page works

## That's It!
The code is complete and correct. It just needs to be loaded by restarting the server.

---

## What If It Still Doesn't Work?

### Check 1: Backend Port
Make sure backend is running on port 3000:
```bash
npm run backend
```
Should show: `Server running on http://localhost:3000`

### Check 2: Frontend Port
Make sure frontend is running on port 5173:
```bash
npm run frontend
```
Should show: `Local: http://localhost:5173/`

### Check 3: MongoDB Connection
Check .env file has:
```
MONGODB_URI=mongodb+srv://satyapujith:Satya%409100@cluster0.qtr33fw.mongodb.net/institute_management
```

### Check 4: Clear Browser Cache
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload page

---

## Why This Happened
Node.js doesn't automatically reload code when files change. The server process needs to be manually restarted to load new code. This is normal behavior.

## Prevention
Consider using `nodemon` for auto-restart during development:
```bash
npm install -D nodemon
```

Then update package.json:
```json
"backend": "nodemon --exec tsx server.ts"
```

This will auto-restart the server when code changes.
