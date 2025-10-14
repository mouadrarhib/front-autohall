// src/api/endpoints/role.api.ts
import { apiClient, ApiResponse } from '../client';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../types/role.types';

export const roleApi = {
  // Create role
  createRole: async (data: CreateRoleRequest): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>('/api/roles', data);
    return response.data.data;
  },

  // Get role by ID
  getRoleById: async (id: number): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(`/api/roles/${id}`);
    return response.data.data;
  },

  // List all roles
  listRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>('/api/roles');
    return response.data.data;
  },

  // Search roles
  searchRoles: async (searchTerm: string): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>('/api/roles/search', {
      params: { q: searchTerm },
    });
    return response.data.data;
  },

  // Update role
  updateRole: async (id: number, data: UpdateRoleRequest): Promise<Role> => {
    const response = await apiClient.patch<ApiResponse<Role>>(
      `/api/roles/${id}`,
      data
    );
    return response.data.data;
  },

  // Activate role
  activateRole: async (id: number): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>(
      `/api/roles/${id}/activate`
    );
    return response.data.data;
  },

  // Deactivate role
  deactivateRole: async (id: number): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>(
      `/api/roles/${id}/deactivate`
    );
    return response.data.data;
  },
};
