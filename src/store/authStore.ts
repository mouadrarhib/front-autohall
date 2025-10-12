// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/endpoints/auth.api';
import type { UserProfile, UserPermission } from '../types/auth.types';

interface AuthState {
  user: UserProfile | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasLoadedOnce: boolean; // Add flag to prevent multiple loads
  
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      hasLoadedOnce: false,

      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true });
          console.log('Attempting login...');
          
          const response = await authApi.login({ username, password });
          console.log('Login response received:', response);
          
          if (!response.user) {
            throw new Error('Invalid response: user data missing');
          }
          
          // Fetch permissions
          try {
            const permissionsData = await authApi.getMyPermissions({ pageSize: 1000 });
            console.log('Permissions data:', permissionsData);
            
            const permissionNames = permissionsData.map((p: UserPermission) => p.PermissionName);
            console.log('Extracted permission names:', permissionNames);
            
            set({
              user: response.user,
              permissions: permissionNames,
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
            });
            
            console.log('Login successful, state updated');
          } catch (permError) {
            console.error('Error fetching permissions:', permError);
            set({
              user: response.user,
              permissions: [],
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
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
          
          try {
            const permissionsData = await authApi.getMyPermissions({ pageSize: 1000 });
            const permissionNames = permissionsData.map((p: UserPermission) => p.PermissionName);
            
            set({
              user: response.user,
              permissions: permissionNames,
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
            });
          } catch (permError) {
            console.error('Error fetching permissions:', permError);
            set({
              user: response.user,
              permissions: [],
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
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
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            permissions: [],
            isAuthenticated: false,
            hasLoadedOnce: true,
          });
        }
      },

      loadUser: async () => {
        // Prevent multiple simultaneous loads
        if (get().isLoading || get().hasLoadedOnce) {
          console.log('Skipping loadUser - already loaded or loading');
          return;
        }

        try {
          set({ isLoading: true });
          console.log('Loading user profile...');
          
          const user = await authApi.getProfile();
          console.log('User profile loaded:', user);
          
          try {
            const permissionsData = await authApi.getMyPermissions({ pageSize: 1000 });
            const permissionNames = permissionsData.map((p: UserPermission) => p.PermissionName);
            
            set({
              user,
              permissions: permissionNames,
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
            });
          } catch (permError) {
            console.error('Error fetching permissions:', permError);
            set({
              user,
              permissions: [],
              isAuthenticated: true,
              isLoading: false,
              hasLoadedOnce: true,
            });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          set({
            user: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
            hasLoadedOnce: true,
          });
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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        hasLoadedOnce: state.hasLoadedOnce,
      }),
    }
  )
);
