// src/api/endpoints/periode.api.ts

import { apiClient, ApiResponse } from '../client';

export interface Periode {
  id: number;
  name?: string;
  year: number;
  month: number;
  week: number;
  startedDate: string;
  endDate: string;
  typePeriodeId: number;
  active: boolean;
  TotalRecords?: number;
}

export interface CreatePeriodeRequest {
  year: number;
  month: number;
  week?: number;
  startedDate: string;
  endDate: string;
  typePeriodeId: number;
}

export interface UpdatePeriodeRequest {
  year?: number;
  month?: number;
  week?: number;
  startedDate?: string;
  endDate?: string;
  typePeriodeId?: number;
}

export interface ListPeriodesParams {
  page?: number;
  pageSize?: number;
}

export interface PeriodesListResponse {
  data: Periode[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    itemsOnPage: number;
    firstItemNumber: number;
    lastItemNumber: number;
  };
}

export const periodeApi = {
  // Create a new periode
  createPeriode: async (data: CreatePeriodeRequest): Promise<ApiResponse<Periode>> => {
    return apiClient.post('/api/periode', data);
  },

  // Update a periode
  updatePeriode: async (id: number, data: UpdatePeriodeRequest): Promise<ApiResponse<Periode>> => {
    return apiClient.patch(`/api/periode/${id}`, data);
  },

  // Get periode by ID
  getPeriodeById: async (id: number): Promise<ApiResponse<Periode>> => {
    return apiClient.get(`/api/periode/${id}`);
  },

  // List active periodes with pagination
  listActivePeriodes: async (
    params?: ListPeriodesParams
  ): Promise<ApiResponse<PeriodesListResponse>> => {
    return apiClient.get('/api/periode', { params });
  },

  // Activate a periode
  activatePeriode: async (id: number): Promise<ApiResponse<Periode>> => {
    return apiClient.post(`/api/periode/${id}/activate`);
  },

  // Deactivate a periode
  deactivatePeriode: async (id: number): Promise<ApiResponse<Periode>> => {
    return apiClient.post(`/api/periode/${id}/deactivate`);
  },
};
