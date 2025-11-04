// src/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type UserCompleteInfo } from '../api/endpoints/auth.api';
import type { UserProfile, UserPermission, UserRole } from '../types/auth.types';

interface AuthState {
  user: UserProfile | null;
  userDetails: UserCompleteInfo | null;
  permissions: string[];
  roles: UserRole[];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasLoadedOnce: boolean;
  lastActivity: number | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateLastActivity: () => void;
  clearSession: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
}

const enrichUserProfile = (
  user: UserProfile,
  details?: UserCompleteInfo | null
): UserProfile => {
  if (!details) {
    return user;
  }

  const augmented: Record<string, any> = { ...user };

  const siteName =
    details.siteName ??
    details.raw?.SiteName ??
    details.raw?.siteName ??
    augmented.site_name ??
    augmented.SiteName;

  if (siteName) {
    augmented.site_name = siteName;
    augmented.siteName = siteName;
    augmented.SiteName = siteName;
  }

  const siteId =
    details.siteId ??
    details.raw?.SiteId ??
    details.raw?.siteId ??
    augmented.siteId ??
    augmented.SiteId ??
    null;

  if (siteId != null) {
    augmented.siteId = siteId;
    augmented.SiteId = siteId;
  }

  const userSiteId =
    details.userSiteId ??
    details.raw?.UserSiteId ??
    details.raw?.userSiteId ??
    augmented.idUserSite ??
    null;

  if (userSiteId != null) {
    augmented.idUserSite = userSiteId;
    augmented.UserSiteId = userSiteId;
  }

  const groupementType =
    details.groupementType ??
    details.raw?.GroupementType ??
    details.raw?.groupementType ??
    augmented.groupement_type ??
    augmented.GroupementType;

  if (groupementType) {
    augmented.groupement_type = groupementType;
    augmented.groupementName = groupementType;
    augmented.GroupementType = groupementType;
  }

  if (details.userSiteActive !== undefined && details.userSiteActive !== null) {
    augmented.userSiteActive = details.userSiteActive;
    augmented.UserSiteActive = details.userSiteActive;
  }

  if (details.userStatus) {
    augmented.userStatus = details.userStatus;
  }

  if (details.lastActivity) {
    augmented.lastActivity = details.lastActivity;
  }

  return augmented as UserProfile;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userDetails: null,
      permissions: [],
      roles: [],
      isAuthenticated: false,
      isLoading: false,
      hasLoadedOnce: false,
      lastActivity: null,

      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true });
          console.log('Attempting login...');
          const response = await authApi.login({ username, password });
          console.log('Login response received:', response);

          if (!response.user) {
            throw new Error('Invalid response: user data missing');
          }

          let userDetails: UserCompleteInfo | null = null;

          if (response.user?.id != null) {
            try {
              userDetails = await authApi.getUserCompleteInfo(response.user.id);
            } catch (detailError) {
              console.error('Failed to load complete user info:', detailError);
            }
          }

          const enhancedUser = enrichUserProfile(response.user, userDetails);

          try {
            const [permissionsData, rolesData] = await Promise.all([
              authApi.getMyPermissions({ pageSize: 1000 }),
              authApi.getMyRoles({ pageSize: 1000 })
            ]);

            console.log('Permissions data:', permissionsData);
            console.log('Roles data:', rolesData);

            const permissionNames = permissionsData.map((p: UserPermission) => p.PermissionName);
            console.log('Extracted permission names:', permissionNames);
            console.log('Extracted roles:', rolesData);

            set({
              user: enhancedUser,
              userDetails,
              permissions: permissionNames,
              roles: rolesData,
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
              lastActivity: Date.now(),
            });
            console.log('Login successful, state updated');
          } catch (dataError) {
            console.error('Error fetching permissions/roles:', dataError);
            set({
              user: enhancedUser,
              userDetails,
              permissions: [],
              roles: [],
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
              lastActivity: Date.now(),
            });
          }
        } catch (error: any) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          console.log('Attempting registration...');
          const response = await authApi.register(userData);
          console.log('Register response received:', response);

          if (!response.user) {
            throw new Error('Invalid response: user data missing');
          }

          let userDetails: UserCompleteInfo | null = null;
          if (response.user?.id != null) {
            try {
              userDetails = await authApi.getUserCompleteInfo(response.user.id);
            } catch (detailError) {
              console.error('Failed to load complete user info after registration:', detailError);
            }
          }

          const enhancedUser = enrichUserProfile(response.user, userDetails);

          try {
            const [permissionsData, rolesData] = await Promise.all([
              authApi.getMyPermissions({ pageSize: 1000 }),
              authApi.getMyRoles({ pageSize: 1000 })
            ]);

            const permissionNames = permissionsData.map((p: UserPermission) => p.PermissionName);

            set({
              user: enhancedUser,
              userDetails,
              permissions: permissionNames,
              roles: rolesData,
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
              lastActivity: Date.now(),
            });
          } catch (dataError) {
            console.error('Error fetching permissions/roles:', dataError);
            set({
              user: enhancedUser,
              userDetails,
              permissions: [],
              roles: [],
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
              lastActivity: Date.now(),
            });
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          console.log('Performing logout...');
          await authApi.logout();
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          get().clearSession();
        }
      },

      clearSession: () => {
        console.log('Clearing session...');
        set({
          user: null,
          userDetails: null,
          permissions: [],
          roles: [],
          isAuthenticated: false,
          hasLoadedOnce: true,
          lastActivity: null,
        });
      },

      loadUser: async () => {
        if (get().isLoading || get().hasLoadedOnce) {
          console.log('Skipping loadUser - already loaded or loading');
          return;
        }

        try {
          set({ isLoading: true });
          console.log('Loading user profile...');
          const user = await authApi.getProfile();
          console.log('User profile loaded:', user);

          let userDetails: UserCompleteInfo | null = null;
          if (user?.id != null) {
            try {
              userDetails = await authApi.getUserCompleteInfo(user.id);
            } catch (detailError) {
              console.error('Failed to load complete user info during loadUser:', detailError);
            }
          }

          const enhancedUser = enrichUserProfile(user, userDetails);

          try {
            const [permissionsData, rolesData] = await Promise.all([
              authApi.getMyPermissions({ pageSize: 1000 }),
              authApi.getMyRoles({ pageSize: 1000 })
            ]);

            const permissionNames = permissionsData.map((p: UserPermission) => p.PermissionName);

            set({
              user: enhancedUser,
              userDetails,
              permissions: permissionNames,
              roles: rolesData,
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
              lastActivity: Date.now(),
            });
          } catch (dataError) {
            console.error('Error fetching permissions/roles:', dataError);
            set({
              user: enhancedUser,
              userDetails,
              permissions: [],
              roles: [],
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
              lastActivity: Date.now(),
            });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          get().clearSession();
        }
      },

      updateLastActivity: () => {
        if (get().isAuthenticated) {
          set({ lastActivity: Date.now() });
        }
      },

      hasPermission: (permission: string) => {
        return get().permissions.includes(permission);
      },

      hasAnyPermission: (permissions: string[]) => {
        const userPerms = get().permissions;
        return permissions.some(p => userPerms.includes(p));
      },

      hasAllPermissions: (permissions: string[]) => {
        const userPerms = get().permissions;
        return permissions.every(p => userPerms.includes(p));
      },

      hasRole: (roleName: string) => {
        const userRoles = get().roles;
        return userRoles.some(
          role => {
            // Handle different possible property names
            const name = (role as any).RoleName || (role as any).name || (role as any).roleName || '';
            return name.toLowerCase().trim() === roleName.toLowerCase().trim();
          }
        );
      },

      hasAnyRole: (roleNames: string[]) => {
        return roleNames.some(roleName => get().hasRole(roleName));
      },

      hasAllRoles: (roleNames: string[]) => {
        return roleNames.every(roleName => get().hasRole(roleName));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        userDetails: state.userDetails,
        permissions: state.permissions,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
        hasLoadedOnce: state.hasLoadedOnce,
        lastActivity: state.lastActivity,
      }),
    }
  )
);
