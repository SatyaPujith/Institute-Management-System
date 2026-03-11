# Complete User Guide - Institute Management System

## 🚀 Getting Started

### Start the Application
1. **Terminal 1 - Backend:**
   ```bash
   npm run backend
   ```
   Backend runs on: http://localhost:3000

2. **Terminal 2 - Frontend:**
   ```bash
   npm run frontend
   ```
   Frontend runs on: http://localhost:5173

3. **Access:** Open http://localhost:5173 in your browser

### Default Login Credentials
- **Admin:** admin@institute.com / admin123
- **Student:** student@institute.com / student123

---

## 👨‍💼 Admin User Guide

### Dashboard
- View total students, courses, batches, events, and pending payments
- All statistics are real-time from MongoDB
- Click on any card to navigate to that section

### Student Management
1. **Add Student:**
   - Click "Add Student" button
   - Fill in: Name, Email, Password, Phone, City
   - Assign Course and Batch (optional)
   - Set Joining Date and Payment Status
   - Student can login with provided email/password

2. **Edit Student:**
   - Click edit icon on any student
   - Update details as needed
   - Changes save to MongoDB immediately

3. **Delete Student:**
   - Click delete icon
   - Confirm deletion

4. **Import Students (Excel):**
   - Click "Import" button
   - Select Excel file with columns: name, email, password, phone, city, course_id, batch_id, joining_date, payment_status
   - Students are created in bulk

5. **Export Students (Excel):**
   - Click "Export" button
   - Downloads current student list as Excel file

### Course Management
1. **Add Course:**
   - Click "Add Course"
   - Enter: Name, Duration, Fees (₹), Level, Prerequisites, Description
   - Course is available immediately

2. **Edit/Delete Course:**
   - Use edit/delete icons on course cards
   - Changes reflect immediately

3. **Import/Export:**
   - Same as student management

### Video Lessons
1. **Add Lesson:**
   - Click "Add Lesson"
   - Enter: Title, Video URL (YouTube/hosted), Course, Description, Duration
   - Optional: Set deadline
   - Lesson appears for students enrolled in that course

2. **Manage Lessons:**
   - Edit or delete existing lessons
   - Lessons are course-specific

### Batch Management
1. **Create Batch:**
   - Click "Add Batch"
   - Enter: Name, Trainer Name, Course, Start Date, End Date
   - Batch is ready for student assignment

2. **Assign Students:**
   - Go to Student Management
   - Edit student and select batch

### Event Management
1. **Create Event:**
   - Click "Add Event"
   - Enter: Title, Description, Date, Time, Meeting Link, Location
   - Event appears for all students

2. **View Attendees:**
   - Click on event to see RSVP list
   - Track student participation

### Payment Management
1. **Add Payment Record:**
   - Click "Add Payment"
   - Select Student and Course
   - Enter Amount (₹) and Date
   - Set Status (Paid/Pending)
   - Student's payment status updates automatically

2. **Update Payment Status:**
   - Click edit on payment
   - Change status to Paid/Pending
   - Student record updates automatically

3. **Filter Payments:**
   - Use dropdown to filter by status
   - Export filtered data

### Announcements
1. **Create Announcement:**
   - Click "Add Announcement"
   - Enter Title and Content
   - Announcement appears for all students immediately

2. **Delete Announcement:**
   - Click delete icon on announcement

### Study Resources
1. **Upload Resource:**
   - Click "Add Resource"
   - Enter: Title, File URL, Description, Course
   - Resource available to students in that course

2. **Manage Resources:**
   - Edit or delete resources
   - Resources are course-specific

### Profile Management
1. **View Profile:**
   - Click "Profile" at bottom of sidebar
   - View your information

2. **Edit Profile:**
   - Click "Edit Profile"
   - Update Name, Phone, City
   - Click "Save"

3. **Change Password:**
   - Click "Change Password"
   - Enter current password
   - Enter new password (min 6 characters)
   - Confirm new password
   - Click "Update Password"

---

## 👨‍🎓 Student User Guide

### Dashboard
- View your course progress percentage
- See total lessons, events, and announcements
- Track completed vs total lessons
- Click cards to navigate to sections

### My Courses
- View all available courses
- See course details: Duration, Fees (₹), Level, Description
- Your enrolled course is highlighted

