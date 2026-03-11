import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB, getDB, ObjectId } from './server/db.js';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

async function startServer() {
  await connectDB();
  const db = getDB();

  const app = express();

  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL!,
          /https:\/\/.*\.vercel\.app$/  // Allow all Vercel preview deployments
        ].filter(Boolean)
      : ['http://localhost:5173'],
    credentials: true
  }));
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // --- Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
  };

  // --- Auth Routes ---
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });
    if (!user) return res.sendStatus(404);
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  });

  // --- Admin Dashboard Stats ---
  app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    const students = await db.collection('users').countDocuments({ role: 'student' });
    const courses = await db.collection('courses').countDocuments();
    const batches = await db.collection('batches').countDocuments();
    const events = await db.collection('events').countDocuments({ date: { $gte: new Date().toISOString().split('T')[0] } });
    const pendingPayments = await db.collection('payments').countDocuments({ status: 'Pending' });
    
    res.json({ students, courses, batches, events, pendingPayments });
  });

  // --- Students Management ---
  app.get('/api/students', authenticateToken, requireAdmin, async (req, res) => {
    const students = await db.collection('users').find({ role: 'student' }).toArray();
    
    for (const student of students) {
      // Get enrollments
      const enrollments = await db.collection('enrollments').find({ student_id: student._id }).toArray();
      
      // Get first enrollment for backward compatibility
      const firstEnrollment = enrollments[0];
      if (firstEnrollment) {
        student.course_id = firstEnrollment.course_id;
        student.payment_status = firstEnrollment.payment_status;
        
        // Calculate progress
        const totalLessons = await db.collection('lessons').countDocuments({ course_id: firstEnrollment.course_id });
        const completedLessons = await db.collection('lesson_completions').countDocuments({ 
          student_id: student._id
        });
        student.progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      } else {
        student.course_id = null;
        student.payment_status = 'Pending';
        student.progress = 0;
      }
      
      student.id = student._id;
    }
    
    res.json(students);
  });

  app.post('/api/students', authenticateToken, requireAdmin, async (req, res) => {
    const { name, email, password, phone, city, course_id, batch_id, joining_date, payment_status } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password || 'password123', 10);
      const result = await db.collection('users').insertOne({
        name,
        email,
        password: hashedPassword,
        role: 'student',
        phone: phone || null,
        city: city || null,
        batch_id: batch_id ? new ObjectId(batch_id) : null,
        joining_date: joining_date || null,
        createdAt: new Date()
      });
      
      // Create enrollment if course is assigned
      if (course_id) {
        await db.collection('enrollments').insertOne({
          student_id: result.insertedId,
          course_id: new ObjectId(course_id),
          payment_status: payment_status || 'Pending',
          enrolled_date: joining_date || new Date().toISOString().split('T')[0],
          createdAt: new Date()
        });
      }
      
      res.json({ id: result.insertedId });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  app.post('/api/students/bulk', authenticateToken, requireAdmin, async (req, res) => {
    const students = req.body.students;
    try {
      const studentsToInsert = students.map((s: any) => ({
        name: s.name,
        email: s.email,
        password: bcrypt.hashSync(s.password || 'password123', 10),
        role: 'student',
        phone: s.phone || null,
        city: s.city || null,
        course_id: s.course_id ? new ObjectId(s.course_id) : null,
        batch_id: s.batch_id ? new ObjectId(s.batch_id) : null,
        joining_date: s.joining_date || null,
        payment_status: s.payment_status || 'Pending',
        createdAt: new Date()
      }));
      
      const result = await db.collection('users').insertMany(studentsToInsert, { ordered: false });
      res.json({ inserted: result.insertedCount, errors: [] });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/students/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { name, email, phone, city, course_id, batch_id, payment_status } = req.body;
    
    // Update user info
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id), role: 'student' },
      { 
        $set: { 
          name, 
          email, 
          phone, 
          city, 
          batch_id: batch_id ? new ObjectId(batch_id) : null,
          updatedAt: new Date()
        } 
      }
    );
    
    // Handle course enrollment
    if (course_id) {
      const existingEnrollment = await db.collection('enrollments').findOne({
        student_id: new ObjectId(req.params.id),
        course_id: new ObjectId(course_id)
      });
      
      if (existingEnrollment) {
        // Update existing enrollment
        await db.collection('enrollments').updateOne(
          { _id: existingEnrollment._id },
          { $set: { payment_status: payment_status || 'Pending', updatedAt: new Date() } }
        );
      } else {
        // Create new enrollment
        await db.collection('enrollments').insertOne({
          student_id: new ObjectId(req.params.id),
          course_id: new ObjectId(course_id),
          payment_status: payment_status || 'Pending',
          enrolled_date: new Date().toISOString().split('T')[0],
          createdAt: new Date()
        });
      }
    }
    
    res.json({ success: true });
  });

  app.delete('/api/students/:id', authenticateToken, requireAdmin, async (req, res) => {
    await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id), role: 'student' });
    res.json({ success: true });
  });

  // --- Courses Management ---
  app.get('/api/courses', authenticateToken, async (req, res) => {
    const courses = await db.collection('courses').find().toArray();
    res.json(courses.map(c => ({ ...c, id: c._id })));
  });

  app.post('/api/courses', authenticateToken, requireAdmin, async (req, res) => {
    const { name, duration, fees, description, level, prerequisites } = req.body;
    const result = await db.collection('courses').insertOne({
      name,
      duration,
      fees,
      description,
      level,
      prerequisites: prerequisites || '',
      createdAt: new Date()
    });
    res.json({ id: result.insertedId });
  });

  app.put('/api/courses/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { name, duration, fees, description, level, prerequisites } = req.body;
    await db.collection('courses').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, duration, fees, description, level, prerequisites: prerequisites || '', updatedAt: new Date() } }
    );
    res.json({ success: true });
  });

  app.delete('/api/courses/:id', authenticateToken, requireAdmin, async (req, res) => {
    await db.collection('courses').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  });

  // --- Video Lessons Management ---
  app.get('/api/lessons', authenticateToken, async (req: any, res) => {
    if (req.user.role === 'admin') {
      const lessons = await db.collection('lessons').find().toArray();
      res.json(lessons.map(l => ({ ...l, id: l._id })));
    } else {
      // Get all enrolled courses for the student
      const enrollments = await db.collection('enrollments').find({ 
        student_id: new ObjectId(req.user.id) 
      }).toArray();
      
      if (enrollments.length === 0) return res.json([]);
      
      // Get course IDs
      const courseIds = enrollments.map(e => e.course_id);
      
      // Get lessons for all enrolled courses
      const lessons = await db.collection('lessons').find({ 
        course_id: { $in: courseIds } 
      }).toArray();
      
      res.json(lessons.map(l => ({ ...l, id: l._id })));
    }
  });

  app.post('/api/lessons', authenticateToken, requireAdmin, async (req, res) => {
    const { title, video_url, course_id, description, duration, deadline } = req.body;
    const result = await db.collection('lessons').insertOne({
      title,
      video_url,
      course_id: new ObjectId(course_id),
      description,
      duration,
      deadline: deadline || null,
      createdAt: new Date()
    });
    res.json({ id: result.insertedId });
  });

  app.put('/api/lessons/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { title, video_url, course_id, description, duration, deadline } = req.body;
    await db.collection('lessons').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, video_url, course_id: new ObjectId(course_id), description, duration, deadline: deadline || null, updatedAt: new Date() } }
    );
    res.json({ success: true });
  });

  app.delete('/api/lessons/:id', authenticateToken, requireAdmin, async (req, res) => {
    await db.collection('lessons').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  });

  // --- Batches Management ---
  app.get('/api/batches', authenticateToken, async (req, res) => {
    const batches = await db.collection('batches').find().toArray();
    
    for (const batch of batches) {
      // Count students with this batch_id (handle both ObjectId and string comparison)
      const studentCount = await db.collection('users').countDocuments({ 
        batch_id: batch._id, 
        role: 'student' 
      });
      batch.student_count = studentCount;
      batch.id = batch._id;
    }
    
    res.json(batches);
  });

  app.post('/api/batches', authenticateToken, requireAdmin, async (req, res) => {
    const { name, trainer_name, course_id, start_date, end_date } = req.body;
    const result = await db.collection('batches').insertOne({
      name,
      trainer_name,
      course_id: new ObjectId(course_id),
      start_date,
      end_date,
      createdAt: new Date()
    });
    res.json({ id: result.insertedId });
  });

  app.put('/api/batches/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { name, trainer_name, course_id, start_date, end_date } = req.body;
    await db.collection('batches').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, trainer_name, course_id: new ObjectId(course_id), start_date, end_date, updatedAt: new Date() } }
    );
    res.json({ success: true });
  });

  app.delete('/api/batches/:id', authenticateToken, requireAdmin, async (req, res) => {
    await db.collection('batches').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  });

  // --- Events Management ---
  app.get('/api/events', authenticateToken, async (req: any, res) => {
    const events = await db.collection('events').find().sort({ date: 1 }).toArray();
    
    for (const event of events) {
      const rsvpCount = await db.collection('event_rsvps').countDocuments({ event_id: event._id });
      const hasRsvped = await db.collection('event_rsvps').countDocuments({ 
        event_id: event._id, 
        student_id: new ObjectId(req.user.id) 
      });
      event.rsvp_count = rsvpCount;
      event.has_rsvped = hasRsvped > 0;
      event.id = event._id;
    }
    
    res.json(events);
  });

  app.post('/api/events/:id/rsvp', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can RSVP' });
    try {
      await db.collection('event_rsvps').insertOne({
        event_id: new ObjectId(req.params.id),
        student_id: new ObjectId(req.user.id),
        createdAt: new Date()
      });
      
      const event = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
      const student = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
      
      if (event && student) {
        await db.collection('notifications').insertOne({
          title: 'New Event RSVP',
          message: `${student.name} has RSVP'd for the event: ${event.title}`,
          is_read: false,
          createdAt: new Date()
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'Already RSVPed' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.delete('/api/events/:id/rsvp', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can cancel RSVP' });
    await db.collection('event_rsvps').deleteOne({
      event_id: new ObjectId(req.params.id),
      student_id: new ObjectId(req.user.id)
    });
    res.json({ success: true });
  });

  app.get('/api/events/:id/attendees', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    
    const rsvps = await db.collection('event_rsvps').find({ event_id: new ObjectId(req.params.id) }).toArray();
    const studentIds = rsvps.map(r => r.student_id);
    const attendees = await db.collection('users').find({ _id: { $in: studentIds } }).toArray();
    
    res.json(attendees.map(a => ({ id: a._id, name: a.name, email: a.email })));
  });

  app.post('/api/events', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, date, time, meeting_link, location } = req.body;
    const result = await db.collection('events').insertOne({
      title,
      description,
      date,
      time,
      meeting_link,
      location: location || '',
      createdAt: new Date()
    });
    res.json({ id: result.insertedId });
  });

  app.put('/api/events/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, date, time, meeting_link, location } = req.body;
    await db.collection('events').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, description, date, time, meeting_link, location: location || '', updatedAt: new Date() } }
    );
    res.json({ success: true });
  });

  app.delete('/api/events/:id', authenticateToken, requireAdmin, async (req, res) => {
    await db.collection('events').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  });

  // Notifications
  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const notifications = await db.collection('notifications').find().sort({ createdAt: -1 }).limit(50).toArray();
    res.json(notifications.map(n => ({ ...n, id: n._id })));
  });

  app.put('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    await db.collection('notifications').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { is_read: true } }
    );
    res.json({ success: true });
  });

  // Lesson Completions
  app.post('/api/lessons/:id/complete', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can complete lessons' });
    try {
      await db.collection('lesson_completions').insertOne({
        student_id: new ObjectId(req.user.id),
        lesson_id: new ObjectId(req.params.id),
        completedAt: new Date()
      });
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 11000) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.delete('/api/lessons/:id/complete', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can uncomplete lessons' });
    await db.collection('lesson_completions').deleteOne({
      student_id: new ObjectId(req.user.id),
      lesson_id: new ObjectId(req.params.id)
    });
    res.json({ success: true });
  });

  app.get('/api/student/completed-lessons', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can view their completed lessons' });
    const completions = await db.collection('lesson_completions').find({ student_id: new ObjectId(req.user.id) }).toArray();
    res.json(completions.map(c => c.lesson_id.toString()));
  });

  app.get('/api/student/progress', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
    
    try {
      // Get all enrolled courses
      const enrollments = await db.collection('enrollments').find({ 
        student_id: new ObjectId(req.user.id) 
      }).toArray();
      
      if (enrollments.length === 0) {
        return res.json({ progress: 0, completed: 0, total: 0 });
      }

      // Get course IDs
      const courseIds = enrollments.map(e => e.course_id);
      
      // Count total lessons across all enrolled courses
      const totalLessons = await db.collection('lessons').countDocuments({ 
        course_id: { $in: courseIds } 
      });
      
      if (totalLessons === 0) {
        return res.json({ progress: 0, completed: 0, total: 0 });
      }

      // Count completed lessons
      const completedLessons = await db.collection('lesson_completions').countDocuments({ 
        student_id: new ObjectId(req.user.id) 
      });
      
      const progress = Math.round((completedLessons / totalLessons) * 100);

      res.json({ progress, completed: completedLessons, total: totalLessons });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  });

  // --- Announcements Management ---
  app.get('/api/announcements', authenticateToken, async (req, res) => {
    const announcements = await db.collection('announcements').find().sort({ createdAt: -1 }).toArray();
    res.json(announcements.map(a => ({ ...a, id: a._id })));
  });

  app.post('/api/announcements', authenticateToken, requireAdmin, async (req, res) => {
    const { title, content } = req.body;
    const result = await db.collection('announcements').insertOne({
      title,
      content,
      createdAt: new Date()
    });
    res.json({ id: result.insertedId });
  });

  app.delete('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
    await db.collection('announcements').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  });

  // --- Payments Management ---
  app.get('/api/payments', authenticateToken, requireAdmin, async (req, res) => {
    const payments = await db.collection('payments').find().toArray();
    
    for (const payment of payments) {
      const student = await db.collection('users').findOne({ _id: payment.student_id });
      const course = await db.collection('courses').findOne({ _id: payment.course_id });
      payment.student_name = student?.name || 'Unknown';
      payment.course_name = course?.name || 'Unknown';
      payment.id = payment._id;
    }
    
    res.json(payments);
  });

  app.post('/api/payments', authenticateToken, requireAdmin, async (req, res) => {
    const { student_id, course_id, amount, status, date } = req.body;
    const result = await db.collection('payments').insertOne({
      student_id: new ObjectId(student_id),
      course_id: new ObjectId(course_id),
      amount,
      status,
      date,
      createdAt: new Date()
    });
    
    // Create or update enrollment
    const existingEnrollment = await db.collection('enrollments').findOne({
      student_id: new ObjectId(student_id),
      course_id: new ObjectId(course_id)
    });
    
    if (existingEnrollment) {
      // Update existing enrollment
      await db.collection('enrollments').updateOne(
        { _id: existingEnrollment._id },
        { 
          $set: { 
            payment_status: status,
            payment_date: status === 'Paid' ? date : null,
            updatedAt: new Date()
          } 
        }
      );
    } else {
      // Create new enrollment
      await db.collection('enrollments').insertOne({
        student_id: new ObjectId(student_id),
        course_id: new ObjectId(course_id),
        payment_status: status,
        enrolled_date: date,
        payment_date: status === 'Paid' ? date : null,
        createdAt: new Date()
      });
    }
    
    res.json({ id: result.insertedId });
  });

  app.put('/api/payments/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { status } = req.body;
    const payment = await db.collection('payments').findOne({ _id: new ObjectId(req.params.id) });
    
    await db.collection('payments').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    if (payment) {
      // Update enrollment status
      await db.collection('enrollments').updateOne(
        { student_id: payment.student_id, course_id: payment.course_id },
        { 
          $set: { 
            payment_status: status,
            payment_date: status === 'Paid' ? new Date().toISOString().split('T')[0] : null,
            updatedAt: new Date()
          } 
        }
      );
    }
    
    res.json({ success: true });
  });

  // --- Study Resources Management ---
  app.get('/api/resources', authenticateToken, async (req: any, res) => {
    if (req.user.role === 'admin') {
      const resources = await db.collection('resources').find().toArray();
      res.json(resources.map(r => ({ ...r, id: r._id })));
    } else {
      // Get all enrolled courses for the student
      const enrollments = await db.collection('enrollments').find({ 
        student_id: new ObjectId(req.user.id) 
      }).toArray();
      
      if (enrollments.length === 0) return res.json([]);
      
      // Get course IDs
      const courseIds = enrollments.map(e => e.course_id);
      
      // Get resources for all enrolled courses
      const resources = await db.collection('resources').find({ 
        course_id: { $in: courseIds } 
      }).toArray();
      
      res.json(resources.map(r => ({ ...r, id: r._id })));
    }
  });

  app.post('/api/resources', authenticateToken, requireAdmin, async (req, res) => {
    const { title, file_url, description, course_id } = req.body;
    const result = await db.collection('resources').insertOne({
      title,
      file_url,
      description,
      course_id: new ObjectId(course_id),
      createdAt: new Date()
    });
    res.json({ id: result.insertedId });
  });

  app.delete('/api/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
    await db.collection('resources').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  });

  // --- Profile Management ---
  app.get('/api/profile', authenticateToken, async (req: any, res) => {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });
    if (!user) return res.sendStatus(404);
    
    let courseInfo = null;
    let batchInfo = null;
    let payment_status = 'N/A';
    
    if (user.role === 'student') {
      // Get first enrollment for display
      const enrollment = await db.collection('enrollments').findOne({ student_id: user._id });
      
      if (enrollment) {
        courseInfo = await db.collection('courses').findOne({ _id: enrollment.course_id });
        payment_status = enrollment.payment_status || 'Pending';
      }
      
      if (user.batch_id) {
        batchInfo = await db.collection('batches').findOne({ _id: user.batch_id });
      }
    }
    
    res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      phone: user.phone || '',
      city: user.city || '',
      joining_date: user.joining_date || '',
      payment_status: payment_status,
      course: courseInfo ? { id: courseInfo._id, name: courseInfo.name } : null,
      batch: batchInfo ? { id: batchInfo._id, name: batchInfo.name } : null
    });
  });

  app.put('/api/profile', authenticateToken, async (req: any, res) => {
    const { name, phone, city } = req.body;
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { name, phone, city, updatedAt: new Date() } }
    );
    res.json({ success: true });
  });

  app.put('/api/profile/change-password', authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const validPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Current password is incorrect' });
    
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    
    res.json({ success: true, message: 'Password changed successfully' });
  });

  // --- Student Course Enrollment ---
  app.get('/api/student/courses-list', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can access courses' });
    
    const student = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!student) return res.sendStatus(404);
    
    // Get all courses
    const allCourses = await db.collection('courses').find().toArray();
    
    // Get student enrollments
    const enrollments = await db.collection('enrollments').find({ student_id: student._id }).toArray();
    const enrolledCourseIds = enrollments.map(e => e.course_id.toString());
    
    // Separate enrolled and available courses
    const enrolled = [];
    const available = [];
    
    for (const course of allCourses) {
      const courseId = course._id.toString();
      
      if (enrolledCourseIds.includes(courseId)) {
        // Get enrollment details
        const enrollment = enrollments.find(e => e.course_id.toString() === courseId);
        
        // Calculate progress
        const totalLessons = await db.collection('lessons').countDocuments({ course_id: course._id });
        const completedLessons = await db.collection('lesson_completions').countDocuments({ 
          student_id: student._id,
          lesson_id: { $in: (await db.collection('lessons').find({ course_id: course._id }).toArray()).map(l => l._id) }
        });
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        
        enrolled.push({
          id: course._id,
          name: course.name,
          duration: course.duration,
          fees: course.fees,
          description: course.description,
          level: course.level,
          prerequisites: course.prerequisites,
          enrolled: true,
          payment_status: enrollment?.payment_status || 'Pending',
          progress,
          total_lessons: totalLessons,
          completed_lessons: completedLessons
        });
      } else {
        available.push({
          id: course._id,
          name: course.name,
          duration: course.duration,
          fees: course.fees,
          description: course.description,
          level: course.level,
          prerequisites: course.prerequisites,
          enrolled: false
        });
      }
    }
    
    res.json({ enrolled, available });
  });

  app.post('/api/student/enroll-course', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can enroll' });
    
    const { course_id } = req.body;
    const student = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    const course = await db.collection('courses').findOne({ _id: new ObjectId(course_id) });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    // Check if already enrolled
    const existingEnrollment = await db.collection('enrollments').findOne({
      student_id: student._id,
      course_id: new ObjectId(course_id)
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    // Create enrollment
    await db.collection('enrollments').insertOne({
      student_id: student._id,
      course_id: new ObjectId(course_id),
      payment_status: 'Pending',
      enrolled_date: new Date().toISOString().split('T')[0],
      createdAt: new Date()
    });
    
    res.json({ success: true, message: 'Successfully enrolled in course' });
  });

  // --- Student Payment Gateway ---
  app.get('/api/student/enrollment-info', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can access enrollment info' });
    
    const student = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!student) return res.sendStatus(404);
    
    let courseInfo = null;
    let batchInfo = null;
    let totalLessons = 0;
    let completedLessons = 0;
    let progress = 0;
    
    if (student.course_id) {
      courseInfo = await db.collection('courses').findOne({ _id: student.course_id });
      totalLessons = await db.collection('lessons').countDocuments({ course_id: student.course_id });
      completedLessons = await db.collection('lesson_completions').countDocuments({ student_id: student._id });
      progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    }
    
    if (student.batch_id) {
      batchInfo = await db.collection('batches').findOne({ _id: student.batch_id });
    }
    
    res.json({
      course: courseInfo ? { 
        id: courseInfo._id, 
        name: courseInfo.name,
        duration: courseInfo.duration,
        fees: courseInfo.fees,
        description: courseInfo.description,
        level: courseInfo.level,
        prerequisites: courseInfo.prerequisites
      } : null,
      batch: batchInfo ? {
        id: batchInfo._id,
        name: batchInfo.name,
        trainer_name: batchInfo.trainer_name,
        start_date: batchInfo.start_date,
        end_date: batchInfo.end_date
      } : null,
      payment_status: student.payment_status || 'Pending',
      joining_date: student.joining_date || '',
      progress,
      total_lessons: totalLessons,
      completed_lessons: completedLessons
    });
  });

  app.get('/api/student/payment-info', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can access payment info' });
    
    const student = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!student) return res.sendStatus(404);
    
    let courseInfo = null;
    if (student.course_id) {
      courseInfo = await db.collection('courses').findOne({ _id: student.course_id });
    }
    
    const payment = await db.collection('payments').findOne({ 
      student_id: student._id,
      course_id: student.course_id
    });
    
    res.json({
      student_name: student.name,
      course: courseInfo ? { id: courseInfo._id, name: courseInfo.name, fees: courseInfo.fees } : null,
      payment_status: student.payment_status || 'Pending',
      payment_id: payment?._id || null
    });
  });

  app.get('/api/student/all-payments', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can access payment info' });
    
    const student = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!student) return res.sendStatus(404);
    
    const paymentItems = [];
    
    // Add course payments from enrollments
    const enrollments = await db.collection('enrollments').find({ student_id: student._id }).toArray();
    
    for (const enrollment of enrollments) {
      const course = await db.collection('courses').findOne({ _id: enrollment.course_id });
      if (course) {
        paymentItems.push({
          id: course._id.toString(),
          type: 'course',
          name: course.name,
          amount: course.fees,
          status: enrollment.payment_status || 'Pending',
          description: course.description,
          enrolled_date: enrollment.enrolled_date
        });
      }
    }
    
    // Add event payments (events with fees)
    const rsvps = await db.collection('event_rsvps').find({ student_id: student._id }).toArray();
    for (const rsvp of rsvps) {
      const event = await db.collection('events').findOne({ _id: rsvp.event_id });
      if (event && event.fee && event.fee > 0) {
        const eventPayment = await db.collection('event_payments').findOne({
          student_id: student._id,
          event_id: event._id
        });
        
        paymentItems.push({
          id: event._id.toString(),
          type: 'event',
          name: event.title,
          amount: event.fee,
          status: eventPayment?.status || 'Pending',
          description: event.description,
          date: event.date
        });
      }
    }
    
    res.json(paymentItems);
  });

  app.post('/api/student/create-payment-order', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can create payment orders' });
    
    const { item_id, item_type, amount } = req.body;
    
    // Convert amount to paise (Indian currency smallest unit)
    const amountInPaise = Math.round(amount * 100);
    
    // In production, integrate with Razorpay SDK here
    // For now, return mock order data
    const orderId = `order_${Date.now()}`;
    
    res.json({
      order_id: orderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  });

  app.post('/api/student/verify-payment', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can verify payments' });
    
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, item_id, item_type } = req.body;
    
    // In production, verify signature with Razorpay SDK
    // For now, assume payment is successful
    
    const student = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!student) return res.status(400).json({ error: 'Student not found' });
    
    if (item_type === 'course') {
      const course = await db.collection('courses').findOne({ _id: new ObjectId(item_id) });
      if (!course) return res.status(400).json({ error: 'Course not found' });
      
      // Update enrollment payment status
      await db.collection('enrollments').updateOne(
        { student_id: student._id, course_id: new ObjectId(item_id) },
        { $set: { payment_status: 'Paid', payment_date: new Date().toISOString().split('T')[0] } }
      );
      
      // Create payment record
      await db.collection('payments').insertOne({
        student_id: student._id,
        course_id: new ObjectId(item_id),
        amount: course.fees,
        status: 'Paid',
        date: new Date().toISOString().split('T')[0],
        razorpay_payment_id,
        razorpay_order_id,
        createdAt: new Date()
      });
    } else if (item_type === 'event') {
      const event = await db.collection('events').findOne({ _id: new ObjectId(item_id) });
      if (!event) return res.status(400).json({ error: 'Event not found' });
      
      // Create event payment record
      await db.collection('event_payments').insertOne({
        student_id: student._id,
        event_id: new ObjectId(item_id),
        amount: event.fee || 0,
        status: 'Paid',
        date: new Date().toISOString().split('T')[0],
        razorpay_payment_id,
        razorpay_order_id,
        createdAt: new Date()
      });
    }
    
    res.json({ success: true, message: 'Payment verified successfully' });
  });

  // Development vs Production logging
  if (process.env.NODE_ENV !== 'production') {
    console.log('🎨 Development mode');
    console.log('📡 API Server ready at http://localhost:3000');
  } else {
    console.log('🚀 Production mode');
    console.log('📡 API Server ready');
  }

  const PORT = parseInt(process.env.PORT || '3000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
