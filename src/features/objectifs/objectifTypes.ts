// src/features/objectifs/objectifTypes.ts

export interface ObjectifFormState {
  targetType: 'marque' | 'modele' | 'version';
  groupementId: number;
  siteId: number;
  periodeId: number;
  typeVenteId: number;
  typeObjectifId: number;
  marqueId: number;
  modeleId: number;
  versionId: number;
  volume: string;
  salePrice: string;
  chiffreAffaire: string;
  tmDirect: string;
  margeInterGroupe: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
