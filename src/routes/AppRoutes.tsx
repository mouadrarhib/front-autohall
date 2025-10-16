// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Dashboard } from '../features/dashboard/Dashboard';

// User Components
import { UserList } from '../features/users/UserList';
import { UserDetails } from '../features/users/UserDetails';
import { EditUser } from '../features/users/EditUser';

// Permission Components
import { PermissionsList } from '../features/permissions/PermissionsList';
import { CreatePermission } from '../features/permissions/CreatePermission';
import { EditPermission } from '../features/permissions/EditPermission';
import { UserPermissionsManagement } from '../features/permissions/UserPermissionsManagement';

// UserSite Components
import { UserSitesList } from '../features/usersites/UserSitesList';
import { CreateUserSite } from '../features/usersites/CreateUserSite';
import { EditUserSite } from '../features/usersites/EditUserSite';
import { FilialesList } from '../features/filiales/FilialesList';
import { CreateFiliale } from '../features/filiales/CreateFiliale';
import { EditFiliale } from '../features/filiales/EditFiliale';
import { SuccursalesList } from '../features/succursales/SuccursalesList';
import { CreateSuccursale } from '../features/succursales/CreateSuccursale';
import { EditSuccursale } from '../features/succursales/EditSuccursale';

import { useAuthStore } from '../store/authStore';
import { CreateUser } from '../features/users/CreateUser';
import { UserSiteUsers } from '../features/usersites/UserSiteUsers';
import { PermissionUsers } from '../features/permissions/PermissionUsers';
import { UserRolesPermissions } from '../features/users/UserRolesPermissions';

import { GroupementManagement } from '../features/groupement/GroupementManagement';



const RedirectIfAuthenticated: React.FC<{ children: React.ReactElement }> = ({ 
  children 
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route 
        path="/login" 
        element={
          <RedirectIfAuthenticated>
            <LoginForm />
          </RedirectIfAuthenticated>
        } 
      />

      {/* ==================== PROTECTED ROUTES ==================== */}
      <Route element={<ProtectedRoute />}>
        {/* All routes inside DashboardLayout will have sidebar + header */}
        <Route element={<DashboardLayout />}>
          
          {/* ===== DASHBOARD ===== */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* ===== USERS ROUTES ===== */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:userId" element={<UserDetails />} />
          <Route path="/users/:userId/edit" element={<UserRolesPermissions />}/>
          <Route path="/users/:userId/permissions" element={<UserPermissionsManagement />} />
          
          {/* ===== PERMISSIONS ROUTES ===== */}
          <Route path="/permissions" element={<PermissionsList />} />
          <Route path="/permissions/create" element={<CreatePermission />} />
          <Route path="/permissions/:permissionId/edit" element={<EditPermission />} />
          <Route path="/permissions/:permissionId/users" element={<PermissionUsers />} />
          
          {/* ===== USER SITES ROUTES ===== */}
          <Route path="/user-sites" element={<UserSitesList />} />
          <Route path="/user-sites/create" element={<CreateUserSite />} />
          <Route path="/user-sites/:usersiteId/edit" element={<EditUserSite />} />
          
          {/* ===== FILIALES ROUTES ===== */}
          <Route path="/filiales" element={<FilialesList />} />
          <Route path="/filiales/create" element={<CreateFiliale />} />
          <Route path="/filiales/:filialeId/edit" element={<EditFiliale />} />
          
          {/* ===== SUCCURSALES ROUTES ===== */}
          <Route path="/succursales" element={<SuccursalesList />} />
          <Route path="/succursales/create" element={<CreateSuccursale />} />
          <Route path="/succursales/:succursaleId/edit" element={<EditSuccursale />} />
          
          {/* ===== OTHER ROUTES ===== */}
          <Route path="/vehicles" element={<div>Vehicles Page</div>} />
          <Route path="/users/create" element={<CreateUser />} />
          <Route path="/user-sites/:usersiteId/users" element={<UserSiteUsers />} />

          <Route path="/groupement" element={<GroupementManagement />} />

          
        </Route>
      </Route>

      {/* ==================== ERROR ROUTES ==================== */}
      <Route 
        path="/unauthorized" 
        element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
          </div>
        } 
      />

      {/* ==================== DEFAULT ROUTES ==================== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
