import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Users, BookOpen, CalendarDays } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        navigate(data.user.role === 'admin' ? '/admin' : '/student');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Left Side - Branding & Dashboard Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 text-white p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        
        <div className="relative z-10">
          <span className="text-2xl font-light tracking-tighter uppercase">Forex<br/>Institute</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-light tracking-tighter mb-6 leading-tight">
            Master the markets with institutional-grade education.
          </h1>
          <p className="text-zinc-400 text-lg mb-12 font-light">
            Access premium courses, live trading sessions, and a community of elite traders.
          </p>

          <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800">
            <div className="bg-zinc-900 p-6">
              <Users className="w-6 h-6 text-zinc-400 mb-4" />
              <div className="text-3xl font-light tracking-tighter mb-1">10k+</div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Active Students</div>
            </div>
            <div className="bg-zinc-900 p-6">
              <BookOpen className="w-6 h-6 text-zinc-400 mb-4" />
              <div className="text-3xl font-light tracking-tighter mb-1">50+</div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Premium Courses</div>
            </div>
            <div className="bg-zinc-900 p-6">
              <CalendarDays className="w-6 h-6 text-zinc-400 mb-4" />
              <div className="text-3xl font-light tracking-tighter mb-1">Daily</div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Live Sessions</div>
            </div>
            <div className="bg-zinc-900 p-6 flex flex-col justify-center items-start">
              <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center mb-4">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Join the Elite</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-zinc-500 font-light">
          &copy; {new Date().getFullYear()} Forex Institute. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative">
        <div className="lg:hidden mb-12">
          <span className="text-2xl font-light tracking-tighter text-zinc-900 uppercase">Forex<br/>Institute</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-light tracking-tighter text-zinc-900 mb-2">
              Welcome back
            </h2>
            <p className="text-zinc-500 font-light">
              Please enter your details to sign in.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 text-sm" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 text-zinc-900 focus:ring-0 focus:border-zinc-900 transition-colors sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-zinc-900 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 text-zinc-900 focus:ring-0 focus:border-zinc-900 transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-semibold uppercase tracking-widest text-white bg-zinc-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-colors"
              >
                Sign in <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-zinc-500">
                Contact your administrator for account access.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
