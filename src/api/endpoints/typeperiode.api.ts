// src/api/endpoints/typeperiode.api.ts

import { apiClient, ApiResponse } from '../client';

export interface TypePeriode {
  id: number;
  name: string;
  hebdomadaire: boolean;
  mensuel: boolean;
  active: boolean;
}

export interface CreateTypePeriodeRequest {
  name: string;
  hebdomadaire: boolean;
  mensuel: boolean;
}

export interface UpdateTypePeriodeRequest {
  name?: string;
  hebdomadaire?: boolean;
  mensuel?: boolean;
}

export const typeperiodeApi = {
  // Create a new type periode
  createTypePeriode: async (data: CreateTypePeriodeRequest): Promise<ApiResponse<TypePeriode>> => {
    return apiClient.post('/api/type-periode', data);
  },

  // Update a type periode
  updateTypePeriode: async (
    id: number,
    data: UpdateTypePeriodeRequest
  ): Promise<ApiResponse<TypePeriode>> => {
    return apiClient.patch(`/api/type-periode/${id}`, data);
  },

  // Get type periode by ID
  getTypePeriodeById: async (id: number): Promise<ApiResponse<TypePeriode>> => {
    return apiClient.get(`/api/type-periode/${id}`);
  },

  // List all active type periodes
  listActiveTypePeriodes: async (): Promise<ApiResponse<TypePeriode[]>> => {
    return apiClient.get('/api/type-periode');
  },

  // Activate a type periode
  activateTypePeriode: async (id: number): Promise<ApiResponse<TypePeriode>> => {
    return apiClient.post(`/api/type-periode/${id}/activate`);
  },

  // Deactivate a type periode
  deactivateTypePeriode: async (id: number): Promise<ApiResponse<TypePeriode>> => {
    return apiClient.post(`/api/type-periode/${id}/deactivate`);
  },
};
