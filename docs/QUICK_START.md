# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
The `.env` file is already configured with your MongoDB connection:
```env
MONGODB_URI=mongodb+srv://satyapujith:Satya@9100@cluster0.qtr33fw.mongodb.net/institute_management
JWT_SECRET=super-secret-jwt-key-for-dev-change-in-production
NODE_ENV=development
```

### Step 3: Start the Application
```bash
npm run dev
```

The application will start at: **http://localhost:3000**

---

## 🔐 Login Credentials

### Admin Account
- **Email**: `admin@institute.com`
- **Password**: `admin123`

### Sample Student Accounts
- **Email**: `john@example.com` | **Password**: `student123`
- **Email**: `jane@example.com` | **Password**: `student123`

---

## 📋 What's Changed?

### ✅ Completed
1. **Removed Public Registration** - Students can only be added by admin
2. **MongoDB Integration** - Replaced SQLite with MongoDB Atlas
3. **Excel Import/Export** - Bulk import students and export lists
4. **Admin-Controlled Access** - Only admins can create student accounts
5. **All Features Working** - Authentication, courses, lessons, events, payments, etc.

### 🎯 Key Features

#### For Admins
- Add students manually or via Excel import
- Export student lists to Excel
- Manage courses, batches, lessons, events
- Track payments and student progress
- Post announcements and upload resources

#### For Students
- View enrolled courses and progress
- Watch video lessons and mark complete
- RSVP to events and webinars
- Read announcements
- Download study resources

---

## 📊 Excel Import Format

When importing students, your Excel file should have these columns:

| Column | Required | Example |
|--------|----------|---------|
| name | Yes | John Doe |
| email | Yes | john@example.com |
| password | No | student123 |
| phone | No | +1234567890 |
| city | No | New York |
| course_id | No | (MongoDB ObjectId) |
| batch_id | No | (MongoDB ObjectId) |
| joining_date | No | 2026-03-01 |
| payment_status | No | Paid or Pending |

**Note**: If password is not provided, it defaults to "password123"

---

## 🗄️ Database Structure

The application uses MongoDB with these collections:
- `users` - Admin and student accounts
- `courses` - Course catalog
- `batches` - Training batches
- `lessons` - Video lessons
- `events` - Events and webinars
- `payments` - Payment records
- `announcements` - System announcements
- `resources` - Study materials
- `event_rsvps` - Event registrations
- `lesson_completions` - Progress tracking
- `notifications` - Admin notifications

---

## 🔧 Common Tasks

### Add a New Student (Admin)
1. Login as admin
2. Go to "Students" page
3. Click "Add Student" button
4. Fill in the form and save

### Import Multiple Students (Admin)
1. Login as admin
2. Go to "Students" page
3. Click "Import" button
4. Select your Excel file
5. Students will be imported automatically

### Export Student List (Admin)
1. Login as admin
2. Go to "Students" page
3. Click "Export" button
4. Excel file will download

### Student Login
1. Students receive credentials from admin
2. Go to login page
3. Enter email and password
4. Access student dashboard

---

## 🛠️ Troubleshooting

### Cannot Connect to MongoDB
- Check your internet connection
- Verify MongoDB URI in `.env` file
- Ensure MongoDB Atlas cluster is running

### Login Not Working
- Verify credentials are correct
- Check browser console for errors
- Ensure server is running on port 3000

### Excel Import Fails
- Check Excel file format matches template
- Ensure email addresses are unique
- Verify all required columns are present

---

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Migration Details**: See `MIGRATION_SUMMARY.md`
- **API Endpoints**: See `README.md` API section

---

## 🎉 You're All Set!

The application is now ready to use. Login as admin to start managing your institute!

**Need Help?** Check the documentation files or contact support.
