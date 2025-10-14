// src/api/endpoints/userRole.api.ts
import { apiClient, ApiResponse } from '../client';

export const userRoleApi = {
  // Assign role to user
  assignUserRole: async (userId: number, roleId: number, active = true): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/user-roles/assign',
      { userId, roleId, active }
    );
    return response.data.data;
  },

  // Remove role from user
  removeUserRole: async (userId: number, roleId: number): Promise<any> => {
    const response = await apiClient.delete<ApiResponse<any>>(
      '/api/user-roles/remove',
      { data: { userId, roleId } }
    );
    return response.data.data;
  },

  // Toggle active status of user-role
  toggleUserRole: async (userId: number, roleId: number): Promise<any> => {
    const response = await apiClient.patch<ApiResponse<any>>(
      '/api/user-roles/toggle',
      { userId, roleId }
    );
    return response.data.data;
  },

  // Get roles for a user
  getRolesByUser: async (userId: number, activeOnly = true): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/api/user-roles/users/${userId}/roles`,
      { params: { activeOnly } }
    );
    return response.data.data;
  },

  // Get users for a role
  getUsersByRole: async (roleId: number, activeOnly = true): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/api/user-roles/roles/${roleId}/users`,
      { params: { activeOnly } }
    );
    return response.data.data;
  },

  // Sync (replace) all roles for a user
  syncRolesForUser: async (
    userId: number,
    roleIds: number[],
    active = true
  ): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/api/user-roles/users/${userId}/roles/sync`,
      { roleIds, active }
    );
    return response.data.data;
  },

  // Sync (replace) all users for a role
  syncUsersForRole: async (
    roleId: number,
    userIds: number[],
    active = true
  ): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/api/user-roles/roles/${roleId}/users/sync`,
      { userIds, active }
    );
    return response.data.data;
  },

  // Check if user has a specific role
  checkUserAccess: async (
    userId: number,
    roleId: number,
    activeOnly = true
  ): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/user-roles/check',
      { params: { userId, roleId, activeOnly } }
    );
    return response.data.data;
  },

  // Get user-role statistics
  getUserRoleStats: async (userId?: number, roleId?: number): Promise<any> => {
    const params: any = {};
    if (userId) params.userId = userId;
    if (roleId) params.roleId = roleId;
    
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/user-roles/stats',
      { params }
    );
    return response.data.data;
  },

  // Get all user-role assignments (admin view)
  getAllUserRoles: async (
    page = 1,
    pageSize = 50,
    activeOnly = false
  ): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/user-roles',
      { params: { page, pageSize, activeOnly } }
    );
    return response.data.data;
  },
};
