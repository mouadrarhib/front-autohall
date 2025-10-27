// src/api/endpoints/marque.api.ts
import { apiClient, type ApiResponse } from '../client';

export interface Marque {
  id: number;
  name: string;
  idFiliale: number;
  imageUrl?: string | null;
  active: boolean;
  filialeName?: string;
  filialeActive?: boolean;
  averageSalePrice?: number;
  revenue?: number;
  tmDirect?: number;
  tmInterGroupe?: number;
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

type RawMarque = Record<string, any>;

const toNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const toNullableNumber = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeMarque = (input: RawMarque): Marque => {
  if (!input || typeof input !== 'object') {
    return {
      id: 0,
      name: '',
      idFiliale: 0,
      imageUrl: null,
      active: false,
    };
  }

  const image = input.imageUrl ?? input.image ?? null;

  return {
    id: toNumber(input.id),
    name: input.name ?? input.nom ?? '',
    idFiliale: toNumber(input.idFiliale),
    imageUrl: typeof image === 'string' && image.length > 0 ? image : null,
    active: Boolean(input.active ?? input.isActive),
    filialeName: input.filialeName ?? input.nomFiliale ?? undefined,
    filialeActive: input.filialeActive ?? input.filialeIsActive ?? undefined,
    averageSalePrice: toNullableNumber(
      input.prixVenteMoyen ?? input.averageSalePrice ?? input.prixMoyen
    ),
    revenue: toNullableNumber(input.chiffreAffaire ?? input.revenue),
    tmDirect: toNullableNumber(input.tmDirect),
    tmInterGroupe: toNullableNumber(input.tmInterGroupe),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
};

const normalizePaginatedResponse = (
  payload: any,
  fallbackPage: number,
  fallbackPageSize: number
): {
  data: Marque[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
} => {
  const nestedData = payload?.data ?? payload;

  const itemsSource = Array.isArray(nestedData?.data)
    ? nestedData.data
    : Array.isArray(nestedData)
    ? nestedData
    : [];

  const marques = itemsSource.map((item: RawMarque) => normalizeMarque(item));

  const paginationSource = nestedData?.pagination ?? payload?.pagination ?? {};

  const page = toNumber(paginationSource.page, fallbackPage);
  const pageSize = toNumber(paginationSource.pageSize, fallbackPageSize) || fallbackPageSize;
  const totalRecords =
    toNumber(
      paginationSource.totalRecords ??
        paginationSource.totalCount ??
        itemsSource[0]?.TotalRecords ??
        itemsSource[0]?.totalRecords,
      0
    ) || marques.length;
  const totalPages =
    toNumber(paginationSource.totalPages) ||
    (pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 0);

  return {
    data: marques,
    pagination: {
      page,
      pageSize,
      totalRecords,
      totalPages,
    },
  };
};

export const marqueApi = {
  create: async (data: CreateMarqueDto): Promise<Marque> => {
    const response = await apiClient.post<ApiResponse<any>>('/api/marques', data);
    return normalizeMarque(response.data.data);
  },

  getById: async (id: number): Promise<Marque> => {
    const response = await apiClient.get<ApiResponse<any>>(`/api/marques/${id}`);
    return normalizeMarque(response.data.data);
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
    const query = {
      idFiliale: params?.idFiliale,
      onlyActive: params?.onlyActive ?? true,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };

    const response = await apiClient.get<ApiResponse<any>>('/api/marques', {
      params: query,
    });

    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
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
    const query = {
      onlyActive: params?.onlyActive ?? true,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };

    const response = await apiClient.get<ApiResponse<any>>(
      `/api/marques/by-filiale/${idFiliale}`,
      {
        params: query,
      }
    );

    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
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
    const query = {
      search: params.search,
      idFiliale: params.idFiliale,
      onlyActive: params.onlyActive ?? true,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    };

    const response = await apiClient.get<ApiResponse<any>>('/api/marques/search', {
      params: query,
    });

    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
  },

  update: async (id: number, data: UpdateMarqueDto): Promise<Marque> => {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/marques/${id}`, data);
    return normalizeMarque(response.data.data);
  },

  activate: async (id: number): Promise<Marque> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/marques/${id}/activate`);
    return normalizeMarque(response.data.data);
  },

  deactivate: async (id: number): Promise<Marque> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/marques/${id}/deactivate`);
    return normalizeMarque(response.data.data);
  },
};
