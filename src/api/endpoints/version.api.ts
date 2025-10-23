// src/api/endpoints/version.api.ts
import { apiClient, ApiResponse } from '../client';

export interface Version {
  id: number;
  nom: string;
  idModele: number;
  volume: number;
  prixDeVente: number;
  tmDirect: number;
  tmInterGroupe: number;
  active: boolean;
  nomModele?: string;
  nomMarque?: string;
  idMarque?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVersionDto {
  name: string;
  idModele: number;
  volume: number;
  salePrice: number;
  tmDirect: number;
  tmInterGroupe: number;
}

export interface UpdateVersionDto {
  name?: string;
  idModele?: number;
  volume?: number;
  salePrice?: number;
  tmDirect?: number;
  tmInterGroupe?: number;
  active?: boolean;
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
  page?: number;
  pageSize?: number;
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
      nom: '',
      idModele: 0,
      volume: 0,
      prixDeVente: 0,
      tmDirect: 0,
      tmInterGroupe: 0,
      active: false,
    };
  }

  return {
    id: toNumber(input.id),
    nom: input.nom ?? input.name ?? '',
    idModele: toNumber(input.idModele),
    volume: toNumber(input.volume),
    prixDeVente: toNumber(input.prixDeVente ?? input.salePrice),
    tmDirect: toNumber(input.tmDirect),
    tmInterGroupe: toNumber(input.tmInterGroupe),
    active: Boolean(input.active),
    nomModele: input.nomModele,
    nomMarque: input.nomMarque,
    idMarque: input.idMarque ? toNumber(input.idMarque) : undefined,
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

export const versionApi = {
  create: async (data: CreateVersionDto): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<any>>('/api/versions', data);
    return normalizeVersion(response.data.data);
  },

  getById: async (id: number): Promise<Version> => {
    const response = await apiClient.get<ApiResponse<any>>(`/api/versions/${id}`);
    return normalizeVersion(response.data.data);
  },

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

  search: async (params: SearchVersionParams): Promise<{
    data: Version[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const query = {
      q: params.q,
      idModele: params.idModele,
      onlyActive: params.onlyActive ?? true,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    };

    const response = await apiClient.get<ApiResponse<any>>('/api/versions/search', {
      params: query,
    });

    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
  },

  update: async (id: number, data: UpdateVersionDto): Promise<Version> => {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/versions/${id}`, data);
    return normalizeVersion(response.data.data);
  },

  activate: async (id: number): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/versions/${id}/activate`);
    return normalizeVersion(response.data.data);
  },

  deactivate: async (id: number): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/versions/${id}/deactivate`);
    return normalizeVersion(response.data.data);
  },
};
