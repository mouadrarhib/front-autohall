// src/api/endpoints/version.api.ts
import { apiClient, ApiResponse } from '../client';

export interface Version {
  id: number;
  name: string;
  idModele: number;
  volume: number;
  price: number;
  tm: number;
  margin: number;
  active: boolean;
  modeleName?: string;
  modeleActive?: boolean;
  marqueName?: string;
  marqueActive?: boolean;
  filialeName?: string;
  filialeActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVersionDto {
  name: string;
  idModele: number;
  volume: number;
  price: number;
  tm: number;
  margin: number;
}

export interface UpdateVersionDto {
  name: string;
  idModele: number;
  volume: number;
  price: number;
  tm: number;
  margin: number;
}

export interface VersionListParams {
  idModele?: number;
  onlyActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SearchVersionParams {
  q: string;
  idModele?: number;
  onlyActive?: boolean;
}

export const versionApi = {
  /**
   * Create a new version
   */
  create: async (data: CreateVersionDto): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<Version>>('/api/versions', data);
    return response.data.data;
  },

  /**
   * Get version by ID
   */
  getById: async (id: number): Promise<Version> => {
    const response = await apiClient.get<ApiResponse<Version>>(`/api/versions/${id}`);
    return response.data.data;
  },

  /**
   * List versions with pagination
   */
  list: async (params?: VersionListParams): Promise<{
    data: Version[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/versions', {
      params: {
        idModele: params?.idModele,
        onlyActive: params?.onlyActive ?? true,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data.data;
  },

  /**
   * List versions by modele
   */
  listByModele: async (params: {
    idModele: number;
    onlyActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<{
    data: Version[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/versions/by-modele', {
      params: {
        idModele: params.idModele,
        onlyActive: params.onlyActive ?? true,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      },
    });
    return response.data.data;
  },

  /**
   * Search versions
   */
  search: async (params: SearchVersionParams): Promise<Version[]> => {
    const response = await apiClient.get<ApiResponse<Version[]>>('/api/versions/search', {
      params: {
        q: params.q,
        idModele: params.idModele,
        onlyActive: params.onlyActive ?? true,
      },
    });
    return response.data.data;
  },

  /**
   * Update version
   */
  update: async (id: number, data: UpdateVersionDto): Promise<Version> => {
    const response = await apiClient.patch<ApiResponse<Version>>(
      `/api/versions/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Activate version
   */
  activate: async (id: number): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<Version>>(
      `/api/versions/${id}/activate`
    );
    return response.data.data;
  },

  /**
   * Deactivate version
   */
  deactivate: async (id: number): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<Version>>(
      `/api/versions/${id}/deactivate`
    );
    return response.data.data;
  },
};
