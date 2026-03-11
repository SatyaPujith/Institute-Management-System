# Backend Server Restart Required

## Problem
You're seeing 404 errors for these endpoints:
- `/api/student/courses-list`
- `/api/student/all-payments`
- `/api/profile`

## Root Cause
The backend server is running OLD CODE that doesn't have these new endpoints. The code has been updated in the files, but the running server process hasn't loaded the changes yet.

## Solution - Restart Backend Server

### Step 1: Stop the Backend Server
1. Find the terminal window running `npm run backend`
2. Press `Ctrl+C` to stop the server
3. Wait for the process to fully terminate

### Step 2: Start the Backend Server
```bash
npm run backend
```

### Step 3: Verify Server Started Successfully
You should see these messages in the console:
```
✅ Connected to MongoDB
✅ Default admin created (if first time)
🔄 Checking for students to migrate...
✅ Migrated X students to enrollments collection (if any exist)
🚀 Backend server running on http://localhost:3000
```

### Step 4: Test in Browser
1. Login as a student (john@example.com / student123)
2. Check the browser console (F12)
3. You should see NO 404 errors
4. Profile should show student details (not N/A)
5. Courses page should show enrolled and available courses
6. Payment page should show courses with payment status

## What the Server Will Do on Startup
1. Connect to MongoDB
2. Create necessary indexes
3. Auto-migrate any existing students with old `course_id` field to new `enrollments` collection
4. Load all API endpoints including the new ones

## If You Still See 404 Errors After Restart
1. Check that backend is running on port 3000
2. Check that frontend proxy is configured correctly (it is)
3. Clear browser cache and reload
4. Check browser console for the exact URL being called

## Current Endpoints That Should Work
- `GET /api/profile` - Get user profile with enrollment info
- `GET /api/student/courses-list` - Get enrolled and available courses
- `GET /api/student/all-payments` - Get all payment records for student
- `POST /api/student/enroll-course` - Enroll in a new course
- `POST /api/student/make-payment` - Process payment via Razorpay

All these endpoints are in the code and will work once the server is restarted.
