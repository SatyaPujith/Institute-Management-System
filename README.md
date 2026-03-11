# 🎓 Forex Institute Management System

A modern, full-stack institute management system built for forex trading education. Manage students, courses, payments, and learning resources with ease.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)

## ✨ Features

### 👨‍💼 Admin Portal
- **Student Management** - Add, edit, and track student enrollments
- **Course Management** - Create and manage multiple courses
- **Batch Organization** - Group students into batches with trainers
- **Payment Tracking** - Monitor payment status and process transactions
- **Video Lessons** - Upload and organize course content
- **Events & Announcements** - Keep students informed
- **Study Resources** - Share documents and materials
- **Excel Import/Export** - Bulk operations for efficiency
- **Real-time Notifications** - Stay updated on student activities

### 👨‍🎓 Student Portal
- **Multi-Course Enrollment** - Enroll in multiple courses simultaneously
- **Self-Service Enrollment** - Browse and join available courses
- **Video Lessons** - Access course materials with progress tracking
- **Payment Gateway** - Secure payments via Razorpay (₹ INR)
- **Profile Management** - Update personal information and password
- **Event RSVP** - Register for upcoming events
- **Progress Tracking** - Monitor learning progress across courses
- **Study Resources** - Download course materials

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd institute-management-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, etc.
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start the application**
   
   Open two terminal windows:
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Default Credentials

**Admin:**
- Email: `admin@institute.com`
- Password: `admin123`

**Student (Demo):**
- Email: `john@example.com`
- Password: `student123`

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

**Backend:**
- Node.js with Express
- TypeScript
- MongoDB with native driver
- JWT authentication
- bcrypt for password hashing

**Payment:**
- Razorpay integration
- Support for INR currency

### Project Structure

```
institute-management-system/
├── frontend/                    # React Frontend
│   ├── src/                    # React components
│   │   ├── components/        # Reusable components
│   │   ├── context/          # React context (Auth)
│   │   ├── pages/            # Page components
│   │   │   ├── admin/       # Admin portal pages
│   │   │   └── student/     # Student portal pages
│   │   └── utils/           # Utility functions
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.ts       # Vite configuration
│   └── vercel.json          # Vercel deployment config
├── backend/                     # Node.js Backend
│   ├── server/              # Database connection & seeding
│   ├── server.ts            # Express server & API routes
│   └── package.json         # Backend dependencies
├── docs/                       # Documentation files
└── README.md                  # Project overview
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

### Getting Started
- [Quick Start Guide](docs/QUICK_START.md) - Get up and running quickly
- [Start Application](docs/START_APPLICATION.md) - Detailed startup instructions
- [Requirements Checklist](docs/REQUIREMENTS_CHECKLIST.md) - Feature implementation status

### User Guides
- [Complete User Guide](docs/COMPLETE_USER_GUIDE.md) - Full system walkthrough
- [Quick Reference](docs/QUICK_REFERENCE.md) - Common tasks and shortcuts

### Security & Configuration
- [Security Guide](docs/SECURITY.md) - **IMPORTANT: Read before deployment**
- [Separate Deployment Guide](docs/SEPARATE_DEPLOYMENT.md) - **Deploy frontend & backend separately**
- [Vercel + Render Deployment](docs/VERCEL_RENDER_DEPLOYMENT.md) - **Specific platform guide**
- [Environment Setup](docs/SECURITY.md#environment-variables) - Required environment variables
### Technical Documentation
### Technical Documentation
- [Multi-Course Enrollment](docs/MULTI_COURSE_ENROLLMENT.md) - Enrollment system architecture
- [Migration Guide](docs/MIGRATION_GUIDE.md) - Database migration details

### Troubleshooting
- [Backend Restart Guide](docs/RESTART_BACKEND.md) - Fix 404 errors
- [Lessons & Resources Fixed](docs/LESSONS_RESOURCES_FIXED.md) - Content visibility issues
- [Batch Filtering Fixed](docs/BATCH_FILTERING_FIXED.md) - Batch student filtering
- [Test Backend](docs/TEST_BACKEND.md) - Backend testing guide

### Implementation Details
- [Admin-Student Sync](docs/ADMIN_STUDENT_SYNC_FIX.md) - Real-time data synchronization
- [Profile & Payment](docs/PROFILE_PAYMENT_COMPLETE.md) - Profile and payment features
- [Modal Fixes](docs/MODAL_FIX_COMPLETE.md) - UI modal improvements
- [Forms Fixed](docs/FORMS_FIXED.md) - Form handling improvements

## 🔑 Key Features Explained

### Multi-Course Enrollment System
Students can enroll in multiple courses simultaneously. Each enrollment has:
- Independent payment status
- Separate progress tracking
- Course-specific lessons and resources
- Individual completion tracking

### Real-Time Data Synchronization
Changes made by admins reflect immediately in student portals:
- Course assignments
- Payment status updates
- Batch assignments
- Content additions

### Secure Authentication
- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (Admin/Student)
- Secure password change functionality

### Payment Integration
- Razorpay payment gateway
- Support for course and event payments
- Automatic status updates
- Indian Rupees (₹) currency

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
cd backend
npm run dev      # Start backend development server
npm start        # Start backend production server
npm run lint     # Check TypeScript errors
```

