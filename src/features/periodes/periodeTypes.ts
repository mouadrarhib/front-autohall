// src/features/periodes/periodeTypes.ts

export interface PeriodeFormState {
  year: number;
  month: number;
  week: number;
  startedDate: string;
  endDate: string;
  typePeriodeId: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export type DialogMode = 'create' | 'edit';
