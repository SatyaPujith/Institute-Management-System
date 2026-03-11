import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function StudentAnnouncements() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const res = await fetch('/api/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    };
    fetchAnnouncements();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">Announcements</h1>
        <p className="mt-2 text-sm text-gray-500">Stay updated with the latest news and information.</p>
      </div>
      {announcements.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
          No announcements at this time.
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                      <Bell className="h-6 w-6 text-gray-700" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(announcement.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 whitespace-pre-wrap pl-16">
                  {announcement.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
