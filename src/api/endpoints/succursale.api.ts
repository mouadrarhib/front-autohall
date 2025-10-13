// src/api/endpoints/succursale.api.ts
import { apiClient, ApiResponse } from '../client';

export interface Succursale {
  id: number;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedSuccursalesResponse {
  data: Succursale[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const succursaleApi = {
  // Create a new succursale
  createSuccursale: async (data: { name: string; active?: boolean }): Promise<Succursale> => {
    const response = await apiClient.post<ApiResponse<Succursale>>(
      '/api/succursales',
      data
    );
    return response.data.data;
  },

  // Get succursale by ID
  getSuccursaleById: async (id: number): Promise<Succursale> => {
    const response = await apiClient.get<ApiResponse<Succursale>>(
      `/api/succursales/${id}`
    );
    return response.data.data;
  },

  // List all succursales with pagination
  listSuccursales: async (params?: { 
    onlyActive?: boolean;
    page?: number; 
    pageSize?: number;
  }): Promise<PaginatedSuccursalesResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedSuccursalesResponse>>(
      '/api/succursales',
      { params }
    );
    return response.data.data;
  },

  // Search succursales
  searchSuccursales: async (
    searchTerm: string,
    onlyActive?: boolean
  ): Promise<Succursale[]> => {
    const response = await apiClient.get<ApiResponse<Succursale[]>>(
      '/api/succursales/search',
      { params: { q: searchTerm, onlyActive } }
    );
    return response.data.data;
  },

  // Update succursale
  updateSuccursale: async (
    id: number,
    data: { name?: string; active?: boolean }
  ): Promise<Succursale> => {
    const response = await apiClient.patch<ApiResponse<Succursale>>(
      `/api/succursales/${id}`,
      data
    );
    return response.data.data;
  },

  // Activate succursale
  activateSuccursale: async (id: number): Promise<Succursale> => {
    const response = await apiClient.post<ApiResponse<Succursale>>(
      `/api/succursales/${id}/activate`
    );
    return response.data.data;
  },

  // Deactivate succursale
  deactivateSuccursale: async (id: number): Promise<Succursale> => {
    const response = await apiClient.post<ApiResponse<Succursale>>(
      `/api/succursales/${id}/deactivate`
    );
    return response.data.data;
  },
};
