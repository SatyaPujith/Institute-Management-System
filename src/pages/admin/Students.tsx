import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Search, Download, Upload } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';
import { useSearchParams } from 'react-router-dom';

interface Student {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  city: string;
  course_id: string | number;
  batch_id: string | number;
  joining_date: string;
  payment_status: string;
  progress?: number;
}

export default function AdminStudents() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = async () => {
    const res = await fetch('/api/students', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setStudents(await res.json());
    }
  };

  const fetchCourses = async () => {
    const res = await fetch('/api/courses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setCourses(await res.json());
    }
  };

  const fetchBatches = async () => {
    const res = await fetch('/api/batches', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setBatches(await res.json());
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchBatches();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = currentStudent.id ? `/api/students/${currentStudent.id}` : '/api/students';
    const method = currentStudent.id ? 'PUT' : 'POST';

    // Convert ObjectId fields to strings for MongoDB
    const studentData = {
      ...currentStudent,
      course_id: currentStudent.course_id?.toString() || null,
      batch_id: currentStudent.batch_id?.toString() || null
    };

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(studentData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setCurrentStudent({});
      fetchStudents();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchStudents();
  };

  const handleExport = () => {
    exportToExcel(students, 'Students');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      
      // Prepare students data for bulk import
      const studentsToImport = data.map((student: any) => ({
        name: student.name,
        email: student.email,
        password: student.password || 'password123',
        phone: student.phone || null,
        city: student.city || null,
        course_id: student.course_id || null,
        batch_id: student.batch_id || null,
        joining_date: student.joining_date || new Date().toISOString().split('T')[0],
        payment_status: student.payment_status || 'Pending'
      }));

      // Send bulk import request
      const res = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ students: studentsToImport })
      });

      if (res.ok) {
        const result = await res.json();
        fetchStudents();
        alert(`Import successful! ${result.inserted} students added.`);
      } else {
        const error = await res.json();
        alert(`Import failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Import failed', error);
      alert('Failed to import data. Please check the file format.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [searchParams] = useSearchParams();
  const batchIdFilter = searchParams.get('batch_id');

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase());
    // Compare batch_id as strings (MongoDB ObjectIds are strings)
    const matchesBatch = batchIdFilter ? s.batch_id?.toString() === batchIdFilter : true;
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">
            {batchIdFilter 
              ? `Students in ${batches.find(b => b.id?.toString() === batchIdFilter)?.name || 'Batch'}` 
              : 'Students Management'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">Manage student enrollments, details, and payment status.</p>
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
            onClick={() => { setCurrentStudent({}); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Student
          </button>
        </div>
      </div>

      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors shadow-sm"
        />
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
        <ul className="divide-y divide-gray-100">
          {filteredStudents.map((student) => (
            <li key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
              <div className="px-6 py-5 flex items-center">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex text-base items-center">
                      <p className="font-medium text-gray-900 truncate">{student.name}</p>
                      <p className="ml-2 flex-shrink-0 font-normal text-gray-500 text-sm">
                        {student.email}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-y-2">
                        <p>Phone: {student.phone || 'N/A'}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <p>City: {student.city || 'N/A'}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <p>Course: {courses.find(c => c.id === student.course_id)?.name || 'None'}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <p>Batch: {batches.find(b => b.id === student.batch_id)?.name || 'None'}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <p>Enrolled: {student.joining_date || 'N/A'}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <div className="flex items-center gap-2">
                          <p>Progress:</p>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gray-900 rounded-full" 
                              style={{ width: `${student.progress || (student.id * 17) % 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <p>Payment: <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${student.payment_status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{student.payment_status}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex space-x-3">
                  <button
                    onClick={() => { setCurrentStudent(student); setIsModalOpen(true); }}
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {filteredStudents.length === 0 && (
            <li className="px-6 py-12 text-center text-gray-500 text-sm">
              No students found matching your search.
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
                  {currentStudent.id ? 'Edit Student' : 'Add Student'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" required value={currentStudent.name || ''} onChange={e => setCurrentStudent({...currentStudent, name: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" required value={currentStudent.email || ''} onChange={e => setCurrentStudent({...currentStudent, email: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                  </div>
                  {!currentStudent.id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input type="password" required value={(currentStudent as any).password || ''} onChange={e => setCurrentStudent({...currentStudent, password: e.target.value} as any)} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="text" value={currentStudent.phone || ''} onChange={e => setCurrentStudent({...currentStudent, phone: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" value={currentStudent.city || ''} onChange={e => setCurrentStudent({...currentStudent, city: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                      <select value={currentStudent.course_id || ''} onChange={e => setCurrentStudent({...currentStudent, course_id: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors">
                        <option value="">Select Course</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                      <select value={currentStudent.batch_id || ''} onChange={e => setCurrentStudent({...currentStudent, batch_id: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors">
                        <option value="">Select Batch</option>
                        {batches.filter(b => !currentStudent.course_id || b.course_id === currentStudent.course_id || b.course_id?.toString() === currentStudent.course_id?.toString()).map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                      <input type="date" value={currentStudent.joining_date || ''} onChange={e => setCurrentStudent({...currentStudent, joining_date: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                      <select value={currentStudent.payment_status || 'Pending'} onChange={e => setCurrentStudent({...currentStudent, payment_status: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors">
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 sm:flex sm:flex-row-reverse pt-4 border-t border-gray-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                      Save Student
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


