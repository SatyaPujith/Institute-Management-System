import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Download } from 'lucide-react';

interface Resource {
  id: string | number;
  title: string;
  file_url: string;
  description: string;
  course_id: string | number;
}

interface Course {
  id: string | number;
  name: string;
}

export default function AdminResources() {
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<Partial<Resource>>({});

  const fetchData = async () => {
    const [resourcesRes, coursesRes] = await Promise.all([
      fetch('/api/resources', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    if (resourcesRes.ok) setResources(await resourcesRes.json());
    if (coursesRes.ok) setCourses(await coursesRes.json());
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert ObjectId fields to strings for MongoDB
    const resourceData = {
      ...currentResource,
      course_id: currentResource.course_id?.toString() || null
    };
    
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(resourceData)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setCurrentResource({});
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    const res = await fetch(`/api/resources/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Study Resources</h1>
          <p className="mt-2 text-sm text-gray-500">Manage downloadable materials for students.</p>
        </div>
        <button
          onClick={() => { setCurrentResource({}); setIsModalOpen(true); }}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-xl border border-transparent bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors sm:w-auto"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Resource
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
        <ul className="divide-y divide-gray-100">
          {resources.map((resource) => {
            const courseName = courses.find(c => c.id === resource.course_id)?.name || `Course ID: ${resource.course_id}`;
            return (
              <li key={resource.id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-6 py-5 flex items-center">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-base items-center">
                        <p className="font-medium text-gray-900 truncate">{resource.title}</p>
                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {courseName}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {resource.description}
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex space-x-3">
                    <a
                      href={resource.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          {resources.length === 0 && (
            <li className="px-6 py-12 text-center text-gray-500 text-sm">
              No resources available. Click "Add Resource" to create one.
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
                  Add Resource
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" required value={currentResource.title || ''} onChange={e => setCurrentResource({...currentResource, title: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                    <input type="url" required value={currentResource.file_url || ''} onChange={e => setCurrentResource({...currentResource, file_url: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <select required value={currentResource.course_id || ''} onChange={e => setCurrentResource({...currentResource, course_id: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors">
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={currentResource.description || ''} onChange={e => setCurrentResource({...currentResource, description: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" rows={3}></textarea>
                  </div>
                  <div className="mt-8 sm:flex sm:flex-row-reverse pt-4 border-t border-gray-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                      Save Resource
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


