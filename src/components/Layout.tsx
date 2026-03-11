import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, BookOpen, Video, CalendarDays, 
  Calendar, CreditCard, Bell, FileText, LogOut, Menu, X, UserCircle
} from 'lucide-react';
import Notifications from './Notifications';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Video Lessons', path: '/admin/lessons', icon: Video },
    { name: 'Batches', path: '/admin/batches', icon: CalendarDays },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Study Resources', path: '/admin/resources', icon: FileText },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Courses', path: '/student/courses', icon: BookOpen },
    { name: 'Video Lessons', path: '/student/lessons', icon: Video },
    { name: 'Events', path: '/student/events', icon: Calendar },
    { name: 'Announcements', path: '/student/announcements', icon: Bell },
    { name: 'Study Resources', path: '/student/resources', icon: FileText },
    { name: 'Payment', path: '/student/payment', icon: CreditCard },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="bg-white border-b border-zinc-200 lg:hidden flex items-center justify-between px-6 h-20 shrink-0">
        <span className="text-xl font-light tracking-tighter text-zinc-900 uppercase">Forex<br/>Institute</span>
        <div className="flex items-center gap-4">
          <Notifications />
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/10 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 lg:border-r lg:border-zinc-200 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-24 px-8 border-b border-zinc-200 shrink-0">
          <span className="text-xl font-light tracking-tighter text-zinc-900 uppercase">Forex<br/>Institute</span>
          <div className="hidden lg:block">
            <Notifications />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 -mr-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 border-b border-zinc-200 shrink-0">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Logged in as</p>
          <p className="text-lg font-medium text-zinc-900 truncate">{user?.name}</p>
          <p className="text-sm text-zinc-500 capitalize">{user?.role}</p>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 text-sm transition-all
                  ${isActive 
                    ? 'text-zinc-900 font-medium bg-zinc-50' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/50'}
                `}
              >
                <Icon className={`mr-4 h-4 w-4 flex-shrink-0 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 shrink-0 space-y-1">
          <Link
            to={user?.role === 'admin' ? '/admin/profile' : '/student/profile'}
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center px-4 py-3 text-sm transition-all
              ${location.pathname.includes('/profile')
                ? 'text-zinc-900 font-medium bg-zinc-50' 
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/50'}
            `}
          >
            <UserCircle className={`mr-4 h-4 w-4 flex-shrink-0 ${location.pathname.includes('/profile') ? 'text-zinc-900' : 'text-zinc-400'}`} />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg"
          >
            <LogOut className="mr-4 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-white flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
