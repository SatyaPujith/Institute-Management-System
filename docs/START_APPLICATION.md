# How to Start the Application

## Prerequisites
- Node.js installed
- MongoDB Atlas connection configured in `.env`
- Razorpay account (optional for testing, required for production)

## Quick Start

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Configure Environment Variables
Update `.env` file with your credentials:
```
MONGODB_URI=mongodb+srv://satyapujith:Satya%409100@cluster0.qtr33fw.mongodb.net/institute_management?retryWrites=true&w=majority&appName=InstituteManagement
JWT_SECRET=super-secret-jwt-key-for-dev-change-in-production
NODE_ENV=development

# Razorpay Configuration (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### 3. Start Backend Server (Terminal 1)
```bash
npm run backend
```
Backend will run on: http://localhost:3000

### 4. Start Frontend Server (Terminal 2)
```bash
npm run frontend
```
Frontend will run on: http://localhost:5173

### 5. Access the Application
Open your browser and go to: http://localhost:5173

## Default Login Credentials

### Admin Account
- Email: admin@institute.com
- Password: admin123

### Student Account
- Email: student@institute.com
- Password: student123

## Features Available

### Admin Portal
- Dashboard with statistics
- Student Management (Add/Edit/Delete/Import/Export Excel)
- Course Management (₹ currency)
- Video Lessons Management
- Batch Management
- Event Management
- Payment Tracking (₹ currency)
- Announcements
- Study Resources
- Profile Management

### Student Portal
- Dashboard with progress tracking
- View Courses (₹ currency)
- Watch Video Lessons
- View Events and RSVP
- View Announcements
- Access Study Resources
- Payment Gateway (Razorpay with ₹)
- Profile Management

## Payment Testing

### Test Mode (Default)
The application is configured for test mode. You can test the payment flow without real transactions.

### Production Mode
1. Get Razorpay API keys from https://dashboard.razorpay.com/
2. Update `.env` with production keys
3. Update payment verification logic in `server.ts`

## Troubleshooting

### Backend not starting
- Check MongoDB connection string in `.env`
- Ensure port 3000 is not in use

### Frontend not starting
- Ensure port 5173 is not in use
- Check if backend is running first

### Payment not working
- Ensure Razorpay script is loaded (check browser console)
- Verify Razorpay keys in `.env`
- Check student is enrolled in a course

## Development Commands

```bash
# Start backend only
npm run backend

# Start frontend only
npm run frontend

# Build for production
npm run build

# Run linter
npm run lint
```

## Notes
- Frontend uses Vite proxy to forward `/api` requests to backend
- All currency is displayed in Indian Rupees (₹)
- Payment status automatically updates after successful payment
- Excel import/export works for students, courses, and payments
