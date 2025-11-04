// src/routes/AppRoutes.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { RoleGuard } from '../components/guards/RoleGuard';
import { ROLES } from '../hooks/useRoles';
import { Dashboard } from '../features/dashboard/Dashboard';

// User Components
import { UserList } from '../features/users/UserList';
import { UserDetails } from '../features/users/UserDetails';
import { EditUser } from '../features/users/EditUser';
import { CreateUser } from '../features/users/CreateUser';
import { UserRolesPermissions } from '../features/users/UserRolesPermissions';

// Permission Components
import { PermissionsList } from '../features/permissions/PermissionsList';
import { CreatePermission } from '../features/permissions/CreatePermission';
import { EditPermission } from '../features/permissions/EditPermission';
import { UserPermissionsManagement } from '../features/permissions/UserPermissionsManagement';
import { PermissionUsers } from '../features/permissions/PermissionUsers';

// UserSite Components
import { UserSitesList } from '../features/usersites/UserSitesList';
import { CreateUserSite } from '../features/usersites/CreateUserSite';
import { EditUserSite } from '../features/usersites/EditUserSite';
import { UserSiteUsers } from '../features/usersites/UserSiteUsers';

// Site Components
import { FilialesList } from '../features/filiales/FilialesList';
import { CreateFiliale } from '../features/filiales/CreateFiliale';
import { EditFiliale } from '../features/filiales/EditFiliale';
import { SuccursalesList } from '../features/succursales/SuccursalesList';
import { CreateSuccursale } from '../features/succursales/CreateSuccursale';
import { EditSuccursale } from '../features/succursales/EditSuccursale';
import { SitesManagement } from '../features/sites/SitesManagement';

// Vehicle Components
import { MarqueManagement } from '../features/marques/MarqueManagement';
import { ModeleManagement } from '../features/modeles/ModeleManagement';
import { VersionManagement } from '../features/versions/VersionManagement';

// Objectif & Periode Components
import { ObjectifManagement } from '../features/objectifs/ObjectifManagement';
import { PeriodeManagement } from '../features/periodes/PeriodeManagement';

import { useAuthStore } from '../store/authStore';

const RedirectIfAuthenticated: React.FC<{ children: React.ReactElement }> = ({
  children,
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
        <Route element={<DashboardLayout />}>
          
          {/* ===== DASHBOARD ===== */}
          {/* Everyone can access dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ===== USERS ROUTES ===== */}
          {/* Only administrateur fonctionnel */}
          <Route
            path="/users"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <UserList />
              </RoleGuard>
            }
          />
          <Route
            path="/users/new"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <CreateUser />
              </RoleGuard>
            }
          />
          <Route
            path="/users/:id"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <UserDetails />
              </RoleGuard>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <EditUser />
              </RoleGuard>
            }
          />
          <Route
            path="/users/:id/roles-permissions"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <UserRolesPermissions />
              </RoleGuard>
            }
          />

          {/* ===== PERMISSIONS ROUTES ===== */}
          {/* Only administrateur fonctionnel */}
          <Route
            path="/permissions"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <PermissionsList />
              </RoleGuard>
            }
          />
          <Route
            path="/permissions/new"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <CreatePermission />
              </RoleGuard>
            }
          />
          <Route
            path="/permissions/:id/edit"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <EditPermission />
              </RoleGuard>
            }
          />
          <Route
            path="/permissions/:permissionId/users"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <PermissionUsers />
              </RoleGuard>
            }
          />

          {/* ===== USER SITES ROUTES ===== */}
          {/* Only administrateur fonctionnel */}
          <Route
            path="/user-sites"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <UserSitesList />
              </RoleGuard>
            }
          />
          <Route
            path="/user-sites/new"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <CreateUserSite />
              </RoleGuard>
            }
          />
          <Route
            path="/user-sites/:id/edit"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <EditUserSite />
              </RoleGuard>
            }
          />

          {/* ===== SITES MANAGEMENT ===== */}
          {/* Only administrateur fonctionnel */}
          <Route
            path="/sites"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <SitesManagement />
              </RoleGuard>
            }
          />

          {/* ===== FILIALES ROUTES ===== */}
          {/* Only administrateur fonctionnel */}
          <Route
            path="/filiales"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <FilialesList />
              </RoleGuard>
            }
          />
          <Route
            path="/filiales/new"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <CreateFiliale />
              </RoleGuard>
            }
          />
          <Route
            path="/filiales/:id/edit"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <EditFiliale />
              </RoleGuard>
            }
          />

          {/* ===== SUCCURSALES ROUTES ===== */}
          {/* Only administrateur fonctionnel */}
          <Route
            path="/succursales"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <SuccursalesList />
              </RoleGuard>
            }
          />
          <Route
            path="/succursales/new"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <CreateSuccursale />
              </RoleGuard>
            }
          />
          <Route
            path="/succursales/:id/edit"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <EditSuccursale />
              </RoleGuard>
            }
          />

          {/* ===== VEHICLES ROUTES ===== */}
          {/* Only administrateur fonctionnel */}
          <Route
            path="/marques"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <MarqueManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/modeles"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <ModeleManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/versions"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <VersionManagement />
              </RoleGuard>
            }
          />

          {/* ===== PERIODE ROUTES ===== */}
          {/* Only administrateur fonctionnel */}
          <Route
            path="/periodes"
            element={
              <RoleGuard roles={[ROLES.ADMIN_FONCTIONNEL]} redirectTo="/dashboard">
                <PeriodeManagement />
              </RoleGuard>
            }
          />

          {/* ===== OBJECTIF ROUTES ===== */}
          {/* Both administrateur fonctionnel and intégrateur des objectifs */}
          <Route
            path="/objectifs"
            element={
              <RoleGuard
                roles={[ROLES.ADMIN_FONCTIONNEL, ROLES.INTEGRATEUR_OBJECTIFS]}
                redirectTo="/dashboard"
              >
                <ObjectifManagement />
              </RoleGuard>
            }
          />

          {/* ===== ERROR ROUTES ===== */}
          <Route
            path="/unauthorized"
            element={
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h4">Access Denied</Typography>
                <Typography>You don't have permission to access this page.</Typography>
              </Box>
            }
          />

          {/* ===== DEFAULT ROUTES ===== */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
