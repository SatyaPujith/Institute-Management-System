import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';

interface Lesson {
  id: string | number;
  title: string;
  video_url: string;
  course_id: string | number;
  description: string;
  duration: string;
  deadline?: string;
}

interface Course {
  id: string | number;
  name: string;
}

export default function AdminLessons() {
  const { token } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const [lessonsRes, coursesRes] = await Promise.all([
      fetch('/api/lessons', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (lessonsRes.ok) setLessons(await lessonsRes.json());
    if (coursesRes.ok) setCourses(await coursesRes.json());
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = currentLesson.id ? `/api/lessons/${currentLesson.id}` : '/api/lessons';
    const method = currentLesson.id ? 'PUT' : 'POST';

    // Convert ObjectId fields to strings for MongoDB
    const lessonData = {
      ...currentLesson,
      course_id: currentLesson.course_id?.toString() || null
    };

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(lessonData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setCurrentLesson({});
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    const res = await fetch(`/api/lessons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchData();
  };

  const handleExport = () => {
    exportToExcel(lessons, 'Lessons');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      await Promise.all(data.map(async (lesson: any) => {
        await fetch('/api/lessons', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(lesson)
        });
      }));
      fetchData();
      alert('Import successful!');
    } catch (error) {
      console.error('Import failed', error);
      alert('Failed to import data. Please check the file format.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Video Lessons</h1>
          <p className="mt-2 text-sm text-gray-500">Manage video content and course materials.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
          >
            <Upload className="-ml-1 mr-2 h-4 w-4" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
          >
            <Download className="-ml-1 mr-2 h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => { setCurrentLesson({}); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Lesson
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
        <ul className="divide-y divide-gray-100">
          {lessons.map((lesson) => {
            const courseName = courses.find(c => c.id === lesson.course_id)?.name || `Course ID: ${lesson.course_id}`;
            return (
              <li key={lesson.id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-6 py-5 flex items-center">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-base items-center">
                        <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {courseName}
                        </span>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <p>Duration: {lesson.duration}</p>
                          {lesson.deadline && (
                            <>
                              <span className="mx-3 text-gray-300">&middot;</span>
                              <p>Deadline: {lesson.deadline}</p>
                            </>
                          )}
                          <span className="mx-3 text-gray-300">&middot;</span>
                          <a href={lesson.video_url} target="_blank" rel="noreferrer" className="text-gray-900 hover:text-gray-600 font-medium transition-colors">Watch Video</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex space-x-3">
                    <button
                      onClick={() => { setCurrentLesson(lesson); setIsModalOpen(true); }}
                      className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          {lessons.length === 0 && (
            <li className="px-6 py-12 text-center text-gray-500 text-sm">
              No lessons available. Click "Add Lesson" to create one.
            </li>
          )}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-25 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-100 relative z-10">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-6" id="modal-title">
                  {currentLesson.id ? 'Edit Lesson' : 'Add Lesson'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" required value={currentLesson.title || ''} onChange={e => setCurrentLesson({...currentLesson, title: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video URL or File Link</label>
                    <input type="url" required value={currentLesson.video_url || ''} onChange={e => setCurrentLesson({...currentLesson, video_url: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                      <select required value={currentLesson.course_id || ''} onChange={e => setCurrentLesson({...currentLesson, course_id: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors">
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input type="text" required value={currentLesson.duration || ''} onChange={e => setCurrentLesson({...currentLesson, duration: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                    <input type="date" value={currentLesson.deadline || ''} onChange={e => setCurrentLesson({...currentLesson, deadline: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={currentLesson.description || ''} onChange={e => setCurrentLesson({...currentLesson, description: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" rows={3}></textarea>
                  </div>
                  <div className="mt-8 sm:flex sm:flex-row-reverse pt-4 border-t border-gray-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                      Save Lesson
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-200 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:mt-0 sm:w-auto sm:text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


