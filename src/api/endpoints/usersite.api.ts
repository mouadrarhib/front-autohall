// src/api/endpoints/usersite.api.ts
import { apiClient, ApiResponse } from '../client';
import type {
  UserSite,
  CreateUserSiteRequest,
  UpdateUserSiteRequest,
  SearchUserSiteFilters,
} from '../../types/usersite.types';

export const usersiteApi = {
  // Create usersite
  createUserSite: async (data: CreateUserSiteRequest): Promise<UserSite> => {
    const response = await apiClient.post<ApiResponse<UserSite>>(
      '/api/user-sites',
      data
    );
    return response.data.data;
  },

  // Get usersite by ID
  getUserSiteById: async (id: number): Promise<UserSite> => {
    const response = await apiClient.get<ApiResponse<UserSite>>(
      `/api/user-sites/${id}`
    );
    return response.data.data;
  },

  // List all usersites
  listUserSites: async (): Promise<UserSite[]> => {
    const response = await apiClient.get<ApiResponse<UserSite[]>>(
      '/api/user-sites'
    );
    return response.data.data;
  },

  // Search usersites
  searchUserSites: async (filters: SearchUserSiteFilters): Promise<UserSite[]> => {
    const response = await apiClient.get<ApiResponse<UserSite[]>>(
      '/api/user-sites/search',
      { params: filters }
    );
    return response.data.data;
  },

  // List usersites by groupement
  listUserSitesByGroupement: async (idGroupement: number): Promise<UserSite[]> => {
    const response = await apiClient.get<ApiResponse<UserSite[]>>(
      `/api/user-sites/by-groupement/${idGroupement}`
    );
    return response.data.data;
  },

  // List usersites by site
  listUserSitesBySite: async (idSite: number): Promise<UserSite[]> => {
    const response = await apiClient.get<ApiResponse<UserSite[]>>(
      `/api/user-sites/by-site/${idSite}`
    );
    return response.data.data;
  },

  // Update usersite
  updateUserSite: async (
    id: number,
    data: UpdateUserSiteRequest
  ): Promise<UserSite> => {
    const response = await apiClient.patch<ApiResponse<UserSite>>(
      `/api/user-sites/${id}`,
      data
    );
    return response.data.data;
  },

  // Activate usersite
  activateUserSite: async (id: number): Promise<UserSite> => {
    const response = await apiClient.post<ApiResponse<UserSite>>(
      `/api/user-sites/${id}/activate`
    );
    return response.data.data;
  },

  // Deactivate usersite
  deactivateUserSite: async (id: number): Promise<UserSite> => {
    const response = await apiClient.post<ApiResponse<UserSite>>(
      `/api/user-sites/${id}/deactivate`
    );
    return response.data.data;
  },
};
