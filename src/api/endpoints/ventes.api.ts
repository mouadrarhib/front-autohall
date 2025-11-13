// src/api/endpoints/ventes.api.ts

import { apiClient, ApiResponse } from '../client';

export interface Vente {
  id: number;
  idTypeVente: number;
  typeVenteName?: string;
  idUser: number;
  userName?: string;
  idFiliale: number | null;
  filialeName?: string | null;
  idSuccursale: number | null;
  succursaleName?: string | null;
  idMarque: number | null;
  marqueName?: string | null;
  idModele: number | null;
  modeleName?: string | null;
  idVersion: number | null;
  versionName?: string | null;
  prixVente: number;
  chiffreAffaires: number;
  marge?: number | null;
  margePercentage?: number | null;
  volume: number;
  venteYear: number;
  venteMonth: number;
  ventePeriod?: string;
  venteMonthName?: string;
  createdAt?: string;
  updatedAt?: string | null;
  active?: boolean;
  totalRecords?: number;
}

export interface CreateVenteRequest {
  idTypeVente: number;
  idFiliale?: number | null;
  idSuccursale?: number | null;
  idMarque?: number | null;
  idModele?: number | null;
  idVersion?: number | null;
  prixVente: number;
  chiffreAffaires: number;
  marge?: number | null;
  margePercentage?: number | null;
  volume: number;
  venteYear: number;
  venteMonth: number;
}

export interface UpdateVenteRequest extends Partial<CreateVenteRequest> {}

export interface ListVentesParams {
  idTypeVente?: number;
  idUser?: number;
  idFiliale?: number;
  idSuccursale?: number;
  idMarque?: number;
  idModele?: number;
  idVersion?: number;
  yearFrom?: number;
  yearTo?: number;
  monthFrom?: number;
  monthTo?: number;
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListVentesResponse {
  data: Vente[];
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


export const ventesApi = {
  // Create a new vente
  createVente: async (data: CreateVenteRequest): Promise<ApiResponse<Vente>> => {
    const payload = {
      ...data,
      idFiliale: data.idFiliale ?? null,
      idSuccursale: data.idSuccursale ?? null,
      idMarque: data.idMarque ?? null,
      idModele: data.idModele ?? null,
      idVersion: data.idVersion ?? null,
      marge: data.marge ?? null,
      margePercentage: data.margePercentage ?? null,
    };
    return apiClient.post('/api/ventes', payload);
  },

  // Update an existing vente
  updateVente: async (
    id: number,
    data: UpdateVenteRequest
  ): Promise<ApiResponse<Vente>> => {
    const payload: Record<string, any> = {};
    for (const key in data) {
      payload[key] = (data as any)[key] ?? null;
    }
    return apiClient.patch(`/api/ventes/${id}`, payload);
  },

  // Get vente by ID
  getVenteById: async (id: number, includeInactive = false): Promise<ApiResponse<Vente>> => {
    return apiClient.get(`/api/ventes/${id}`, { params: { includeInactive } });
  },

  // List ventes (paginated)
listVentes: async (params?: ListVentesParams): Promise<ApiResponse<ListVentesResponse>> => {
  return apiClient.get('/api/ventes', { params });
},


  // Activate a vente
  activateVente: async (id: number): Promise<ApiResponse<unknown>> => {
    return apiClient.post(`/api/ventes/${id}/activate`);
  },

  // Deactivate a vente
  deactivateVente: async (id: number): Promise<ApiResponse<unknown>> => {
    return apiClient.post(`/api/ventes/${id}/deactivate`);
  },

  // Analytics: sales summary by period
  getSummaryByPeriod: async (params: { yearFrom: number; yearTo: number; idFiliale?: number; idSuccursale?: number; idMarque?: number; }): Promise<ApiResponse<any>> => {
    return apiClient.get('/api/ventes/analytics/summary', { params });
  },

  // Analytics: performance by vehicle
  getPerformanceByVehicle: async (params: { yearFrom: number; yearTo: number; level?: 'marque' | 'modele' | 'version'; }): Promise<ApiResponse<any>> => {
    return apiClient.get('/api/ventes/analytics/performance', { params });
  },

  // Analytics: top performers (users/filiales/succursales)
  getTopPerformers: async (params: { yearFrom: number; yearTo: number; performerType?: 'user' | 'filiale' | 'succursale'; topN?: number }): Promise<ApiResponse<any>> => {
    return apiClient.get('/api/ventes/analytics/top-performers', { params });
  },

  // Analytics: compare two periods
  comparePeriods: async (params: { year1: number; month1: number; year2: number; month2: number; idMarque?: number; idFiliale?: number }): Promise<ApiResponse<any>> => {
    return apiClient.get('/api/ventes/analytics/compare', { params });
  },

  // Analytics: year-over-year growth
  getYearOverYearGrowth: async (params: { currentYear: number; previousYear: number; idMarque?: number }): Promise<ApiResponse<any>> => {
    return apiClient.get('/api/ventes/analytics/yoy-growth', { params });
  }
};
