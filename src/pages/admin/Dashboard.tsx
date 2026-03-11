import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, BookOpen, CalendarDays, Calendar, CreditCard, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    batches: 0,
    events: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    fetchStats();
  }, [token]);

  const statCards = [
    { name: 'Total Students', value: stats.students, icon: Users, path: '/admin/students' },
    { name: 'Total Courses', value: stats.courses, icon: BookOpen, path: '/admin/courses' },
    { name: 'Active Batches', value: stats.batches, icon: CalendarDays, path: '/admin/batches' },
    { name: 'Upcoming Events', value: stats.events, icon: Calendar, path: '/admin/events' },
    { name: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard, path: '/admin/payments' },
  ];

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto p-8 lg:p-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-8 mb-12">
          <div>
            <h1 className="text-6xl font-light tracking-tighter text-zinc-900">Overview</h1>
          </div>
          <div className="mt-4 md:mt-0 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
          {/* Main Card */}
          <div className="md:col-span-2 bg-white p-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[300px]">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Total Students</p>
                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center bg-white">
                  <Users className="w-5 h-5 text-zinc-900" />
                </div>
              </div>
              <div className="mt-12 flex items-end justify-between">
                <span className="text-8xl font-light tracking-tighter text-zinc-900">{stats.students}</span>
                <Link to="/admin/students" className="text-sm font-medium text-zinc-900 hover:text-zinc-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
                  Explore <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Other Cards */}
          {statCards.slice(1).map((stat) => {
            const Icon = stat.icon;
            return (
              <Link 
                key={stat.name} 
                to={stat.path}
                className="bg-white p-10 flex flex-col justify-between min-h-[300px] group hover:bg-zinc-50 transition-colors relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">{stat.name}</p>
                    <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center bg-white">
                      <Icon className="w-5 h-5 text-zinc-900" />
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <div className="mt-12">
                  <span className="text-6xl font-light tracking-tighter text-zinc-900">{stat.value}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


