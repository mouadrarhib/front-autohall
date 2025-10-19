// src/api/endpoints/typevente.api.ts

import { apiClient, ApiResponse } from '../client';

export interface TypeVente {
  id: number;
  name: string;
  active: boolean;
}

export interface CreateTypeVenteRequest {
  name: string;
}

export interface UpdateTypeVenteRequest {
  name: string;
}

export const typeventeApi = {
  // Create a new type vente
  createTypeVente: async (data: CreateTypeVenteRequest): Promise<ApiResponse<TypeVente>> => {
    return apiClient.post('/api/type-ventes', data);
  },

  // Update a type vente
  updateTypeVente: async (
    id: number,
    data: UpdateTypeVenteRequest
  ): Promise<ApiResponse<TypeVente>> => {
    return apiClient.patch(`/api/type-ventes/${id}`, data);
  },

  // Get type vente by ID
  getTypeVenteById: async (id: number): Promise<ApiResponse<TypeVente>> => {
    return apiClient.get(`/api/type-ventes/${id}`);
  },

  // List all active type ventes
  listActiveTypeVentes: async (): Promise<ApiResponse<TypeVente[]>> => {
    return apiClient.get('/api/type-ventes');
  },

  // Activate a type vente
  activateTypeVente: async (id: number): Promise<ApiResponse<TypeVente>> => {
    return apiClient.post(`/api/type-ventes/${id}/activate`);
  },

  // Deactivate a type vente
  deactivateTypeVente: async (id: number): Promise<ApiResponse<TypeVente>> => {
    return apiClient.post(`/api/type-ventes/${id}/deactivate`);
  },
};
