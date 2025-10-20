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
  imageUrl: string;
  active: boolean;
}

export type DialogMode = 'create' | 'edit';
