// src/features/modeles/modeleTypes.ts

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ModeleFormState {
  name: string;
  idMarque: number | null;
  image?: File; // ✅ CHANGED: from imageUrl to image
  active: boolean;
}

export type DialogMode = 'create' | 'edit';
