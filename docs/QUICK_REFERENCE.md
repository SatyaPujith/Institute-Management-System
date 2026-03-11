# Quick Reference Guide

## 🚀 Application URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend (UI)** | http://localhost:5173 | ✅ Running |
| **Backend (API)** | http://localhost:3000 | ✅ Running |
| **MongoDB** | Atlas Cloud | ✅ Connected |

---

## 🔐 Login Credentials

### Admin Account
```
Email: admin@institute.com
Password: admin123
```

### Sample Students
```
Email: john@example.com
Password: student123

Email: jane@example.com
Password: student123
```

---

## 📋 Quick Actions

### Add a Course
1. Login as admin
2. Sidebar → Courses
3. Click "Add Course"
4. Fill form and save

### Add a Student
1. Login as admin
2. Sidebar → Students
3. Click "Add Student"
4. Fill form and save

### Import Students (Excel)
1. Login as admin
2. Sidebar → Students
3. Click "Import"
4. Select Excel file

**Excel Format:**
| name | email | password | phone | city | course_id | batch_id | joining_date | payment_status |
|------|-------|----------|-------|------|-----------|----------|--------------|----------------|
| Required | Required | Optional | Optional | Optional | Optional | Optional | Optional | Optional |

### Export Students
1. Login as admin
2. Sidebar → Students
3. Click "Export"

### Add a Lesson
1. Login as admin
2. Sidebar → Lessons
3. Click "Add Lesson"
4. Fill form and save

### Add an Event
1. Login as admin
2. Sidebar → Events
3. Click "Add Event"
4. Fill form and save

### Student: Complete a Lesson
1. Login as student
2. Sidebar → Lessons
3. Check "Mark as Complete"

### Student: RSVP to Event
1. Login as student
2. Sidebar → Events
3. Click "RSVP" button

---

## 🗂️ Admin Menu

- **Dashboard** - Overview statistics
- **Students** - Manage students (Add/Edit/Delete/Import/Export)
- **Courses** - Manage courses
- **Batches** - Manage training batches
- **Lessons** - Manage video lessons
- **Events** - Manage events and webinars
- **Payments** - Track payments
- **Announcements** - Post announcements
- **Resources** - Upload study materials

---

## 👨‍🎓 Student Menu

- **Dashboard** - Personal overview
- **Courses** - View enrolled course
- **Lessons** - Watch and complete lessons
- **Events** - View and RSVP to events
- **Announcements** - Read announcements
- **Resources** - Download study materials

---

## 🔧 Server Management

### Check Server Status
Both servers are running in the background.

### View Backend Logs
Terminal ID: 12
```bash
# Backend is running on port 3000
```

### View Frontend Logs
Terminal ID: 13
```bash
# Frontend is running on port 5173
```

### Stop Servers
Servers will stop when you close the IDE or manually stop them.

---

## 📊 Database Collections

| Collection | Purpose |
|------------|---------|
| users | Admin and student accounts |
| courses | Course catalog |
| batches | Training batches |
| lessons | Video lessons |
| events | Events and webinars |
| event_rsvps | Event registrations |
| payments | Payment records |
| announcements | System announcements |
| resources | Study materials |
| lesson_completions | Progress tracking |
| notifications | Admin notifications |

---

## ✅ Features Working

### Admin Features
- ✅ Add/Edit/Delete Students
- ✅ Import Students (Excel)
- ✅ Export Students (Excel)
- ✅ Add/Edit/Delete Courses
- ✅ Add/Edit/Delete Batches
- ✅ Add/Edit/Delete Lessons
- ✅ Add/Edit/Delete Events
- ✅ Add/Edit Payments
- ✅ Add/Delete Announcements
- ✅ Add/Delete Resources
- ✅ View Dashboard Statistics
- ✅ Track Student Progress

### Student Features
- ✅ View Dashboard
- ✅ View Enrolled Course
- ✅ Watch Video Lessons
- ✅ Mark Lessons Complete
- ✅ Track Progress
- ✅ RSVP to Events
- ✅ Cancel RSVP
- ✅ View Announcements
- ✅ Download Resources

### System Features
- ✅ JWT Authentication
- ✅ Role-Based Access Control
- ✅ MongoDB Integration
- ✅ Password Hashing
- ✅ Data Persistence
- ✅ Progress Tracking
- ✅ Excel Import/Export
- ✅ Responsive UI

---

## 🐛 Troubleshooting

### Can't see UI
- Make sure you're accessing http://localhost:5173 (not 3000)
- Check if frontend server is running

### API Errors
- Check if backend server is running on port 3000
- Verify MongoDB connection

### Login Issues
- Use correct credentials
- Clear browser cache
- Check browser console for errors

### Data Not Showing
- Refresh the page
- Logout and login again
- Check if you're logged in with correct role

---

## 📚 Documentation Files

- `README.md` - Complete documentation
- `QUICK_START.md` - Quick start guide
- `FUNCTIONALITY_TEST.md` - Detailed testing guide
- `MIGRATION_SUMMARY.md` - Migration details
- `VERIFICATION_CHECKLIST.md` - Verification checklist
- `QUICK_REFERENCE.md` - This file

---

## 🎯 Everything is Working!

All features are implemented and functional:
- ✅ No public registration (admin-only student management)
- ✅ MongoDB database integration
- ✅ Excel import/export for students
- ✅ Complete admin panel
- ✅ Complete student portal
- ✅ Authentication and authorization
- ✅ Progress tracking
- ✅ Event management
- ✅ Payment tracking

**Start using the application at:** http://localhost:5173
