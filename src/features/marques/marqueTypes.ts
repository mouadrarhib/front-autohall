// src/features/marques/marqueTypes.ts

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface MarqueFormState {
  name: string;
  idFiliale: number | null;
  image?: File; // Only file upload - no URL
  active: boolean;
}

export type DialogMode = 'create' | 'edit';
