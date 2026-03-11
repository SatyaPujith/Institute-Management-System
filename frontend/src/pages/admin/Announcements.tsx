import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

interface Announcement {
  id: string | number;
  title: string;
  content: string;
  created_at: string;
}

export default function AdminAnnouncements() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement>>({});

  const fetchAnnouncements = async () => {
    const res = await fetch('/api/announcements', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setAnnouncements(await res.json());
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(currentAnnouncement)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setCurrentAnnouncement({});
      fetchAnnouncements();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchAnnouncements();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Announcements</h1>
          <p className="mt-2 text-sm text-gray-500">Broadcast messages to all students.</p>
        </div>
        <button
          onClick={() => { setCurrentAnnouncement({}); setIsModalOpen(true); }}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-xl border border-transparent bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors sm:w-auto"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Announcement
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
        <ul className="divide-y divide-gray-100">
          {announcements.map((announcement) => (
            <li key={announcement.id} className="hover:bg-gray-50 transition-colors duration-150">
              <div className="px-6 py-5 flex items-start sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-start sm:justify-between">
                  <div>
                    <div className="flex text-base items-center">
                      <p className="font-medium text-gray-900 truncate">{announcement.title}</p>
                    </div>
                    <div className="mt-1 flex">
                      <div className="flex items-center text-xs text-gray-400">
                        <p>{new Date(announcement.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">
                      {announcement.content}
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex space-x-3 mt-1">
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {announcements.length === 0 && (
            <li className="px-6 py-12 text-center text-gray-500 text-sm">
              No announcements available. Click "Add Announcement" to create one.
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
                  Add Announcement
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" required value={currentAnnouncement.title || ''} onChange={e => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea required value={currentAnnouncement.content || ''} onChange={e => setCurrentAnnouncement({...currentAnnouncement, content: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" rows={5}></textarea>
                  </div>
                  <div className="mt-8 sm:flex sm:flex-row-reverse pt-4 border-t border-gray-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                      Save Announcement
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


