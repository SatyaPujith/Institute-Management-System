import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Video, CheckCircle, BellRing } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  meeting_link: string;
  has_rsvped?: boolean;
  rsvp_count?: number;
}

export default function StudentEvents() {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

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

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const checkUpcomingEvents = () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const now = new Date();
        events.forEach(event => {
          if (event.has_rsvped) {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            const timeDiff = eventDateTime.getTime() - now.getTime();
            // Notify if event is exactly 15 minutes away (within a 1 minute window)
            if (timeDiff > 14 * 60 * 1000 && timeDiff <= 15 * 60 * 1000) {
              new Notification('Upcoming Event', {
                body: `${event.title} is starting in 15 minutes!`,
                icon: '/vite.svg'
              });
            }
          }
        });
      }
    };

    const interval = setInterval(checkUpcomingEvents, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events]);

  const toggleRSVP = async (event: Event) => {
    const method = event.has_rsvped ? 'DELETE' : 'POST';
    const res = await fetch(`/api/events/${event.id}/rsvp`, {
      method,
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      fetchEvents();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">Upcoming Events & Webinars</h1>
        <p className="mt-2 text-sm text-gray-500">Join live sessions and interact with instructors.</p>
      </div>
      
      {events.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for new scheduled sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                    <Calendar className="h-6 w-6 text-gray-700" aria-hidden="true" />
                  </div>
                  {event.has_rsvped && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      Attending
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed line-clamp-3 flex-1">{event.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 flex justify-center"><Calendar className="h-4 w-4 text-gray-400" /></div>
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 flex justify-center"><Clock className="h-4 w-4 text-gray-400" /></div>
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-8 flex justify-center"><CheckCircle className="h-4 w-4 text-gray-400" /></div>
                    {event.rsvp_count || 0} attending
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3 mt-auto">
                  <button
                    onClick={() => toggleRSVP(event)}
                    className={`w-full inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${
                      event.has_rsvped
                        ? 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                        : 'border border-transparent text-white bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    <BellRing className="h-4 w-4 mr-2" />
                    {event.has_rsvped ? 'Cancel RSVP' : 'RSVP Now'}
                  </button>
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  >
                    <Video className="h-4 w-4 mr-2 text-gray-400" />
                    Join Meeting
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
