/**
 * Migration Script: Convert existing students to use enrollments collection
 * 
 * This script migrates students from the old structure (course_id in users)
 * to the new structure (enrollments collection)
 * 
 * Run this script ONCE after updating the code:
 * node migrate-existing-students.js
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://satyapujith:Satya%409100@cluster0.qtr33fw.mongodb.net/institute_management?retryWrites=true&w=majority&appName=InstituteManagement';

async function migrate() {
  console.log('🔄 Starting migration...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('institute_management');
    
    // Get all students with course_id (old structure)
    const studentsWithCourses = await db.collection('users').find({
      role: 'student',
      course_id: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`Found ${studentsWithCourses.length} students with courses to migrate\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const student of studentsWithCourses) {
      // Check if enrollment already exists
      const existingEnrollment = await db.collection('enrollments').findOne({
        student_id: student._id,
        course_id: student.course_id
      });
      
      if (existingEnrollment) {
        console.log(`⏭️  Skipped: ${student.name} (${student.email}) - enrollment already exists`);
        skippedCount++;
        continue;
      }
      
      // Create enrollment
      await db.collection('enrollments').insertOne({
        student_id: student._id,
        course_id: student.course_id,
        payment_status: student.payment_status || 'Pending',
        enrolled_date: student.joining_date || new Date().toISOString().split('T')[0],
        payment_date: student.payment_status === 'Paid' ? student.joining_date : null,
        createdAt: new Date()
      });
      
      console.log(`✅ Migrated: ${student.name} (${student.email})`);
      migratedCount++;
      
      // Optional: Remove old fields from user document
      await db.collection('users').updateOne(
        { _id: student._id },
        { $unset: { course_id: '', payment_status: '' } }
      );
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Migrated: ${migratedCount} students`);
    console.log(`   ⏭️  Skipped: ${skippedCount} students (already migrated)`);
    console.log(`   📝 Total: ${studentsWithCourses.length} students processed`);
    console.log(`\n✨ Migration complete!`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
