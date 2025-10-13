// src/api/endpoints/permissions.api.ts
import { apiClient, ApiResponse } from '../client';
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionsListResponse,
  UserPermissionsResponse,
  AssignPermissionRequest,
} from '../../types/permission.types';

export const permissionsApi = {
  listPermissions: async (params?: {
    active?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PermissionsListResponse> => {
    try {
      console.log('API Request - listPermissions with params:', params);
      
      const response = await apiClient.get<ApiResponse<PermissionsListResponse>>(
        '/api/permissions',
        { params }
      );
      
      console.log('API Response - listPermissions:', response.data);
      
      // Handle the response structure from backend
      // Backend returns: { success: true, data: { data: [...], pagination: {...} } }
      const responseData = response.data.data;
      
      // If data is nested in another data property
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return {
          data: responseData.data || [],
          pagination: responseData.pagination || {
            page: params?.page || 1,
            pageSize: params?.pageSize || 50,
            totalCount: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }
      
      // If data is directly an array
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          pagination: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 50,
            totalCount: (responseData as Permission[]).length,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }
      
      // Fallback
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: 50,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
    } catch (error) {
      console.error('API Error - listPermissions:', error);
      throw error;
    }
  },

  createPermission: async (data: CreatePermissionRequest): Promise<Permission> => {
    const response = await apiClient.post<ApiResponse<Permission>>(
      '/api/permissions',
      data
    );
    return response.data.data;
  },

  getPermissionById: async (id: number): Promise<Permission> => {
    const response = await apiClient.get<ApiResponse<Permission>>(
      `/api/permissions/${id}`
    );
    return response.data.data;
  },

  getPermissionByName: async (name: string): Promise<Permission> => {
    const response = await apiClient.get<ApiResponse<Permission>>(
      `/api/permissions/by-name/${name}`
    );
    return response.data.data;
  },

  updatePermission: async (
    id: number,
    data: UpdatePermissionRequest
  ): Promise<Permission> => {
    const response = await apiClient.patch<ApiResponse<Permission>>(
      `/api/permissions/${id}`,
      data
    );
    return response.data.data;
  },

  activatePermission: async (id: number): Promise<Permission> => {
    const response = await apiClient.post<ApiResponse<Permission>>(
      `/api/permissions/${id}/activate`
    );
    return response.data.data;
  },

  deactivatePermission: async (id: number): Promise<Permission> => {
    const response = await apiClient.post<ApiResponse<Permission>>(
      `/api/permissions/${id}/deactivate`
    );
    return response.data.data;
  },

  setPermissionActive: async (id: number, active: boolean): Promise<Permission> => {
    const response = await apiClient.patch<ApiResponse<Permission>>(
      `/api/permissions/${id}/set-active`,
      { active }
    );
    return response.data.data;
  },

  listUserPermissions: async (
    userId: number,
    params?: {
      active?: boolean;
      page?: number;
      pageSize?: number;
    }
  ): Promise<UserPermissionsResponse> => {
    const response = await apiClient.get<ApiResponse<UserPermissionsResponse>>(
      `/api/permissions/user/${userId}/list`,
      { params }
    );
    
    const responseData = response.data.data;
    
    // Handle nested data structure
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return {
        data: responseData.data || [],
        pagination: responseData.pagination || {
          page: 1,
          pageSize: 25,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }
    
    return responseData;
  },

  listUsersByPermission: async (
    permissionId: number,
    params?: { active?: boolean; page?: number; pageSize?: number }
  ): Promise<any> => {
    const response = await apiClient.get(
      `/api/permissions/${permissionId}/users`,
      { params }
    );
    return response.data.data;
  },

  addUserPermission: async (
    userId: number,
    data: AssignPermissionRequest
  ): Promise<any> => {
    const response = await apiClient.post(
      `/api/permissions/user/${userId}/add`,
      data
    );
    return response.data.data;
  },

  activateUserPermission: async (
    userId: number,
    data: AssignPermissionRequest
  ): Promise<any> => {
    const response = await apiClient.post(
      `/api/permissions/user/${userId}/activate`,
      data
    );
    return response.data.data;
  },

  deactivateUserPermission: async (
    userId: number,
    data: AssignPermissionRequest
  ): Promise<any> => {
    const response = await apiClient.post(
      `/api/permissions/user/${userId}/deactivate`,
      data
    );
    return response.data.data;
  },

  removeUserPermission: async (
    userId: number,
    permissionId: number,
    hardDelete: boolean = false
  ): Promise<any> => {
    const response = await apiClient.delete(
      `/api/permissions/user/${userId}/remove`,
      {
        data: { idPermission: permissionId, hardDelete },
      }
    );
    return response.data.data;
  },

  checkUserPermission: async (
    userId: number,
    permissionName: string
  ): Promise<{ hasPermission: boolean }> => {
    const response = await apiClient.get(
      `/api/permissions/user/${userId}/check/${permissionName}`
    );
    return response.data.data;
  },
};
