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
import { UsersListResponse } from '../../types/user.types';

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

  createUserComplete: async (userData: any): Promise<any> => {
  const response = await apiClient.post('/api/auth/users/complete', userData);
  return response.data.data;
  },

  getAllUsers: async (params?: { 
    site_type?: 'filiale' | 'succursale'; 
    active_only?: boolean 
  }): Promise<UsersListResponse> => {
    const response = await apiClient.get<ApiResponse<UsersListResponse>>(
      '/api/auth/users', 
      { params }
    );
    
    console.log('getAllUsers raw response:', response.data);
    
    // Backend returns: { success: true, data: { data: [...], total: 8 } }
    return response.data.data;
  },

  getUserCompleteInfo: async (userId: number) => {
    const { data } = await apiClient.get(`/api/auth/users/${userId}/complete`);
    return data.data;
  },

  getAvailableSites: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/auth/available-sites');
    return response.data.data;
  },

    // Update user roles and permissions
  updateUserRolesAndPermissions: async (
    userId: number,
    data: { roleIds: number[]; permissionIds: number[] }
  ): Promise<any> => {
    const response = await apiClient.patch(
      `/api/auth/users/${userId}/roles-permissions`,
      data
    );
    return response.data.data;
  },
};
