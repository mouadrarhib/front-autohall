// src/api/endpoints/marque.api.ts
import { apiClient, ApiResponse } from '../client';

export interface Marque {
  id: number;
  name: string;
  idFiliale: number;
  imageUrl?: string | null;
  active: boolean;
  filialeName?: string;
  filialeActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMarqueDto {
  name: string;
  idFiliale: number;
  imageUrl?: string | null;
  active?: boolean;
}

export interface UpdateMarqueDto {
  name?: string | null;
  idFiliale?: number | null;
  imageUrl?: string | null;
  active?: boolean | null;
}

export interface MarqueListParams {
  idFiliale?: number;
  onlyActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SearchMarqueParams {
  search: string;
  idFiliale?: number;
  onlyActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const marqueApi = {
  create: async (data: CreateMarqueDto): Promise<Marque> => {
    const response = await apiClient.post<ApiResponse<Marque>>('/api/marques', data);
    return response.data.data;
  },
  getById: async (id: number): Promise<Marque> => {
    const response = await apiClient.get<ApiResponse<Marque>>(`/api/marques/${id}`);
    return response.data.data;
  },

  list: async (params?: MarqueListParams): Promise<{
    data: Marque[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/marques', {
      params: {
        idFiliale: params?.idFiliale,
        onlyActive: params?.onlyActive ?? true,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data.data;
  },

  listByFiliale: async (
    idFiliale: number,
    params?: Omit<MarqueListParams, 'idFiliale'>
  ): Promise<{
    data: Marque[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/marques/by-filiale/${idFiliale}`,
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

  search: async (params: SearchMarqueParams): Promise<{
    data: Marque[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/marques/search', {
      params: {
        search: params.search,
        idFiliale: params.idFiliale,
        onlyActive: params.onlyActive ?? true,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      },
    });
    return response.data.data;
  },

  update: async (id: number, data: UpdateMarqueDto): Promise<Marque> => {
    const response = await apiClient.patch<ApiResponse<Marque>>(
      `/api/marques/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Activate marque
   */
  activate: async (id: number): Promise<Marque> => {
    const response = await apiClient.post<ApiResponse<Marque>>(
      `/api/marques/${id}/activate`
    );
    return response.data.data;
  },

  /**
   * Deactivate marque
   */
  deactivate: async (id: number): Promise<Marque> => {
    const response = await apiClient.post<ApiResponse<Marque>>(
      `/api/marques/${id}/deactivate`
    );
    return response.data.data;
  },
};
