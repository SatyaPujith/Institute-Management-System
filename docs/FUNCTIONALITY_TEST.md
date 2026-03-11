# Functionality Test Guide

## ✅ Application Status

### Backend Server
- **URL**: http://localhost:3000
- **Status**: Running
- **MongoDB**: Connected
- **Sample Data**: Seeded

### Frontend Server
- **URL**: http://localhost:5173
- **Status**: Running
- **Proxy**: Configured to backend

---

## 🔐 Test Login

### 1. Admin Login
1. Go to http://localhost:5173
2. Enter credentials:
   - Email: `admin@institute.com`
   - Password: `admin123`
3. Click "Sign in"
4. Should redirect to `/admin` dashboard

### 2. Student Login
1. Go to http://localhost:5173
2. Enter credentials:
   - Email: `john@example.com`
   - Password: `student123`
3. Click "Sign in"
4. Should redirect to `/student` dashboard

---

## 📚 Test Admin Features

### 1. Add Course
1. Login as admin
2. Navigate to "Courses" from sidebar
3. Click "Add Course" button
4. Fill in the form:
   - Name: "Technical Analysis Mastery"
   - Duration: "6 Weeks"
   - Fees: 499.99
   - Description: "Learn advanced technical analysis"
   - Level: "Intermediate"
   - Prerequisites: "Forex Trading Basics"
5. Click "Save Course"
6. Course should appear in the list

### 2. Edit Course
1. Find a course in the list
2. Click the edit icon (pencil)
3. Modify any field
4. Click "Save Course"
5. Changes should be reflected

### 3. Delete Course
1. Find a course in the list
2. Click the delete icon (trash)
3. Confirm deletion
4. Course should be removed

### 4. Add Student
1. Navigate to "Students" from sidebar
2. Click "Add Student" button
3. Fill in the form:
   - Name: "Test Student"
   - Email: "test@example.com"
   - Password: "test123"
   - Phone: "+1234567890"
   - City: "Test City"
   - Course: Select a course
   - Batch: Select a batch
   - Enrollment Date: Today's date
   - Payment Status: "Pending"
4. Click "Save Student"
5. Student should appear in the list

### 5. Import Students (Excel)
1. Navigate to "Students"
2. Click "Import" button
3. Select an Excel file with columns:
   - name, email, password, phone, city, course_id, batch_id, joining_date, payment_status
4. Students should be imported
5. Check the list for new students

### 6. Export Students (Excel)
1. Navigate to "Students"
2. Click "Export" button
3. Excel file should download
4. Open file to verify data

### 7. Add Batch
1. Navigate to "Batches" from sidebar
2. Click "Add Batch" button
3. Fill in the form:
   - Name: "Batch C - Weekend"
   - Trainer Name: "John Trainer"
   - Course: Select a course
   - Start Date: Future date
   - End Date: Future date (after start)
4. Click "Save Batch"
5. Batch should appear in the list

### 8. Add Lesson
1. Navigate to "Lessons" from sidebar
2. Click "Add Lesson" button
3. Fill in the form:
   - Title: "Risk Management Basics"
   - Video URL: "https://www.youtube.com/watch?v=example"
   - Course: Select a course
   - Description: "Learn how to manage risk"
   - Duration: "25:00"
   - Deadline: Optional date
4. Click "Save Lesson"
5. Lesson should appear in the list

### 9. Add Event
1. Navigate to "Events" from sidebar
2. Click "Add Event" button
3. Fill in the form:
   - Title: "Monthly Trading Review"
   - Description: "Review of this month's trades"
   - Date: Future date
   - Time: "19:00"
   - Meeting Link: "https://zoom.us/j/example"
   - Location: "Online (Zoom)"
4. Click "Save Event"
5. Event should appear in the list

### 10. Add Payment
1. Navigate to "Payments" from sidebar
2. Click "Add Payment" button
3. Fill in the form:
   - Student: Select a student
   - Course: Select a course
   - Amount: 299.99
   - Status: "Paid"
   - Date: Today's date
4. Click "Save Payment"
5. Payment should appear in the list

### 11. Add Announcement
1. Navigate to "Announcements" from sidebar
2. Click "Add Announcement" button
3. Fill in the form:
   - Title: "New Course Launch"
   - Content: "We're launching a new advanced course next month!"
4. Click "Save Announcement"
5. Announcement should appear in the list

### 12. Add Resource
1. Navigate to "Resources" from sidebar
2. Click "Add Resource" button
3. Fill in the form:
   - Title: "Trading Psychology Guide"
   - File URL: "https://example.com/psychology.pdf"
   - Description: "Essential guide to trading psychology"
   - Course: Select a course
