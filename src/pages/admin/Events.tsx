import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, Users, Download, Upload, Eye } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';

interface Event {
  id: string | number;
  title: string;
  description: string;
  date: string;
  time: string;
  meeting_link: string;
  location: string;
  rsvp_count?: number;
}

export default function AdminEvents() {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});
  const [attendees, setAttendees] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEvents = async () => {
    const res = await fetch('/api/events', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setEvents(await res.json());
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchAttendees = async (eventId: number) => {
    const res = await fetch(`/api/events/${eventId}/attendees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setAttendees(await res.json());
    }
  };

  const handleViewDetails = (event: Event) => {
    setCurrentEvent(event);
    fetchAttendees(event.id);
    setIsDetailsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = currentEvent.id ? `/api/events/${currentEvent.id}` : '/api/events';
    const method = currentEvent.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(currentEvent)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setCurrentEvent({});
      fetchEvents();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) fetchEvents();
  };

  const handleExport = () => {
    exportToExcel(events, 'Events');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      await Promise.all(data.map(async (event: any) => {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(event)
        });
      }));
      fetchEvents();
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
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Events Management</h1>
          <p className="mt-2 text-sm text-gray-500">Manage upcoming webinars, live sessions, and track RSVPs.</p>
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
            onClick={() => { setCurrentEvent({}); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Event
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl">
        <ul className="divide-y divide-gray-100">
          {events.map((event) => (
            <li key={event.id} className="hover:bg-gray-50 transition-colors duration-150">
              <div className="px-6 py-5 flex items-center">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="flex text-base">
                      <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-0">
                      <div className="flex items-center">
                        <p>{event.date} at {event.time}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <p>{event.location || 'Online'}</p>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <a href={event.meeting_link} target="_blank" rel="noreferrer" className="text-gray-900 font-medium hover:underline">Join Meeting</a>
                        <span className="mx-3 text-gray-300">&middot;</span>
                        <Users className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>{event.rsvp_count || 0} RSVPs</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex space-x-3">
                  <button
                    onClick={() => handleViewDetails(event)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                    title="View Details & Attendees"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => { setCurrentEvent(event); setIsModalOpen(true); }}
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {events.length === 0 && (
            <li className="px-6 py-12 text-center text-gray-500 text-sm">
              No events found. Click "Add Event" to create one.
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
                  {currentEvent.id ? 'Edit Event' : 'Add Event'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" required value={currentEvent.title || ''} onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input type="date" required value={currentEvent.date || ''} onChange={e => setCurrentEvent({...currentEvent, date: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input type="time" required value={currentEvent.time || ''} onChange={e => setCurrentEvent({...currentEvent, time: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" placeholder="e.g., Room 101, Online" value={currentEvent.location || ''} onChange={e => setCurrentEvent({...currentEvent, location: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                      <input type="url" required value={currentEvent.meeting_link || ''} onChange={e => setCurrentEvent({...currentEvent, meeting_link: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={currentEvent.description || ''} onChange={e => setCurrentEvent({...currentEvent, description: e.target.value})} className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition-colors" rows={4}></textarea>
                  </div>
                  <div className="mt-8 sm:flex sm:flex-row-reverse pt-4 border-t border-gray-100">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                      Save Event
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
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-25 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 border border-gray-100 relative z-10">
              <div>
                <h3 className="text-2xl font-medium text-gray-900 mb-4" id="modal-title">
                  {currentEvent.title}
                </h3>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium text-gray-900">{currentEvent.date} at {currentEvent.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{currentEvent.location || 'Online'}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Meeting Link</p>
                    <a href={currentEvent.meeting_link} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800 break-all">{currentEvent.meeting_link}</a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{currentEvent.description}</p>
                  </div>
                </div>

                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gray-500" />
                  Attendees ({attendees.length})
                </h4>
                
                <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl">
                  {attendees.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {attendees.map((attendee, idx) => (
                        <li key={idx} className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center">
                          <span className="font-medium text-gray-900">{attendee.name}</span>
                          <span className="text-sm text-gray-500">{attendee.email}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No students have RSVP'd yet.
                    </div>
                  )}
                </div>

                <div className="mt-6 sm:flex sm:flex-row-reverse">
                  <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="w-full inline-flex justify-center rounded-xl border border-gray-200 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 sm:w-auto sm:text-sm transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