**Frontend:**
```bash
cd frontend
npm run dev      # Start frontend development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check TypeScript errors
```

### Database Seeding

The application automatically seeds sample data on first run:
- Default admin account
- 2 sample courses
- 2 batches
- 2 demo students
- Sample lessons, events, and resources

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**Students:**
- `GET /api/students` - List all students (admin)
- `POST /api/students` - Add student (admin)
- `PUT /api/students/:id` - Update student (admin)
- `DELETE /api/students/:id` - Delete student (admin)

**Courses:**
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (admin)
- `GET /api/student/courses-list` - Get enrolled & available courses (student)
- `POST /api/student/enroll-course` - Self-enroll in course (student)

**Payments:**
- `GET /api/payments` - List payments (admin)
- `GET /api/student/all-payments` - Get student payments (student)
- `POST /api/student/create-payment-order` - Create Razorpay order (student)
- `POST /api/student/verify-payment` - Verify payment (student)

**Lessons:**
- `GET /api/lessons` - Get lessons for enrolled courses
- `POST /api/lessons/:id/complete` - Mark lesson complete (student)

**Profile:**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/change-password` - Change password

[See full API documentation](docs/API_REFERENCE.md)

## 🔒 Security

- Environment variables for sensitive data
- JWT tokens with expiration
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Secure payment processing

## 🎨 UI/UX Features

- Modern, clean interface
- Responsive design (mobile, tablet, desktop)
- Dark overlay modals
- Real-time notifications
- Progress indicators
- Loading states
- Error handling
- Toast notifications

## 📊 Database Schema

### Collections

**users** - Student and admin accounts
- Authentication credentials
- Personal information
- Batch assignment
- Role (admin/student)

**enrollments** - Course enrollments
- Student-course relationships
- Payment status per course
- Enrollment dates
- Progress tracking

**courses** - Course catalog
- Course details
- Fees and duration
- Prerequisites
- Difficulty level

**batches** - Student groups
- Batch information
- Trainer assignment
- Schedule dates
- Course association

**lessons** - Video content
- Lesson details
- Course association
- Video URLs
- Deadlines

**payments** - Payment records
- Transaction details
- Payment status
- Razorpay integration
- Amount and dates

**events** - Upcoming events
- Event details
- RSVP tracking
- Meeting links
- Attendee lists

**announcements** - Broadcast messages
- Title and content
- Creation dates
- Visibility to all users

**resources** - Study materials
- File URLs
- Course association
- Descriptions

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for forex trading education**
