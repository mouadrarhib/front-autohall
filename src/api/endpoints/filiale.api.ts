// src/api/endpoints/filiale.api.ts
import { apiClient, ApiResponse } from '../client';

export interface Filiale {
  id: number;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedFilialesResponse {
  data: Filiale[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const filialeApi = {
  // Create a new filiale
  createFiliale: async (data: { name: string; active?: boolean }): Promise<Filiale> => {
    const response = await apiClient.post<ApiResponse<Filiale>>(
      '/api/filiales',
      data
    );
    return response.data.data;
  },

  // Get filiale by ID
  getFilialeById: async (id: number): Promise<Filiale> => {
    const response = await apiClient.get<ApiResponse<Filiale>>(
      `/api/filiales/${id}`
    );
    return response.data.data;
  },

  // List all filiales with pagination
  listFiliales: async (params?: { 
    page?: number; 
    pageSize?: number;
  }): Promise<PaginatedFilialesResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedFilialesResponse>>(
      '/api/filiales',
      { params }
    );
    return response.data.data;
  },

  // Update filiale
  updateFiliale: async (
    id: number,
    data: { name?: string; active?: boolean }
  ): Promise<Filiale> => {
    const response = await apiClient.patch<ApiResponse<Filiale>>(
      `/api/filiales/${id}`,
      data
    );
    return response.data.data;
  },

  // Activate filiale
  activateFiliale: async (id: number): Promise<Filiale> => {
    const response = await apiClient.post<ApiResponse<Filiale>>(
      `/api/filiales/${id}/activate`
    );
    return response.data.data;
  },

  // Deactivate filiale
  deactivateFiliale: async (id: number): Promise<Filiale> => {
    const response = await apiClient.post<ApiResponse<Filiale>>(
      `/api/filiales/${id}/deactivate`
    );
    return response.data.data;
  },
};
