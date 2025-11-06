// src/api/endpoints/modele.api.ts

import { apiClient, type ApiResponse } from '../client';

export interface Modele {
  id: number;
  name: string;
  idMarque: number;
  imageUrl?: string | null; // Backend stores Cloudinary URL
  active: boolean;
  marqueName?: string;
  marqueActive?: boolean;
  filialeName?: string;
  filialeActive?: boolean;
  averageSalePrice?: number;
  revenue?: number;
  tmDirect?: number;
  tmInterGroupe?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModeleDto {
  name: string;
  idMarque: number;
  image?: File; // ✅ CHANGED: Only file upload
  active?: boolean;
}

export interface UpdateModeleDto {
  name?: string | null;
  idMarque?: number | null;
  image?: File; // ✅ CHANGED: Only file upload
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

type RawModele = Record<string, any>;

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

const normalizeModele = (input: RawModele): Modele => {
  if (!input || typeof input !== 'object') {
    return {
      id: 0,
      name: '',
      idMarque: 0,
      imageUrl: null,
      active: false,
    };
  }

  const image = input.imageUrl ?? input.image ?? null;
  return {
    id: toNumber(input.id),
    name: input.name ?? input.nom ?? '',
    idMarque: toNumber(input.idMarque),
    imageUrl: typeof image === 'string' && image.length > 0 ? image : null,
    active: Boolean(input.active ?? input.isActive),
    marqueName: input.marqueName ?? input.nomMarque ?? input.nameMarque ?? undefined,
    marqueActive: input.marqueActive ?? input.marqueIsActive ?? undefined,
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
  data: Modele[];
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

  const modeles = itemsSource.map((item: RawModele) => normalizeModele(item));
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
    ) || modeles.length;
  const totalPages =
    toNumber(paginationSource.totalPages) ||
    (pageSize > 0 ? Math.ceil(totalRecords / pageSize) : 0);

  return {
    data: modeles,
    pagination: {
      page,
      pageSize,
      totalRecords,
      totalPages,
    },
  };
};

// ✅ NEW: Convert DTO to FormData
const toFormData = (data: CreateModeleDto | UpdateModeleDto): FormData => {
  const formData = new FormData();
  
  if ('name' in data && data.name !== undefined && data.name !== null) {
    formData.append('name', data.name);
  }
  
  if ('idMarque' in data && data.idMarque !== undefined && data.idMarque !== null) {
    formData.append('idMarque', String(data.idMarque));
  }
  
  if ('image' in data && data.image instanceof File) {
    formData.append('image', data.image);
  }
  
  if ('active' in data && data.active !== undefined && data.active !== null) {
    formData.append('active', String(data.active));
  }
  
  return formData;
};

export const modeleApi = {
  // ✅ MODIFIED: Always use FormData
  create: async (data: CreateModeleDto): Promise<Modele> => {
    const formData = toFormData(data);
    const response = await apiClient.post<ApiResponse<Modele>>('/api/modeles', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeModele(response.data.data);
  },

  getById: async (id: number): Promise<Modele> => {
    const response = await apiClient.get<ApiResponse<Modele>>(`/api/modeles/${id}`);
    return normalizeModele(response.data.data);
  },

  list: async (params?: ModeleListParams): Promise<{
    data: Modele[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const query = {
      idMarque: params?.idMarque,
      onlyActive: params?.onlyActive ?? true,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    const response = await apiClient.get<ApiResponse<any>>('/api/modeles', {
      params: query,
    });
    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
  },

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
    const query = {
      onlyActive: params?.onlyActive ?? true,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/modeles/by-marque/${idMarque}`,
      {
        params: query,
      }
    );
    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
  },

  search: async (params: SearchModeleParams): Promise<{
    data: Modele[];
    pagination: {
      page: number;
      pageSize: number;
      totalRecords: number;
      totalPages: number;
    };
  }> => {
    const query = {
      q: params.q,
      idMarque: params.idMarque,
      onlyActive: params.onlyActive ?? true,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    };
    const response = await apiClient.get<ApiResponse<any>>('/api/modeles/search', {
      params: query,
    });
    return normalizePaginatedResponse(response.data.data, query.page, query.pageSize);
  },

  // ✅ MODIFIED: Always use FormData
  update: async (id: number, data: UpdateModeleDto): Promise<Modele> => {
    const formData = toFormData(data);
    const response = await apiClient.patch<ApiResponse<Modele>>(`/api/modeles/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeModele(response.data.data);
  },

  activate: async (id: number): Promise<Modele> => {
    const response = await apiClient.post<ApiResponse<Modele>>(`/api/modeles/${id}/activate`);
    return normalizeModele(response.data.data);
  },

  deactivate: async (id: number): Promise<Modele> => {
    const response = await apiClient.post<ApiResponse<Modele>>(`/api/modeles/${id}/deactivate`, {});
    return normalizeModele(response.data.data);
  },
};
