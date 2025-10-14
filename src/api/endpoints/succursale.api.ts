// src/api/endpoints/succursale.api.ts
import { apiClient, ApiResponse } from '../client';

export interface Succursale {
  id: number;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedSuccursalesResponse {
  data: Succursale[];
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

const normalizeSuccursale = (raw: any): Succursale => ({
  id: raw?.id ?? raw?.Id ?? 0,
  name: raw?.name ?? raw?.Name ?? '',
  active: Boolean(raw?.active ?? raw?.Active ?? false),
  createdAt: raw?.createdAt ?? raw?.CreatedAt,
  updatedAt: raw?.updatedAt ?? raw?.UpdatedAt,
});

export const succursaleApi = {
  // Create a new succursale
  createSuccursale: async (data: { name: string; active?: boolean }): Promise<Succursale> => {
    const response = await apiClient.post<ApiResponse<Succursale>>(
      '/api/succursales',
      data
    );
    return response.data.data;
  },

  // Get succursale by ID
  getSuccursaleById: async (id: number): Promise<Succursale> => {
    const response = await apiClient.get<ApiResponse<Succursale>>(
      `/api/succursales/${id}`
    );
    return response.data.data;
  },

  // List all succursales with pagination
  listSuccursales: async (params?: {
    onlyActive?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedSuccursalesResponse> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedSuccursalesResponse | { data: Succursale[]; pagination?: any } | Succursale[]>
    >('/api/succursales', { params });

    const payload = response.data.data;

    if (Array.isArray(payload)) {
      const normalized = payload.map(normalizeSuccursale);
      return {
        data: normalized,
        pagination: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? normalized.length,
          totalCount: normalized.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          itemsOnPage: normalized.length,
          firstItemNumber: normalized.length ? 1 : 0,
          lastItemNumber: normalized.length,
        },
      };
    }

    if (payload && typeof payload === 'object') {
      const nestedData = Array.isArray((payload as any).data)
        ? (payload as any).data
        : [];

      const pagination = (payload as any).pagination ?? {};
      const normalized = nestedData.map(normalizeSuccursale);
      const totalRecords =
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
          totalCount: totalRecords,
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

  // Search succursales
  searchSuccursales: async (
    searchTerm: string,
    onlyActive?: boolean
  ): Promise<Succursale[]> => {
    const response = await apiClient.get<
      ApiResponse<Succursale[] | { data: Succursale[] }>
    >('/api/succursales/search', { params: { q: searchTerm, onlyActive } });

    const payload = response.data.data;
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : [];

    return list.map(normalizeSuccursale);
  },

  // Update succursale
  updateSuccursale: async (
    id: number,
    data: { name?: string; active?: boolean }
  ): Promise<Succursale> => {
    const response = await apiClient.patch<ApiResponse<Succursale>>(
      `/api/succursales/${id}`,
      data
    );
    return response.data.data;
  },

  // Activate succursale
  activateSuccursale: async (id: number): Promise<Succursale> => {
    const response = await apiClient.post<ApiResponse<Succursale>>(
      `/api/succursales/${id}/activate`
    );
    return response.data.data;
  },

  // Deactivate succursale
  deactivateSuccursale: async (id: number): Promise<Succursale> => {
    const response = await apiClient.post<ApiResponse<Succursale>>(
      `/api/succursales/${id}/deactivate`
    );
    return response.data.data;
  },
};
