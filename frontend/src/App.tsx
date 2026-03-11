/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import Layout from './components/Layout';
import AdminStudents from './pages/admin/Students';
import AdminCourses from './pages/admin/Courses';
import AdminLessons from './pages/admin/Lessons';
import AdminBatches from './pages/admin/Batches';
import AdminEvents from './pages/admin/Events';
import AdminPayments from './pages/admin/Payments';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminResources from './pages/admin/Resources';

// Student Pages
import StudentCourses from './pages/student/Courses';
import StudentLessons from './pages/student/Lessons';
import StudentEvents from './pages/student/Events';
import StudentAnnouncements from './pages/student/Announcements';
import StudentResources from './pages/student/Resources';
import StudentPayment from './pages/student/Payment';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Admin Routes */}
            <Route path="admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/students" element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />
            <Route path="admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
            <Route path="admin/lessons" element={<ProtectedRoute role="admin"><AdminLessons /></ProtectedRoute>} />
            <Route path="admin/batches" element={<ProtectedRoute role="admin"><AdminBatches /></ProtectedRoute>} />
            <Route path="admin/events" element={<ProtectedRoute role="admin"><AdminEvents /></ProtectedRoute>} />
            <Route path="admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
            <Route path="admin/announcements" element={<ProtectedRoute role="admin"><AdminAnnouncements /></ProtectedRoute>} />
            <Route path="admin/resources" element={<ProtectedRoute role="admin"><AdminResources /></ProtectedRoute>} />
            <Route path="admin/profile" element={<ProtectedRoute role="admin"><Profile /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="student/courses" element={<ProtectedRoute role="student"><StudentCourses /></ProtectedRoute>} />
            <Route path="student/lessons" element={<ProtectedRoute role="student"><StudentLessons /></ProtectedRoute>} />
            <Route path="student/events" element={<ProtectedRoute role="student"><StudentEvents /></ProtectedRoute>} />
            <Route path="student/announcements" element={<ProtectedRoute role="student"><StudentAnnouncements /></ProtectedRoute>} />
            <Route path="student/resources" element={<ProtectedRoute role="student"><StudentResources /></ProtectedRoute>} />
            <Route path="student/payment" element={<ProtectedRoute role="student"><StudentPayment /></ProtectedRoute>} />
            <Route path="student/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />
            
            <Route index element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
