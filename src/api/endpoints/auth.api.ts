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

export interface UserCompleteInfo {
  userId: number;
  fullName: string;
  email: string;
  username: string;
  userActive: boolean;
  userEnabled: boolean;
  userCreatedAt?: string | null;
  userUpdatedAt?: string | null;
  userSiteId?: number | null;
  groupementType?: string | null;
  siteId?: number | null;
  userSiteActive?: boolean | null;
  siteName?: string | null;
  siteActive?: boolean | null;
  userRoles?: string | null;
  activeRolesCount?: number | null;
  userPermissions?: string | null;
  activePermissionsCount?: number | null;
  userStatus?: string | null;
  lastActivity?: string | null;
  raw?: Record<string, any>;
}

const normalizeUserCompleteInfo = (payload: any): UserCompleteInfo => {
  if (!payload || typeof payload !== 'object') {
    return {
      userId: 0,
      fullName: '',
      email: '',
      username: '',
      userActive: false,
      userEnabled: false,
      raw: payload ?? null,
    };
  }

  const toNumber = (value: any, fallback: number | null = null) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    userId: toNumber(payload.UserId ?? payload.userId ?? payload.id, 0) ?? 0,
    fullName: payload.FullName ?? payload.fullName ?? payload.full_name ?? '',
    email: payload.Email ?? payload.email ?? '',
    username: payload.Username ?? payload.username ?? '',
    userActive: Boolean(payload.UserActive ?? payload.userActive ?? payload.active ?? false),
    userEnabled: Boolean(payload.UserEnabled ?? payload.userEnabled ?? payload.enabled ?? false),
    userCreatedAt: payload.UserCreatedAt ?? payload.userCreatedAt ?? payload.createdAt ?? null,
    userUpdatedAt: payload.UserUpdatedAt ?? payload.userUpdatedAt ?? payload.updatedAt ?? null,
    userSiteId: toNumber(payload.UserSiteId ?? payload.userSiteId ?? payload.idUserSite, null),
    groupementType: payload.GroupementType ?? payload.groupementType ?? payload.groupement_name ?? null,
    siteId: toNumber(payload.SiteId ?? payload.siteId, null),
    userSiteActive: payload.UserSiteActive ?? payload.userSiteActive ?? null,
    siteName: payload.SiteName ?? payload.siteName ?? null,
    siteActive: payload.SiteActive ?? payload.siteActive ?? null,
    userRoles: payload.UserRoles ?? payload.userRoles ?? null,
    activeRolesCount: toNumber(payload.ActiveRolesCount ?? payload.activeRolesCount, null),
    userPermissions: payload.UserPermissions ?? payload.userPermissions ?? null,
    activePermissionsCount: toNumber(
      payload.ActivePermissionsCount ?? payload.activePermissionsCount,
      null
    ),
    userStatus: payload.UserStatus ?? payload.userStatus ?? null,
    lastActivity: payload.LastActivity ?? payload.lastActivity ?? null,
    raw: payload,
  };
};

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
    const response = await apiClient.post('/api/auth/create-user-complete', userData);
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
  getUserCompleteInfo: async (userId: number): Promise<UserCompleteInfo> => {
    const { data } = await apiClient.get<ApiResponse<any>>(
      `/api/auth/users/${userId}/complete`
    );
    return normalizeUserCompleteInfo(data.data);
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
