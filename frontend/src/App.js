import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Auth pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Dashboard pages
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import FacultyDashboard from './pages/Dashboard/FacultyDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

// Activity pages
import ActivitiesList from './pages/Activities/ActivitiesList';
import ActivityDetails from './pages/Activities/ActivityDetails';
import AddActivity from './pages/Activities/AddActivity';
import EditActivity from './pages/Activities/EditActivity';

// Approval pages
import ApprovalsPage from './pages/Approvals/ApprovalsPage';

// Profile pages
import ProfilePage from './pages/Profile/ProfilePage';

// Reports pages
import ReportsPage from './pages/Reports/ReportsPage';

// Users pages (Admin only)
import UsersPage from './pages/Users/UsersPage';

// Error pages
import NotFoundPage from './pages/Error/NotFoundPage';
import UnauthorizedPage from './pages/Error/UnauthorizedPage';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Helper function to get dashboard path based on role
const getDashboardPath = (role) => {
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'faculty':
      return '/dashboard/faculty';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/dashboard/student';
  }
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Routes */}
        <Route index element={<DashboardRedirect />} />
        <Route
          path="dashboard/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/faculty"
          element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Activity Routes */}
        <Route path="activities" element={<ActivitiesList />} />
        <Route path="activities/:id" element={<ActivityDetails />} />
        <Route
          path="activities/new"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AddActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="activities/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <EditActivity />
            </ProtectedRoute>
          }
        />

        {/* Approval Routes */}
        <Route
          path="approvals"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <ApprovalsPage />
            </ProtectedRoute>
          }
        />

        {/* Profile Route */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Reports Routes */}
        <Route path="reports" element={<ReportsPage />} />

        {/* Users Routes (Admin only) */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// Component to redirect to appropriate dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();
  const dashboardPath = getDashboardPath(user?.role);
  return <Navigate to={dashboardPath} replace />;
};

export default App;
