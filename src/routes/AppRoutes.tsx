// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { UserList } from '../features/users/UserList';
import { UserDetails } from '../features/users/UserDetails';
import { EditUser } from '../features/users/EditUser';
import { Dashboard } from '../features/dashboard/Dashboard';
import { PermissionsList } from '../features/permissions/PermissionsList';
import { CreatePermission } from '../features/permissions/CreatePermission';
import { EditPermission } from '../features/permissions/EditPermission';
import { UserPermissionsManagement } from '../features/permissions/UserPermissionsManagement';
import { useAuthStore } from '../store/authStore';

const RedirectIfAuthenticated: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <RedirectIfAuthenticated>
            <LoginForm />
          </RedirectIfAuthenticated>
        } 
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Users Routes */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:userId" element={<UserDetails />} />
          <Route path="/users/:userId/edit" element={<EditUser />} />
          <Route 
            path="/users/:userId/permissions" 
            element={
              <ProtectedRoute requiredPermissions={['PERMISSION_LINK_READ']} />
            }
          >
            <Route index element={<UserPermissionsManagement />} />
          </Route>
          
          {/* Permissions Routes */}
          <Route 
            path="/permissions" 
            element={
              <ProtectedRoute requiredPermissions={['PERMISSION_READ']} />
            }
          >
            <Route index element={<PermissionsList />} />
          </Route>
          
          <Route 
            path="/permissions/create" 
            element={
              <ProtectedRoute requiredPermissions={['PERMISSION_CREATE']} />
            }
          >
            <Route index element={<CreatePermission />} />
          </Route>
          
          <Route 
            path="/permissions/:permissionId/edit" 
            element={
              <ProtectedRoute requiredPermissions={['PERMISSION_UPDATE']} />
            }
          >
            <Route index element={<EditPermission />} />
          </Route>
          
          <Route 
            path="/permissions/:permissionId/users" 
            element={
              <ProtectedRoute requiredPermissions={['PERMISSION_LINK_READ']} />
            }
          >
            <Route index element={<div>Users with Permission Page</div>} />
          </Route>

          <Route path="/vehicles" element={<div>Vehicles Page</div>} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
