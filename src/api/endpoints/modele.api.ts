// src/api/endpoints/modele.api.ts
import { apiClient, ApiResponse } from '../client';

export interface Modele {
  id: number;
  name: string;
  idMarque: number;
  imageUrl?: string | null;  // ✅ Added imageUrl
  active: boolean;
  marqueName?: string;
  marqueActive?: boolean;
  filialeName?: string;
  filialeActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModeleDto {
  name: string;
  idMarque: number;
  imageUrl?: string | null;  // ✅ Added imageUrl
  active?: boolean;
}

export interface UpdateModeleDto {
  name?: string | null;
  idMarque?: number | null;
  imageUrl?: string | null;  // ✅ Added imageUrl
  active?: boolean | null;
}

export interface ModeleListParams {
  idMarque?: number;
  onlyActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SearchModeleParams {
  q: string;
  idMarque?: number;
  onlyActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const modeleApi = {
  /**
   * Create a new modele
   */
  create: async (data: CreateModeleDto): Promise<Modele> => {
    const response = await apiClient.post<ApiResponse<Modele>>('/api/modeles', data);
    return response.data.data;
  },

  /**
   * Get modele by ID
   */
  getById: async (id: number): Promise<Modele> => {
    const response = await apiClient.get<ApiResponse<Modele>>(`/api/modeles/${id}`);
    return response.data.data;
  },

  /**
   * List modeles with pagination
   */
  list: async (params?: ModeleListParams): Promise<{
    data: Modele[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/modeles', {
      params: {
        idMarque: params?.idMarque,
        onlyActive: params?.onlyActive ?? true,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data.data;
  },

  /**
   * List modeles by marque
   */
  listByMarque: async (
    idMarque: number,
    params?: Omit<ModeleListParams, 'idMarque'>
  ): Promise<{
    data: Modele[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/modeles/by-marque/${idMarque}`,
      {
        params: {
          onlyActive: params?.onlyActive ?? true,
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 10,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Search modeles
   */
  search: async (params: SearchModeleParams): Promise<{
    data: Modele[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/modeles/search', {
      params: {
        q: params.q,
        idMarque: params.idMarque,
        onlyActive: params.onlyActive ?? true,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      },
    });
    return response.data.data;
  },

  /**
   * Update modele
   */
  update: async (id: number, data: UpdateModeleDto): Promise<Modele> => {
    const response = await apiClient.patch<ApiResponse<Modele>>(
      `/api/modeles/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Activate modele
   */
  activate: async (id: number): Promise<Modele> => {
    const response = await apiClient.post<ApiResponse<Modele>>(
      `/api/modeles/${id}/activate`
    );
    return response.data.data;
  },

  /**
   * Deactivate modele
   */
  deactivate: async (id: number): Promise<Modele> => {
    const response = await apiClient.post<ApiResponse<Modele>>(
      `/api/modeles/${id}/deactivate`
    );
    return response.data.data;
  },
};
