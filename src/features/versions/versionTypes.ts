// src/features/versions/versionTypes.ts

export interface Version {
  id: number;
  nom: string; // Backend uses 'nom' not 'name'
  idModele: number;
  nomModele?: string; // Backend provides this - make optional
  idMarque?: number; // Backend provides this - make optional
  nomMarque?: string; // Backend provides this - make optional
  prixDeVente: number; // Backend uses 'prixDeVente' not 'price'
  tmDirect: number; // Backend uses 'tmDirect' not 'tm'
  tmInterGroupe: number; // Backend uses 'tmInterGroupe' not 'margin'
  active?: boolean;
  // Legacy fields for backward compatibility
  name?: string;
  modeleName?: string;
  marqueName?: string;
  price?: number;
  tm?: number;
  margin?: number;
  volume?: number;
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

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
