import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, Award, CheckCircle, Video, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string | number;
  name: string;
  duration: string;
  fees: number;
  description: string;
  level: string;
  prerequisites: string;
  enrolled?: boolean;
  payment_status?: string;
  progress?: number;
  total_lessons?: number;
  completed_lessons?: number;
}

export default function StudentCourses() {
  const { token } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/student/courses-list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrolledCourses(data.enrolled || []);
        setAvailableCourses(data.available || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string | number) => {
    if (!confirm('Are you sure you want to enroll in this course?')) return;
    
    setEnrolling(courseId.toString());
    try {
      const res = await fetch('/api/student/enroll-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: courseId })
      });

      if (res.ok) {
        alert('Successfully enrolled! Please complete payment to access course materials.');
        fetchCourses();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Failed to enroll', error);
      alert('Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* My Enrolled Courses Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-gray-900">My Enrolled Courses</h1>
            <p className="mt-2 text-sm text-gray-500">Courses you are currently enrolled in</p>
          </div>
          {enrolledCourses.length > 0 && (
            <Link
              to="/student/payment"
              className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View Payments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          )}
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Enrolled Courses</h3>
            <p className="mt-1 text-sm text-gray-500">Browse available courses below to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {course.level}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.payment_status === 'Paid' 
                        ? 'bg-green-500/20 text-green-100' 
                        : 'bg-red-500/20 text-red-100'
                    }`}>
                      {course.payment_status === 'Paid' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Paid</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> Pending</>
                      )}
                    </span>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">{course.name}</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">Progress</span>
                      <span className="text-sm font-medium text-gray-900">{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gray-900 h-full transition-all"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.completed_lessons || 0} of {course.total_lessons || 0} lessons
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-lg font-medium text-gray-900 flex items-center">
                      ₹{course.fees.toLocaleString('en-IN')}
                    </span>
                    <Link
                      to="/student/lessons"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Learn
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Courses Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-light tracking-tight text-gray-900">Available Courses</h2>
          <p className="mt-2 text-sm text-gray-500">Explore and enroll in new courses</p>
        </div>

        {availableCourses.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Available Courses</h3>
            <p className="mt-1 text-sm text-gray-500">All courses are already enrolled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-gray-700" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      Duration: {course.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Award className="h-4 w-4 mr-2" />
                      Fee: ₹{course.fees.toLocaleString('en-IN')}
                    </div>
                    {course.prerequisites && course.prerequisites !== 'None' && (
                      <div className="text-xs text-gray-500 mt-2">
                        Prerequisites: {course.prerequisites}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id.toString()}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {enrolling === course.id.toString() ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
