// src/api/endpoints/filiale.api.ts
import { apiClient, ApiResponse } from '../client';

export interface Filiale {
  id: number;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedFilialesResponse {
  data: Filiale[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    itemsOnPage?: number;
    firstItemNumber?: number;
    lastItemNumber?: number;
  };
}

const normalizeFiliale = (raw: any): Filiale => ({
  id: raw?.id ?? raw?.Id ?? 0,
  name: raw?.name ?? raw?.Name ?? '',
  active: Boolean(raw?.active ?? raw?.Active ?? false),
  createdAt: raw?.createdAt ?? raw?.CreatedAt,
  updatedAt: raw?.updatedAt ?? raw?.UpdatedAt,
});

export const filialeApi = {
  // Create a new filiale
  createFiliale: async (data: { name: string; active?: boolean }): Promise<Filiale> => {
    const response = await apiClient.post<ApiResponse<Filiale>>(
      '/api/filiales',
      data
    );
    return response.data.data;
  },

  // Get filiale by ID
  getFilialeById: async (id: number): Promise<Filiale> => {
    const response = await apiClient.get<ApiResponse<Filiale>>(
      `/api/filiales/${id}`
    );
    return response.data.data;
  },

  // List all filiales with pagination
  listFiliales: async (params?: {
    page?: number;
    pageSize?: number;
    active?: boolean;
  }): Promise<PaginatedFilialesResponse> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedFilialesResponse | { data: Filiale[]; pagination?: any } | Filiale[]>
    >('/api/filiales', { params });

    const payload = response.data.data;

    if (Array.isArray(payload)) {
      return {
        data: payload.map(normalizeFiliale),
        pagination: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? payload.length,
          totalCount: payload.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          itemsOnPage: payload.length,
          firstItemNumber: payload.length ? 1 : 0,
          lastItemNumber: payload.length,
        },
      };
    }

    if (payload && typeof payload === 'object') {
      const nestedData = Array.isArray((payload as any).data)
        ? (payload as any).data
        : [];

      const pagination = (payload as any).pagination ?? {};
      const normalized = nestedData.map(normalizeFiliale);
      const totalCount =
        pagination.totalCount ?? nestedData[0]?.TotalRecords ?? normalized.length;
      const firstItem =
        pagination.firstItemNumber ?? (normalized.length ? 1 : 0);
      const lastItem =
        pagination.lastItemNumber ??
        (normalized.length ? firstItem + normalized.length - 1 : 0);

      return {
        data: normalized,
        pagination: {
          page: pagination.page ?? params?.page ?? 1,
          pageSize: pagination.pageSize ?? params?.pageSize ?? normalized.length,
          totalCount,
          totalPages: pagination.totalPages ?? 1,
          hasNext: Boolean(pagination.hasNext),
          hasPrevious: Boolean(pagination.hasPrevious),
          itemsOnPage: pagination.itemsOnPage ?? normalized.length,
          firstItemNumber: firstItem,
          lastItemNumber: lastItem,
        },
      };
    }

    return {
      data: [],
      pagination: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 25,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        itemsOnPage: 0,
        firstItemNumber: 0,
        lastItemNumber: 0,
      },
    };
  },

  // Update filiale
  updateFiliale: async (
    id: number,
    data: { name?: string; active?: boolean }
  ): Promise<Filiale> => {
    const response = await apiClient.patch<ApiResponse<Filiale>>(
      `/api/filiales/${id}`,
      data
    );
    return response.data.data;
  },

  // Activate filiale
  activateFiliale: async (id: number): Promise<Filiale> => {
    const response = await apiClient.post<ApiResponse<Filiale>>(
      `/api/filiales/${id}/activate`
    );
    return response.data.data;
  },

  // Deactivate filiale
  deactivateFiliale: async (id: number): Promise<Filiale> => {
    const response = await apiClient.post<ApiResponse<Filiale>>(
      `/api/filiales/${id}/deactivate`
    );
    return response.data.data;
  },
};
