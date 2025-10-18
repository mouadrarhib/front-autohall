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

type RawVersion = Record<string, any>;

const toNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const normalizeVersion = (input: RawVersion): Version => {
  if (!input || typeof input !== 'object') {
    return {
      id: 0,
      name: '',
      idModele: 0,
      volume: 0,
      price: 0,
      tm: 0,
      margin: 0,
      active: false,
    };
  }

  const volume = toNumber(input.volume);
  const price = toNumber(input.price ?? input.SalePrice);
  const tm = toNumber(input.tm ?? input.TMDirect);
  const margin = toNumber(input.margin ?? input.MargeInterGroupe);

  return {
    id: toNumber(input.id),
    name: input.name ?? '',
    idModele: toNumber(input.idModele),
    volume,
    price,
    tm,
    margin,
    active: Boolean(input.active),
    modeleName: input.modeleName,
    modeleActive: input.modeleActive,
    marqueName: input.marqueName,
    marqueActive: input.marqueActive,
    filialeName: input.filialeName,
    filialeActive: input.filialeActive,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
};

const normalizePaginatedResponse = (
  payload: any,
  fallbackPage: number,
  fallbackPageSize: number
): {
  data: Version[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
} => {
  const nestedData = payload?.data ?? payload;
  const items = Array.isArray(nestedData?.data) ? nestedData.data : Array.isArray(nestedData) ? nestedData : [];
  const versions = items.map(normalizeVersion);

  const paginationSource = nestedData?.pagination ?? payload?.pagination ?? {};

  const page = toNumber(paginationSource.page, fallbackPage);
  const pageSize = toNumber(paginationSource.pageSize, fallbackPageSize) || fallbackPageSize;
  const totalRecords =
    toNumber(paginationSource.totalRecords ?? paginationSource.totalCount) ||
    (versions.length > 0 ? toNumber(versions[0].TotalRecords ?? versions.length) : 0);
  const totalPages =
    toNumber(paginationSource.totalPages) ||
    (pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 0);

  return {
    data: versions,
    pagination: {
      page,
      pageSize,
      totalRecords,
      totalPages,
    },
  };
};

const mapToCreatePayload = (data: CreateVersionDto) => ({
  name: data.name,
  idModele: data.idModele,
  volume: data.volume,
  salePrice: data.price,
  tmDirect: data.tm,
  margeInterGroupe: data.margin,
});

const mapToUpdatePayload = (data: UpdateVersionDto) => ({
  name: data.name,
  idModele: data.idModele,
  volume: data.volume,
  salePrice: data.price,
  tmDirect: data.tm,
  margeInterGroupe: data.margin,
});

export const versionApi = {
  /**
   * Create a new version
   */
  create: async (data: CreateVersionDto): Promise<Version> => {
    const payload = mapToCreatePayload(data);
    const response = await apiClient.post<ApiResponse<any>>('/api/versions', payload);
    return normalizeVersion(response.data.data);
  },

  /**
   * Get version by ID
   */
  getById: async (id: number): Promise<Version> => {
    const response = await apiClient.get<ApiResponse<any>>(`/api/versions/${id}`);
    return normalizeVersion(response.data.data);
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
    const query = {
      idModele: params?.idModele,
      onlyActive: params?.onlyActive ?? true,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };

    const response = await apiClient.get<ApiResponse<any>>('/api/versions', { params: query });
    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
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
    const query = {
      onlyActive: params.onlyActive ?? true,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    };

    const response = await apiClient.get<ApiResponse<any>>(
      `/api/versions/by-modele/${params.idModele}`,
      { params: query }
    );

    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
  },

  /**
   * Search versions
   */
  search: async (params: SearchVersionParams): Promise<Version[]> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/versions/search', {
      params: {
        q: params.q,
        idModele: params.idModele,
        onlyActive: params.onlyActive ?? true,
      },
    });
    const items = response.data.data ?? [];
    return (Array.isArray(items) ? items : []).map(normalizeVersion);
  },

  /**
   * Update version
   */
  update: async (id: number, data: UpdateVersionDto): Promise<Version> => {
    const payload = mapToUpdatePayload(data);
    const response = await apiClient.patch<ApiResponse<any>>(`/api/versions/${id}`, payload);
    return normalizeVersion(response.data.data);
  },

  /**
   * Activate version
   */
  activate: async (id: number): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/versions/${id}/activate`);
    return normalizeVersion(response.data.data);
  },

  /**
   * Deactivate version
   */
  deactivate: async (id: number): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/versions/${id}/deactivate`);
    return normalizeVersion(response.data.data);
  },
};
