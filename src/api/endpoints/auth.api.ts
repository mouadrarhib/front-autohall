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
  /**
   * Login with username and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      credentials
    );
    console.log('Login response:', data);
    return data.data;
  },

  /**
   * Register a new user
   */
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/register',
      userData
    );
    console.log('Register response:', data);
    return data.data;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>('/api/auth/me');
    console.log('Profile response:', data);
    return data.data;
  },

  /**
   * Get roles for current user
   */
  getMyRoles: async (params?: {
    includeInactive?: boolean;
    page?: number;
    pageSize?: number
  }): Promise<UserRole[]> => {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/api/auth/me/roles',
      { params }
    );
    console.log('Roles response:', data);
    return data.data.data || [];
  },

  /**
   * Get permissions for current user
   */
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
          pageSize: params?.pageSize || 1000
        }
      }
    );
    console.log('Permissions response:', data);
    return data.data.data || [];
  },

  /**
   * Create user with roles, permissions, and site assignment
   */
  createUserComplete: async (userData: CreateUserCompleteRequest): Promise<any> => {
    const response = await apiClient.post('/api/auth/users/complete', userData);
    return response.data.data;
  },

  /**
   * Get all users with optional filters
   */
  getAllUsers: async (params?: {
    site_type?: 'filiale' | 'succursale';
    active_only?: boolean
  }): Promise<UsersListResponse> => {
    const response = await apiClient.get<ApiResponse<UsersListResponse>>(
      '/api/auth/users',
      { params }
    );
    console.log('getAllUsers raw response:', response.data);
    return response.data.data;
  },

  /**
   * Get complete user information by ID
   */
  getUserCompleteInfo: async (userId: number) => {
    const { data } = await apiClient.get(`/api/auth/users/${userId}/complete`);
    return data.data;
  },

  /**
   * Get available sites for user assignment
   */
  /**
 * Get available sites for user assignment
 */
getAvailableSites: async (): Promise<any> => {
  const response = await apiClient.get('/api/auth/sites');
  
  // Backend returns { filiales: [...], succursales: [...] }
  // We need to combine them into one array with type labels
  const { filiales = [], succursales = [] } = response.data.data || {};
  
  const allSites = [
    ...filiales.map((site: any) => ({ ...site, type: 'Filiale' })),
    ...succursales.map((site: any) => ({ ...site, type: 'Succursale' }))
  ];
  
  return allSites;
},


  /**
   * Update user information
   */
  updateUser: async (
    userId: number,
    userData: {
      fullName?: string;
      email?: string;
      username?: string;
      idUserSite?: number;
      actif?: boolean;
      active?: boolean;
    }
  ): Promise<any> => {
    const response = await apiClient.patch(
      `/api/auth/users/${userId}`,
      userData
    );
    return response.data.data;
  },

  /**
   * Update user password
   */
  updateUserPassword: async (
    userId: number,
    newPassword: string
  ): Promise<any> => {
    const response = await apiClient.patch(
      `/api/auth/users/${userId}/password`,
      { newPassword }
    );
    return response.data.data;
  },

  /**
   * Activate user
   */
  activateUser: async (userId: number): Promise<any> => {
    const response = await apiClient.post(
      `/api/auth/users/${userId}/activate`
    );
    return response.data.data;
  },

  /**
   * Deactivate user
   */
  deactivateUser: async (userId: number): Promise<any> => {
    const response = await apiClient.post(
      `/api/auth/users/${userId}/deactivate`
    );
    return response.data.data;
  },

  /**
   * Update user site assignment
   */
  updateUserSiteAssignment: async (
    userId: number,
    idUserSite: number
  ): Promise<any> => {
    const response = await apiClient.patch(
      `/api/auth/users/${userId}/site`,
      { idUserSite }
    );
    return response.data.data;
  },

  /**
   * Update user roles and permissions
   */
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
