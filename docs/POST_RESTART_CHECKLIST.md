# Post-Restart Testing Checklist

After restarting the backend server, verify everything works:

## ✅ Backend Server Checks

### 1. Server Started Successfully
- [ ] See "✅ Connected to MongoDB"
- [ ] See "🚀 Server running on http://localhost:3000"
- [ ] No error messages in console

### 2. Migration Completed
- [ ] See "🔄 Checking for students to migrate..."
- [ ] See "✅ Migrated X students" (or 0 if none to migrate)

## ✅ Browser Console Checks

### 1. No 404 Errors
Open browser console (F12) and verify NO errors for:
- [ ] `/api/profile`
- [ ] `/api/student/courses-list`
- [ ] `/api/student/all-payments`

### 2. Successful API Calls
Should see 200 status codes for:
- [ ] GET /api/profile
- [ ] GET /api/student/courses-list
- [ ] GET /api/student/all-payments

## ✅ Student Portal Functionality

### Login
- [ ] Can login with john@example.com / student123
- [ ] Redirects to student dashboard
- [ ] No errors in console

### Profile Page
- [ ] Name shows: "John Doe" (not N/A)
- [ ] Email shows: "john@example.com" (not N/A)
- [ ] Phone shows: "+1234567890" (not N/A)
- [ ] City shows: "New York" (not N/A)
- [ ] Course shows: "Forex Trading Basics" (not null)
- [ ] Batch shows: "Batch A - Morning" (not null)
- [ ] Payment Status shows: "Paid" (not N/A)
- [ ] Can edit profile fields
- [ ] Can change password

### Courses Page
- [ ] "My Enrolled Courses" section shows courses
- [ ] Shows "Forex Trading Basics" as enrolled
- [ ] Shows payment status "Paid"
- [ ] Shows progress percentage
- [ ] "Available Courses" section shows other courses
- [ ] Shows "Advanced Price Action" as available
- [ ] "Enroll Now" button works
- [ ] Can enroll in new course

### Payment Page
- [ ] Shows enrolled courses
- [ ] Shows "Forex Trading Basics" with ₹299.99
- [ ] Shows payment status "Paid"
- [ ] Shows enrolled date
- [ ] "Pay Now" button appears for pending payments
- [ ] Razorpay integration works (if configured)

### Dashboard
- [ ] Shows welcome message with student name
- [ ] Shows upcoming events
- [ ] Shows announcements
- [ ] Shows progress stats

### Lessons Page
- [ ] Shows lessons for enrolled courses
- [ ] Can mark lessons as complete
- [ ] Progress updates

## ✅ Admin Portal Functionality

### Login
- [ ] Can login with admin@institute.com / admin123
- [ ] Redirects to admin dashboard

### Students Management
- [ ] Can view all students
- [ ] Can add new student
- [ ] Can assign course to student
- [ ] Can set payment status
- [ ] Can edit student details
- [ ] Can delete student

### Courses Management
- [ ] Can view all courses
- [ ] Can add new course
- [ ] Can edit course
- [ ] Can delete course

### Payments Management
- [ ] Can view all payments
- [ ] Can add payment for student
- [ ] Can update payment status
- [ ] Payment status updates reflect in student portal

## ✅ Data Synchronization

### Admin → Student Sync
Test that admin changes reflect in student portal:

1. Admin adds new student with course
   - [ ] Student can login
   - [ ] Course shows in student's profile
   - [ ] Course shows in student's courses page

2. Admin updates student's course
   - [ ] New course shows in student's profile
   - [ ] New course shows in student's courses page

3. Admin adds payment for student
   - [ ] Payment shows in student's payment page
   - [ ] Payment status updates in profile

4. Admin changes payment status to "Paid"
   - [ ] Status updates in student's payment page
   - [ ] Status updates in student's profile

## ✅ Multi-Course Enrollment

### Student Self-Enrollment
- [ ] Student can see available courses
- [ ] Student can click "Enroll Now"
- [ ] Enrollment creates successfully
- [ ] Course moves to "My Enrolled Courses"
- [ ] Payment status shows "Pending"
- [ ] Can make payment for new course

### Multiple Courses
- [ ] Student can enroll in multiple courses
- [ ] Each course has independent payment status
- [ ] Each course shows separate progress
- [ ] Lessons filtered by course

## 🎉 Success Criteria

All checkboxes above should be checked. If any fail:
1. Check backend console for errors
2. Check browser console for errors
3. Verify MongoDB connection
4. Clear browser cache and retry
5. Check .env file configuration

## Common Issues

### Profile Shows N/A
- Backend not restarted properly
- MongoDB connection issue
- Student has no enrollment data

### Courses Page Empty
- Backend endpoint not loaded
- Student has no enrollments
- No courses in database

### Payment Page Empty
- Backend endpoint not loaded
- Student has no enrollments
- No payment records

### 404 Errors Still Appear
- Backend not fully restarted
- Wrong port (should be 3000)
- Proxy not configured (should be in vite.config.ts)

---

## Quick Test Script

Run this in browser console after login:
```javascript
// Test all endpoints
fetch('/api/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
  .then(r => r.json())
  .then(d => console.log('Profile:', d));

fetch('/api/student/courses-list', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
  .then(r => r.json())
  .then(d => console.log('Courses:', d));

fetch('/api/student/all-payments', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }})
  .then(r => r.json())
  .then(d => console.log('Payments:', d));
```

All three should return data without errors.
