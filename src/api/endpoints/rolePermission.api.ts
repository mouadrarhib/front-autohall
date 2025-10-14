// src/api/endpoints/rolePermission.api.ts
import { apiClient, ApiResponse } from '../client';

export const rolePermissionApi = {
  // Get permissions assigned to a specific role
  getPermissionsByRole: async (idRole: number, activeOnly = true): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/api/role-permissions/roles/${idRole}/permissions`,
      { params: { activeOnly } }
    );
    return response.data.data;
  },

  // Get roles that have a specific permission
  getRolesByPermission: async (idPermission: number, activeOnly = true): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/api/role-permissions/permissions/${idPermission}/roles`,
      { params: { activeOnly } }
    );
    return response.data.data;
  },

  // Sync permissions for a role (replace all)
  syncPermissionsForRole: async (
    idRole: number,
    permissionIds: number[],
    active = true
  ): Promise<any> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/api/role-permissions/roles/${idRole}/permissions/sync`,
      { permissionIds, active }
    );
    return response.data.data;
  },

  // Check if role has permission
  checkRolePermission: async (
    idRole: number,
    idPermission: number,
    activeOnly = true
  ): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/role-permissions/check',
      { params: { idRole, idPermission, activeOnly } }
    );
    return response.data.data;
  },
};
