// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { UserList } from '../features/users/UserList';
import { Dashboard } from '../features/dashboard/Dashboard';
import { useAuthStore } from '../store/authStore';

const RedirectIfAuthenticated: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    console.log('Already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes - redirect if already logged in */}
      <Route 
        path="/login" 
        element={
          <RedirectIfAuthenticated>
            <LoginForm />
          </RedirectIfAuthenticated>
        } 
      />
      <Route 
        path="/register" 
        element={
          <RedirectIfAuthenticated>
            <div>Register Page</div>
          </RedirectIfAuthenticated>
        } 
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/permissions" element={<div>Permissions Page</div>} />
          <Route path="/vehicles" element={<div>Vehicles Page</div>} />
        </Route>
      </Route>

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
