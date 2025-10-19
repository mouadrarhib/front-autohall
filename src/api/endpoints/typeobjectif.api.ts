// src/api/endpoints/typeobjectif.api.ts

import { apiClient, ApiResponse } from '../client';

export interface TypeObjectif {
  id: number;
  name: string;
  active: boolean;
}

export interface CreateTypeObjectifRequest {
  name: string;
}

export interface UpdateTypeObjectifRequest {
  name: string;
}

export const typeobjectifApi = {
  // Create a new type objectif
  createTypeObjectif: async (
    data: CreateTypeObjectifRequest
  ): Promise<ApiResponse<TypeObjectif>> => {
    return apiClient.post('/api/type-objectifs', data);
  },

  // Update a type objectif
  updateTypeObjectif: async (
    id: number,
    data: UpdateTypeObjectifRequest
  ): Promise<ApiResponse<TypeObjectif>> => {
    return apiClient.patch(`/api/type-objectifs/${id}`, data);
  },

  // Get type objectif by ID
  getTypeObjectifById: async (id: number): Promise<ApiResponse<TypeObjectif>> => {
    return apiClient.get(`/api/type-objectifs/${id}`);
  },

  // List all active type objectifs
  listActiveTypeObjectifs: async (): Promise<ApiResponse<TypeObjectif[]>> => {
    return apiClient.get('/api/type-objectifs');
  },

  // Activate a type objectif
  activateTypeObjectif: async (id: number): Promise<ApiResponse<TypeObjectif>> => {
    return apiClient.post(`/api/type-objectifs/${id}/activate`);
  },

  // Deactivate a type objectif
  deactivateTypeObjectif: async (id: number): Promise<ApiResponse<TypeObjectif>> => {
    return apiClient.post(`/api/type-objectifs/${id}/deactivate`);
  },
};
