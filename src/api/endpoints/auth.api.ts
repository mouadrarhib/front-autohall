// src/api/endpoints/auth.api.ts
import { apiClient, ApiResponse } from '../client';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  UserProfile,
  UserRole,
  UserPermission,
  CreateUserCompleteRequest,
  PaginatedPermissionsResponse
} from '../../types/auth.types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      credentials
    );
    
    console.log('Login response:', data);
    // Backend returns: { success: true, message: "...", data: { user } }
    // Token is in cookie, not in response
    return data.data;
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/register',
      userData
    );
    console.log('Register response:', data);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>('/api/auth/me');
    console.log('Profile response:', data);
    return data.data;
  },

  getMyRoles: async (params?: { 
    includeInactive?: boolean; 
    page?: number; 
    pageSize?: number 
  }): Promise<UserRole[]> => {
    const { data } = await apiClient.get<ApiResponse<{ data: UserRole[] }>>(
      '/api/auth/me/roles',
      { params }
    );
    console.log('Roles response:', data);
    
    // Backend returns: { success: true, data: { data: [...], pagination: {...} } }
    return data.data.data || [];
  },

  getMyPermissions: async (params?: { 
    includeInactive?: boolean; 
    page?: number; 
    pageSize?: number 
  }): Promise<UserPermission[]> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedPermissionsResponse>>(
      '/api/auth/me/permissions',
      { 
        params: {
          ...params,
          pageSize: params?.pageSize || 1000 // Get all permissions
        }
      }
    );
    console.log('Permissions response:', data);
    
    // Backend returns: { success: true, data: { data: [...], pagination: {...} } }
    return data.data.data || [];
  },

  createUserComplete: async (userData: CreateUserCompleteRequest) => {
    const { data } = await apiClient.post('/api/auth/create-user-complete', userData);
    return data.data;
  },

  getAllUsers: async (params?: { 
    site_type?: 'filiale' | 'succursale'; 
    active_only?: boolean 
  }) => {
    const { data } = await apiClient.get('/api/auth/users', { params });
    return data.data;
  },

  getUserCompleteInfo: async (userId: number) => {
    const { data } = await apiClient.get(`/api/auth/users/${userId}/complete`);
    return data.data;
  },

  getAvailableSites: async () => {
    const { data } = await apiClient.get('/api/auth/sites');
    return data.data;
  },
};
