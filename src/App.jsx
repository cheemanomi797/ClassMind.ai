import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Classes from './pages/Classes';
import AdminCourseAnalytics from './pages/AdminCourseAnalytics';
import AdminSettings from './pages/AdminSettings';
import Analytics from './pages/Analytics';
import SystemOverview from './pages/SystemOverview';
import StudentDashboard from './pages/StudentDashboard';
import StudentNotifications from './pages/StudentNotifications';
import ClassDetail from './pages/ClassDetail';
import MaterialDetail from './pages/MaterialDetail';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherCourseDetails from './pages/TeacherCourseDetails';
import TeacherStudentTracking from './pages/TeacherStudentTracking';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherUpload from './pages/TeacherUpload';
import TeacherReschedule from './pages/TeacherReschedule';
import MainLayout from './components/MainLayout';
import './App.css';

/* eslint-disable react-refresh/only-export-components */
// Protected Route utilizing MainLayout
const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <MainLayout />;
};

const LandingPage = () => {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'student') return <StudentDashboard />;
  if (currentUser?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <SystemOverview />;
};

function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                {/* Home route dynamically renders dashboard based on role */}
                <Route path="/" element={<LandingPage />} />

                {/* Admin specific routes could be restricted further with a RoleGate wrapper if needed */}
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/students" element={<Students />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/analytics/:courseId" element={<AdminCourseAnalytics />} />
                <Route path="/admin/course/:courseId/analytics" element={<AdminCourseAnalytics />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="/analytics" element={<Analytics />} />

                {/* Student specific routes */}
                <Route path="/notifications" element={<StudentNotifications />} />
                <Route path="/class/:id" element={<ClassDetail />} />
                <Route path="/material/:id" element={<MaterialDetail />} />

                {/* Teacher specific routes */}
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/course/:courseId" element={<TeacherCourseDetails />} />
                <Route path="/teacher/course/:courseId/tracking" element={<TeacherStudentTracking />} />
                <Route path="/teacher/course/:courseId/analytics" element={<TeacherAnalytics />} />
                <Route path="/teacher/course/:courseId/upload" element={<TeacherUpload />} />
                <Route path="/teacher/course/:courseId/reschedule" element={<TeacherReschedule />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;
