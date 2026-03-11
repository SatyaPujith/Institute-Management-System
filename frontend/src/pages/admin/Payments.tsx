import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Download, Upload } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';

interface Payment {
  id: string | number;
  student_id: string | number;
  student_name: string;
  course_id: string | number;
  course_name: string;
  amount: number;
  status: string;
  date: string;
}

interface Student {
  id: string | number;
  name: string;
}

interface Course {
  id: string | number;
  name: string;
}

export default function AdminPayments() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Partial<Payment>>({});
  const [filter, setFilter] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    const [paymentsRes, studentsRes, coursesRes] = await Promise.all([
      fetch('/api/payments', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (paymentsRes.ok) setPayments(await paymentsRes.json());
    if (studentsRes.ok) setStudents(await studentsRes.json());
    if (coursesRes.ok) setCourses(await coursesRes.json());
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = currentPayment.id ? `/api/payments/${currentPayment.id}` : '/api/payments';
    const method = currentPayment.id ? 'PUT' : 'POST';

    // Convert ObjectId fields to strings for MongoDB
    const paymentData = {
      ...currentPayment,
      student_id: currentPayment.student_id?.toString() || null,
      course_id: currentPayment.course_id?.toString() || null
    };

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(paymentData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setCurrentPayment({});
      fetchData();
    }
  };

  const handleExport = () => {
    exportToExcel(payments, 'Payments');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      await Promise.all(data.map(async (payment: any) => {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(payment)
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

  const filteredPayments = filter === 'All' ? payments : payments.filter(p => p.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Payments</h1>
          <p className="mt-2 text-sm text-gray-500">Track and manage student payments.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-10 py-2.5 text-sm border-gray-200 focus:outline-none focus:ring-gray-900 focus:border-gray-900 rounded-xl shadow-sm transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
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
            onClick={() => { setCurrentPayment({}); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Payment
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
        <ul className="divide-y divide-gray-100">
          {filteredPayments.map((payment) => (
            <li key={payment.id} className="hover:bg-gray-50 transition-colors duration-150">
              <div className="px-6 py-5 flex items-center">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex text-base items-center">
                      <p className="font-medium text-gray-900 truncate">{payment.student_name}</p>
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {payment.course_name}
                      </span>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <p className="font-medium text-gray-900">Amount: ₹{payment.amount}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <p>Date: {payment.date}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <p>Status: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{payment.status}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex space-x-3">
                  <button
                    onClick={() => { setCurrentPayment(payment); setIsModalOpen(true); }}
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {filteredPayments.length === 0 && (
            <li className="px-6 py-12 text-center text-gray-500 text-sm">
              No payments found.
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
                  {currentPayment.id ? 'Edit Payment Status' : 'Add Payment'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!currentPayment.id && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <select required value={currentPayment.student_id || ''} onChange={e => setCurrentPayment({...currentPayment, student_id: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors">
                          <option value="">Select a student</option>
                          {students.map(student => (
                            <option key={student.id} value={student.id}>{student.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <select required value={currentPayment.course_id || ''} onChange={e => setCurrentPayment({...currentPayment, course_id: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors">
                          <option value="">Select a course</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                          <input type="number" required value={currentPayment.amount || ''} onChange={e => setCurrentPayment({...currentPayment, amount: Number(e.target.value)})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input type="date" required value={currentPayment.date || ''} onChange={e => setCurrentPayment({...currentPayment, date: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select required value={currentPayment.status || 'Pending'} onChange={e => setCurrentPayment({...currentPayment, status: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors">
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div className="mt-8 sm:flex sm:flex-row-reverse pt-4 border-t border-gray-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                      Save Payment
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


