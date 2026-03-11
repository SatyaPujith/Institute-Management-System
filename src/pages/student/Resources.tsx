import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  file_url: string;
  description: string;
  course_id: number;
}

export default function StudentResources() {
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      const res = await fetch('/api/resources', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setResources(await res.json());
      }
    };
    fetchResources();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">Study Resources</h1>
        <p className="mt-2 text-sm text-gray-500">Download materials and documents for your course.</p>
      </div>
      {resources.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
          No study resources available for your enrolled course yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                      <FileText className="h-6 w-6 text-gray-700" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{resource.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow">{resource.description}</p>
                <div className="mt-auto pt-4 border-t border-gray-50">
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resource
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