### Video Lessons
1. **Watch Lessons:**
   - Click on any lesson to watch
   - Video opens in player
   - Only see lessons from your enrolled course

2. **Track Progress:**
   - Click "Mark as Complete" after watching
   - Progress updates on dashboard
   - Completed lessons show checkmark

### Events
1. **View Events:**
   - See all upcoming events
   - View date, time, and meeting link

2. **RSVP:**
   - Click "RSVP" to register for event
   - Click "Cancel RSVP" to unregister
   - See RSVP count

3. **Join Event:**
   - Click meeting link to join Zoom/Google Meet

### Announcements
- View all announcements from admin
- Stay updated on new courses, webinars, updates

### Study Resources
- View resources for your enrolled course
- Download PDF notes and strategy documents
- Click file URL to access resource

### Payment
1. **View Payment Status:**
   - See your course and fees (₹)
   - Check payment status (Paid/Pending)

2. **Make Payment:**
   - If status is Pending, click "Pay Now"
   - Razorpay payment gateway opens
   - Choose payment method:
     - Credit/Debit Card
     - UPI
     - Net Banking
   - Complete payment
   - Status automatically updates to "Paid"

3. **After Payment:**
   - Full access to all course materials
   - Payment record created automatically

### Profile Management
1. **View Profile:**
   - Click "Profile" at bottom of sidebar
   - View your information, course, batch, payment status

2. **Edit Profile:**
   - Click "Edit Profile"
   - Update Name, Phone, City
   - Email cannot be changed
   - Click "Save"

3. **Change Password:**
   - Click "Change Password"
   - Enter current password (set by admin initially)
   - Enter new password (min 6 characters)
   - Confirm new password
   - Click "Update Password"
   - Use new password for next login

---

## 💡 Key Features

### Real-time Updates
- All data from MongoDB (no mock data)
- Changes reflect immediately
- Dashboard statistics update in real-time
- Payment status syncs automatically

### User Flow
1. **Admin adds student** with email and password
2. **Student logs in** with provided credentials
3. **Student views enrolled course** and fees
4. **Student makes payment** through Razorpay gateway
5. **Payment status updates** to "Paid" automatically
6. **Student accesses lessons** and resources
7. **Student tracks progress** on dashboard
8. **Student participates** in events
9. **Student can change password** in profile

### Excel Operations
- Import students in bulk
- Export student lists
- Import/export courses and payments
- Standard Excel format (.xlsx, .xls)

### Currency
- All amounts in Indian Rupees (₹)
- Razorpay integration for INR payments
- Proper currency formatting throughout

### Security
- Passwords encrypted with bcrypt
- JWT token authentication
- Role-based access control
- Secure password change process

---

## 🔧 Troubleshooting

### Cannot Login
- Check email and password
- Passwords are case-sensitive
- Contact admin if student account

### Payment Not Working
- Ensure you're enrolled in a course
- Check Razorpay keys in .env
- Try different payment method
- Contact admin if issue persists

### Lessons Not Showing
- Ensure you're enrolled in a course
- Lessons are course-specific
- Contact admin to assign course

### Profile Update Failed
- Check all required fields
- Ensure valid phone number
- Try again or contact admin

### Password Change Failed
- Verify current password is correct
- New password must be 6+ characters
- Ensure passwords match
- Try again or contact admin

---

## 📞 Support

For technical issues or questions:
- Contact: support@forexinstitute.com
- Admin can help with account issues
- Check documentation for common solutions

---

## 🎯 Best Practices

### For Admins:
- Add students with strong passwords
- Assign courses and batches promptly
- Keep payment records updated
- Create regular announcements
- Upload quality resources
- Monitor student progress

### For Students:
- Change default password immediately
- Complete lessons in order
- Track your progress regularly
- RSVP for events early
- Download resources for offline study
- Keep profile information updated
- Make payments on time

---

## ✅ System Status

All features are implemented and working:
- ✅ User Authentication
- ✅ Admin Dashboard
- ✅ Student Management
- ✅ Course Management
- ✅ Video Lessons
- ✅ Batch Management
- ✅ Event Management
- ✅ Payment Gateway
- ✅ Announcements
- ✅ Study Resources
- ✅ Profile Management
- ✅ Password Change
- ✅ Excel Import/Export
- ✅ Real-time Data
- ✅ Progress Tracking

The system is production-ready!
