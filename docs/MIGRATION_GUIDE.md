# Data Migration Guide - Enrollments System

## Issue Fixed

The system was updated to use an `enrollments` collection instead of storing `course_id` directly in the `users` collection. This caused:
- ❌ Courses not showing in student portal
- ❌ Payments not reflecting
- ❌ Profile showing N/A for all fields

## Solution Implemented

### Backend Changes:

1. **POST /api/students** - Now creates enrollment when course is assigned
2. **PUT /api/students/:id** - Creates/updates enrollment when course is changed
3. **POST /api/payments** - Creates/updates enrollment when payment is added
4. **PUT /api/payments/:id** - Updates enrollment status when payment status changes
5. **GET /api/students** - Reads from enrollments for course info
6. **GET /api/profile** - Reads from enrollments for student profile

### How It Works Now:

#### When Admin Adds Student:
```
1. Admin fills student form with course
   ↓
2. POST /api/students creates user
   ↓
3. Automatically creates enrollment record:
   {
     student_id: <student_id>,
     course_id: <course_id>,
     payment_status: 'Pending',
     enrolled_date: <joining_date>
   }
   ↓
4. Student can now see course in portal
```

#### When Admin Updates Student:
```
1. Admin changes student's course
   ↓
2. PUT /api/students/:id updates user
   ↓
3. Creates/updates enrollment record
   ↓
4. Student sees updated course
```

#### When Admin Adds Payment:
```
1. Admin adds payment for student+course
   ↓
2. POST /api/payments creates payment record
   ↓
3. Creates/updates enrollment with payment status
   ↓
4. Student sees payment status updated
```

#### When Admin Updates Payment Status:
```
1. Admin changes payment status to "Paid"
   ↓
2. PUT /api/payments/:id updates payment
   ↓
3. Updates enrollment payment_status
   ↓
4. Student sees "Paid" status
```

---

## For Existing Data

If you have existing students with `course_id` in the users collection, you need to migrate them.

### Option 1: Manual Migration (Recommended)

For each existing student:
1. Go to Admin → Students
2. Click Edit on the student
3. Re-select their course
4. Click Save

This will automatically create the enrollment record.

### Option 2: Database Script (Advanced)

Run this in MongoDB:

```javascript
// Connect to your database
use institute_management;

// Get all students with course_id
db.users.find({ role: 'student', course_id: { $exists: true, $ne: null } }).forEach(function(student) {
  // Check if enrollment already exists
  var existingEnrollment = db.enrollments.findOne({
    student_id: student._id,
    course_id: student.course_id
  });
  
  if (!existingEnrollment) {
    // Create enrollment
    db.enrollments.insertOne({
      student_id: student._id,
      course_id: student.course_id,
      payment_status: student.payment_status || 'Pending',
      enrolled_date: student.joining_date || new Date().toISOString().split('T')[0],
      createdAt: new Date()
    });
    
    print('Created enrollment for student: ' + student.name);
  }
});

print('Migration complete!');
```

### Option 3: Fresh Start

If you're in development/testing:
1. Delete all students
2. Re-add them through the admin portal
3. System will create enrollments automatically

---

## Testing After Fix

### Test 1: Add New Student
1. Go to Admin → Students
2. Click "Add Student"
3. Fill form and select a course
4. Click Save
5. ✅ Student should see course in "My Enrolled Courses"
6. ✅ Student should see payment in "Payment" page
7. ✅ Profile should show correct data

### Test 2: Update Existing Student
1. Go to Admin → Students
2. Click Edit on any student
3. Change their course
4. Click Save
5. ✅ Student should see new course
6. ✅ Old course should move to "Available Courses"

### Test 3: Add Payment
1. Go to Admin → Payments
2. Click "Add Payment"
3. Select Student and Course
4. Set Status to "Paid"
5. Click Save
6. ✅ Student should see "Paid" status in courses
7. ✅ Payment should show in student's payment page

### Test 4: Update Payment Status
1. Go to Admin → Payments
2. Click Edit on pending payment
3. Change status to "Paid"
4. Click Save
5. ✅ Student should see updated status

### Test 5: Profile Data
1. Student logs in
2. Goes to Profile
3. ✅ Should see: Name, Email, Phone, City
4. ✅ Should see: Course name (if enrolled)
5. ✅ Should see: Batch name (if assigned)
6. ✅ Should see: Payment status
7. ✅ Should see: Joining date

---

## What Changed in Database

### Before:
```javascript
// users collection
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  role: "student",
  course_id: ObjectId("..."),  // ❌ Stored here
  payment_status: "Paid"        // ❌ Stored here
}
```

### After:
```javascript
// users collection
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  role: "student",
  phone: "+1234567890",
  city: "New York",
  batch_id: ObjectId("..."),
  joining_date: "2026-03-15"
  // No course_id or payment_status
}

// enrollments collection (NEW)
{
  _id: ObjectId("..."),
  student_id: ObjectId("..."),
  course_id: ObjectId("..."),    // ✅ Moved here
  payment_status: "Paid",         // ✅ Moved here
  enrolled_date: "2026-03-15",
  payment_date: "2026-03-16",
  createdAt: Date
}
```

---

## Benefits of New Structure

1. **Multiple Courses** - Students can enroll in multiple courses
2. **Independent Payments** - Each course has its own payment status
3. **Better Tracking** - Separate enrollment and payment dates
4. **Scalability** - Easy to add features like certificates, refunds
5. **Clean Separation** - User data separate from enrollment data

---

## Backward Compatibility

The system maintains backward compatibility:
- Admin portal still works the same way
- Students added through admin automatically get enrollments
- Payments added through admin automatically create/update enrollments
- Profile shows data from enrollments
- Courses page reads from enrollments

---

## Summary

✅ **Fixed:** Admin-added students now show courses in student portal
✅ **Fixed:** Admin-added payments now reflect in student portal
✅ **Fixed:** Profile shows correct data from admin
✅ **Fixed:** All data is real-time from MongoDB
✅ **Added:** Support for multiple course enrollments
✅ **Added:** Independent payment tracking per course

The system now works seamlessly between admin and student portals!
