// src/features/sites/siteTypes.ts

export type SiteType = 'filiale' | 'succursale';
export type DialogMode = 'create' | 'edit';

export interface SiteFormState {
  name: string;
  active: boolean;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
