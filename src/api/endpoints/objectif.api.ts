// src/api/endpoints/objectif.api.ts

import { apiClient, ApiResponse } from '../client';

export interface ObjectifView {
  id: number;
  groupementID: number;
  groupementName: string;
  SiteID: number;
  SiteName: string;
  periodeID: number;
  periodeTypeName: string;
  periodeName: string;
  typeVenteID: number;
  typeVenteName: string;
  typeObjectifId: number;
  typeObjectifName: string;
  marqueID: number | null;
  marqueName: string | null;
  modeleID: number | null;
  modeleName: string | null;
  versionID: number | null;
  versionName: string | null;
  volume: number;
  price: number;
  TauxMarge: number;
  ChiffreDaffaire: number;
  Marge: number;
  createdUserId: number;
  createdUserFullName: string;
  CreatedAt: string;
  updatedUserId: number | null;
  updatedUserFullName: string | null;
  updatedCreatedAt: string | null;
}

export interface CreateObjectifRequest {
  userId: number;
  groupementId: number;
  siteId: number;
  periodeId: number;
  typeVenteId: number;
  typeObjectifId: number;
  marqueId?: number | null;
  modeleId?: number | null;
  versionId?: number | null;
  volume: number;
  salePrice: number;
  tmDirect: number;
  margeInterGroupe: number;
}

export interface UpdateObjectifRequest {
  userId?: number;
  groupementId?: number;
  siteId?: number;
  periodeId?: number;
  typeVenteId?: number;
  typeObjectifId?: number;
  marqueId?: number | null;
  modeleId?: number | null;
  versionId?: number | null;
  volume?: number;
  salePrice?: number;
  tmDirect?: number;
  margeInterGroupe?: number;
}

export interface ListObjectifsParams {
  userId?: number;
  periodeId?: number;
  groupementId?: number;
  siteId?: number;
}

export const objectifApi = {
  // Create a new objectif
  createObjectif: async (data: CreateObjectifRequest): Promise<ApiResponse<ObjectifView>> => {
    const payload: Record<string, any> = {
      userId: data.userId,
      groupementId: data.groupementId,
      siteId: data.siteId,
      periodeId: data.periodeId,
      typeVenteId: data.typeVenteId,
      typeObjectifId: data.typeObjectifId,
      marqueId: data.marqueId ?? null,
      modeleId: data.modeleId ?? null,
      versionId: data.versionId ?? null,
      volume: data.volume,
      SalePrice: data.salePrice,
      TMDirect: data.tmDirect,
      MargeInterGroupe: data.margeInterGroupe,
    };
    return apiClient.post('/api/objectifs', payload);
  },

  // Update an objectif
  updateObjectif: async (
    id: number,
    data: UpdateObjectifRequest
  ): Promise<ApiResponse<ObjectifView>> => {
    const payload: Record<string, any> = {};

    if (data.userId !== undefined) payload.userId = data.userId;
    if (data.groupementId !== undefined) payload.groupementId = data.groupementId;
    if (data.siteId !== undefined) payload.siteId = data.siteId;
    if (data.periodeId !== undefined) payload.periodeId = data.periodeId;
    if (data.typeVenteId !== undefined) payload.typeVenteId = data.typeVenteId;
    if (data.typeObjectifId !== undefined) payload.typeObjectifId = data.typeObjectifId;
    if (data.marqueId !== undefined) payload.marqueId = data.marqueId ?? null;
    if (data.modeleId !== undefined) payload.modeleId = data.modeleId ?? null;
    if (data.versionId !== undefined) payload.versionId = data.versionId ?? null;
    if (data.volume !== undefined) payload.volume = data.volume;
    if (data.salePrice !== undefined) payload.SalePrice = data.salePrice;
    if (data.tmDirect !== undefined) payload.TMDirect = data.tmDirect;
    if (data.margeInterGroupe !== undefined) payload.MargeInterGroupe = data.margeInterGroupe;

    return apiClient.patch(`/api/objectifs/${id}`, payload);
  },

  // Get objectif by ID
  getObjectifById: async (id: number): Promise<ApiResponse<ObjectifView>> => {
    return apiClient.get(`/api/objectifs/${id}`);
  },

  // List objectifs with enriched view data (NO PAGINATION)
  listObjectifsView: async (
    params?: ListObjectifsParams
  ): Promise<ApiResponse<ObjectifView[]>> => {
    return apiClient.get('/api/objectifs/view', { params });
  },

  // Activate an objectif
  activateObjectif: async (id: number): Promise<ApiResponse<ObjectifView>> => {
    return apiClient.post(`/api/objectifs/${id}/activate`);
  },

  // Deactivate an objectif
  deactivateObjectif: async (id: number): Promise<ApiResponse<ObjectifView>> => {
    return apiClient.post(`/api/objectifs/${id}/deactivate`);
  },
};
