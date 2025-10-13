// src/api/endpoints/groupement.api.ts
import { apiClient, ApiResponse } from '../client';
import type {
  Groupement,
  CreateGroupementRequest,
  UpdateGroupementRequest,
} from '../../types/usersite.types';

export const groupementApi = {
  // Create groupement
  createGroupement: async (data: CreateGroupementRequest): Promise<Groupement> => {
    const response = await apiClient.post<ApiResponse<Groupement>>(
      '/api/groupements',
      data
    );
    return response.data.data;
  },

  // Get groupement by ID
  getGroupementById: async (id: number): Promise<Groupement> => {
    const response = await apiClient.get<ApiResponse<Groupement>>(
      `/api/groupements/${id}`
    );
    return response.data.data;
  },

  // List all groupements
  listGroupements: async (): Promise<Groupement[]> => {
    const response = await apiClient.get<ApiResponse<Groupement[]>>(
      '/api/groupements'
    );
    return response.data.data;
  },

  // Search groupements
  searchGroupements: async (searchTerm: string): Promise<Groupement[]> => {
    const response = await apiClient.get<ApiResponse<Groupement[]>>(
      '/api/groupements/search',
      { params: { q: searchTerm } }
    );
    return response.data.data;
  },

  // Update groupement
  updateGroupement: async (
    id: number,
    data: UpdateGroupementRequest
  ): Promise<Groupement> => {
    const response = await apiClient.patch<ApiResponse<Groupement>>(
      `/api/groupements/${id}`,
      data
    );
    return response.data.data;
  },

  // Activate groupement
  activateGroupement: async (id: number): Promise<Groupement> => {
    const response = await apiClient.post<ApiResponse<Groupement>>(
      `/api/groupements/${id}/activate`
    );
    return response.data.data;
  },

  // Deactivate groupement
  deactivateGroupement: async (id: number): Promise<Groupement> => {
    const response = await apiClient.post<ApiResponse<Groupement>>(
      `/api/groupements/${id}/deactivate`
    );
    return response.data.data;
  },

  // List users by groupement (paginated)
  listUsersByGroupement: async (
    idGroupement: number,
    params?: { page?: number; pageSize?: number }
  ): Promise<any> => {
    const response = await apiClient.get(
      `/api/groupements/${idGroupement}/users`,
      { params }
    );
    return response.data.data;
  },
};
