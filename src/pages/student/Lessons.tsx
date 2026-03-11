import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, CheckCircle, Circle } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  video_url: string;
  course_id: number;
  description: string;
  duration: string;
  deadline?: string;
}

export default function StudentLessons() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const fetchData = async () => {
    try {
      const [lessonsRes, completedRes] = await Promise.all([
        fetch('/api/lessons', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/student/completed-lessons', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (lessonsRes.ok) setLessons(await lessonsRes.json());
      if (completedRes.ok) setCompletedLessons(await completedRes.json());
    } catch (error) {
      console.error('Failed to fetch lessons data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const toggleCompletion = async (lessonId: number, isCompleted: boolean) => {
    try {
      const method = isCompleted ? 'DELETE' : 'POST';
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        if (isCompleted) {
          setCompletedLessons(completedLessons.filter(id => id !== lessonId));
        } else {
          setCompletedLessons([...completedLessons, lessonId]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle completion', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">My Video Lessons</h1>
        <p className="mt-2 text-sm text-gray-500">Access your course materials and video lectures.</p>
      </div>
      {lessons.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
          No video lessons available for your enrolled course yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            return (
            <div key={lesson.id} className={`bg-white border ${isCompleted ? 'border-indigo-200 bg-indigo-50/10' : 'border-gray-100'} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden`}>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`rounded-xl p-3 border ${isCompleted ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                        <PlayCircle className={`h-6 w-6 ${isCompleted ? 'text-indigo-600' : 'text-gray-700'}`} aria-hidden="true" />
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{lesson.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Duration: {lesson.duration}</p>
                      {lesson.deadline && (
                        <p className="text-sm text-red-500 mt-1 font-medium">Deadline: {new Date(lesson.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleCompletion(lesson.id, isCompleted)}
                    className="ml-2 flex-shrink-0"
                    title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-indigo-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300 hover:text-indigo-400 transition-colors" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow">{lesson.description}</p>
                <div className="mt-auto pt-4 border-t border-gray-50">
                  <a
                    href={lesson.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      isCompleted 
                        ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                        : 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-900'
                    }`}
                  >
                    Watch Lesson
                  </a>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
