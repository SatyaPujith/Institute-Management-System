import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://satyapujith:Satya%409100@cluster0.qtr33fw.mongodb.net/institute_management?retryWrites=true&w=majority&appName=InstituteManagement';

let db: Db;
let client: MongoClient;

export async function connectDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('institute_management');
    console.log('✅ Connected to MongoDB');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('event_rsvps').createIndex({ event_id: 1, student_id: 1 }, { unique: true });
    await db.collection('lesson_completions').createIndex({ student_id: 1, lesson_id: 1 }, { unique: true });

    // Seed default admin if not exists
    const adminExists = await db.collection('users').findOne({ email: 'admin@institute.com' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await db.collection('users').insertOne({
        name: 'Admin User',
        email: 'admin@institute.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      console.log('✅ Default admin created');
    }

    // Seed sample data if collections are empty
    const coursesCount = await db.collection('courses').countDocuments();
    if (coursesCount === 0) {
      console.log('📦 Seeding sample data...');
      
      // Insert courses
      const coursesResult = await db.collection('courses').insertMany([
        {
          name: 'Forex Trading Basics',
          duration: '4 Weeks',
          fees: 299.99,
          description: 'Learn the fundamentals of Forex trading, currency pairs, and basic chart reading.',
          level: 'Beginner',
          prerequisites: 'None',
          createdAt: new Date()
        },
        {
          name: 'Advanced Price Action',
          duration: '8 Weeks',
          fees: 599.99,
          description: 'Master price action trading, support/resistance, and advanced candlestick patterns.',
          level: 'Advanced',
          prerequisites: 'Forex Trading Basics',
          createdAt: new Date()
        }
      ]);

      const course1Id = coursesResult.insertedIds[0];
      const course2Id = coursesResult.insertedIds[1];

      // Insert batches
      const batchesResult = await db.collection('batches').insertMany([
        {
          name: 'Batch A - Morning',
          trainer_name: 'Alex Mercer',
          course_id: course1Id,
          start_date: '2026-04-01',
          end_date: '2026-04-28',
          createdAt: new Date()
        },
        {
          name: 'Batch B - Evening',
          trainer_name: 'Sarah Connor',
          course_id: course2Id,
          start_date: '2026-04-15',
          end_date: '2026-06-15',
          createdAt: new Date()
        }
      ]);

      const batch1Id = batchesResult.insertedIds[0];
      const batch2Id = batchesResult.insertedIds[1];

      // Insert students
      const hashedPassword = bcrypt.hashSync('student123', 10);
      const studentsResult = await db.collection('users').insertMany([
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: hashedPassword,
          role: 'student',
          phone: '+1234567890',
          city: 'New York',
          batch_id: batch1Id,
          joining_date: '2026-03-01',
          createdAt: new Date()
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: hashedPassword,
          role: 'student',
          phone: '+0987654321',
          city: 'London',
          batch_id: batch2Id,
          joining_date: '2026-03-05',
          createdAt: new Date()
        }
      ]);

      const student1Id = studentsResult.insertedIds[0];
      const student2Id = studentsResult.insertedIds[1];

      // Create enrollments for students
      await db.collection('enrollments').insertMany([
        {
          student_id: student1Id,
          course_id: course1Id,
          payment_status: 'Paid',
          enrolled_date: '2026-03-01',
          payment_date: '2026-03-01',
          createdAt: new Date()
        },
        {
          student_id: student2Id,
          course_id: course2Id,
          payment_status: 'Pending',
          enrolled_date: '2026-03-05',
          createdAt: new Date()
        }
      ]);

      // Insert lessons
      await db.collection('lessons').insertMany([
        {
          title: 'Introduction to Pips and Lots',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          course_id: course1Id,
          description: 'Understanding the basic units of measure in Forex.',
          duration: '15:30',
          createdAt: new Date()
        },
        {
          title: 'Reading Candlestick Charts',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          course_id: course1Id,
          description: 'How to read bullish and bearish candles.',
          duration: '22:45',
          createdAt: new Date()
        },
        {
          title: 'Support and Resistance Zones',
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          course_id: course2Id,
          description: 'Identifying key levels on higher timeframes.',
          duration: '35:10',
          createdAt: new Date()
        }
      ]);

      // Insert events
      await db.collection('events').insertMany([
        {
          title: 'Live Trading Session (London Open)',
          description: 'Watch our head trader take live setups during the London session.',
          date: '2026-03-15',
          time: '08:00',
          meeting_link: 'https://zoom.us/j/123456789',
          location: 'Online (Zoom)',
          createdAt: new Date()
        },
        {
          title: 'Weekly Q&A Webinar',
          description: "Ask your questions about this week's lessons.",
          date: '2026-03-20',
          time: '18:00',
          meeting_link: 'https://zoom.us/j/987654321',
          location: 'Online (Zoom)',
          createdAt: new Date()
        }
      ]);

      // Insert payments
      await db.collection('payments').insertMany([
        {
          student_id: student1Id,
          course_id: course1Id,
          amount: 299.99,
          status: 'Paid',
          date: '2026-03-01',
          createdAt: new Date()
        },
        {
          student_id: student2Id,
          course_id: course2Id,
          amount: 599.99,
          status: 'Pending',
          date: '2026-03-05',
          createdAt: new Date()
        }
      ]);

      // Insert announcements
      await db.collection('announcements').insertMany([
        {
          title: 'Welcome to Forex Institute!',
          content: 'We are excited to have you on board. Please make sure to join our Discord community.',
          createdAt: new Date()
        },
        {
          title: 'Platform Maintenance',
          content: 'The learning platform will be down for maintenance on Sunday at 2 AM EST.',
          createdAt: new Date()
        }
      ]);

      // Insert resources
      await db.collection('resources').insertMany([
        {
          title: 'Trading Plan Template',
          file_url: 'https://example.com/trading-plan.pdf',
          description: 'A printable PDF to help you build your daily trading plan.',
          course_id: course1Id,
          createdAt: new Date()
        },
        {
          title: 'Position Size Calculator',
          file_url: 'https://example.com/calculator.xlsx',
          description: 'Excel sheet to calculate your lot size based on risk.',
          course_id: course2Id,
          createdAt: new Date()
        }
      ]);

      console.log('✅ Sample data seeded');
    }
    
    // Auto-migrate existing students with course_id to enrollments
    console.log('🔄 Checking for students to migrate...');
    const studentsToMigrate = await db.collection('users').find({
      role: 'student',
      course_id: { $exists: true, $ne: null }
    }).toArray();
    
    if (studentsToMigrate.length > 0) {
      console.log(`📦 Found ${studentsToMigrate.length} students to migrate`);
      let migratedCount = 0;
      
      for (const student of studentsToMigrate) {
        const existingEnrollment = await db.collection('enrollments').findOne({
          student_id: student._id,
          course_id: student.course_id
        });
        
        if (!existingEnrollment) {
          await db.collection('enrollments').insertOne({
            student_id: student._id,
            course_id: student.course_id,
            payment_status: student.payment_status || 'Pending',
            enrolled_date: student.joining_date || new Date().toISOString().split('T')[0],
            payment_date: student.payment_status === 'Paid' ? student.joining_date : null,
            createdAt: new Date()
          });
          
          // Remove old fields
          await db.collection('users').updateOne(
            { _id: student._id },
            { $unset: { course_id: '', payment_status: '' } }
          );
          
          migratedCount++;
        }
      }
      
      console.log(`✅ Migrated ${migratedCount} students to enrollments collection`);
    }

    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

export { ObjectId };
