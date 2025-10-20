// src/features/versions/versionTypes.ts

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface VersionFormState {
  name: string;
  idMarque: number | null;
  idModele: number | null;
  volume: number;
  price: number;
  tmPercent: number;
  marginPercent: number;
  active: boolean;
}

export type DialogMode = 'create' | 'edit';