4. Click "Save Resource"
5. Resource should appear in the list

---

## 👨‍🎓 Test Student Features

### 1. View Dashboard
1. Login as student (john@example.com / student123)
2. Should see:
   - Enrolled course information
   - Progress percentage
   - Upcoming events
   - Quick stats

### 2. View Courses
1. Navigate to "Courses" from sidebar
2. Should see enrolled course details
3. Course information should be displayed

### 3. View and Complete Lessons
1. Navigate to "Lessons" from sidebar
2. Should see lessons for enrolled course
3. Click on a lesson to view details
4. Click "Mark as Complete" checkbox
5. Progress should update
6. Refresh page - completion should persist

### 4. RSVP to Event
1. Navigate to "Events" from sidebar
2. Find an upcoming event
3. Click "RSVP" button
4. Button should change to "Cancel RSVP"
5. RSVP count should increase

### 5. Cancel RSVP
1. Find an event you've RSVP'd to
2. Click "Cancel RSVP" button
3. Button should change back to "RSVP"
4. RSVP count should decrease

### 6. View Announcements
1. Navigate to "Announcements" from sidebar
2. Should see all announcements
3. Announcements sorted by date (newest first)

### 7. View Resources
1. Navigate to "Resources" from sidebar
2. Should see resources for enrolled course
3. Click on file URL to download/view

---

## 🔍 Test Data Relationships

### 1. Course-Batch Relationship
1. Create a course
2. Create a batch for that course
3. Verify batch shows correct course name
4. Delete course - batch should handle gracefully

### 2. Student-Course-Batch Relationship
1. Create/select a course
2. Create/select a batch for that course
3. Add student with that course and batch
4. Verify student shows correct course and batch names

### 3. Lesson-Course Relationship
1. Create a lesson for a specific course
2. Login as student enrolled in that course
3. Verify student can see the lesson
4. Login as student NOT enrolled in that course
5. Verify student cannot see the lesson

### 4. Resource-Course Relationship
1. Create a resource for a specific course
2. Login as student enrolled in that course
3. Verify student can see the resource
4. Login as student NOT enrolled in that course
5. Verify student cannot see the resource

### 5. Payment-Student Relationship
1. Create a payment for a student
2. Set status to "Paid"
3. Verify student's payment status updates to "Paid"
4. Check in Students list

---

## 🔒 Test Security

### 1. Unauthorized Access
1. Logout
2. Try to access `/admin` directly
3. Should redirect to `/login`

### 2. Role-Based Access
1. Login as student
2. Try to access `/admin` directly
3. Should redirect or show error

### 3. API Authorization
1. Open browser console
2. Try to call API without token
3. Should return 401 Unauthorized

---

## 📊 Test Progress Tracking

### 1. Student Progress
1. Login as admin
2. Go to Students page
3. Note a student's progress percentage
4. Login as that student
5. Complete a lesson
6. Logout and login as admin
7. Verify progress percentage increased

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution**: Ensure both backend (port 3000) and frontend (port 5173) are running

### Issue: "401 Unauthorized"
**Solution**: Logout and login again to refresh token

### Issue: "Course/Batch not showing in dropdown"
**Solution**: Create courses/batches first before assigning to students

### Issue: "Student can't see lessons"
**Solution**: Ensure student is enrolled in a course and lessons exist for that course

### Issue: "Excel import fails"
**Solution**: Check Excel file format matches the template (name, email columns required)

### Issue: "Progress not updating"
**Solution**: Refresh the page or logout/login again

---

## ✅ Expected Results

All of the above operations should work without errors. If you encounter any issues:

1. Check browser console for errors (F12)
2. Check backend terminal for server errors
3. Verify MongoDB connection is active
4. Ensure both servers are running
5. Clear browser cache and try again

---

## 🎯 Success Criteria

- ✅ Admin can create, edit, delete all entities
- ✅ Students can view their enrolled content
- ✅ Students can complete lessons and track progress
- ✅ Students can RSVP to events
- ✅ Excel import/export works
- ✅ All relationships work correctly
- ✅ Authentication and authorization work
- ✅ Data persists after page refresh
- ✅ No console errors
- ✅ UI is responsive and functional

---

## 📝 Notes

- All data is stored in MongoDB Atlas
- Sample data is automatically seeded on first run
- Default admin password should be changed in production
- JWT tokens expire after 24 hours
- Excel import uses default password "password123" if not provided
