// src/types/usersite.types.ts
export interface Groupement {
  id: number;
  name: string; // "Filiale" or "Succursale"
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSite {
  id: number;
  idGroupement: number;
  groupement_name: string;  // snake_case to match backend
  idSite: number;
  site_name: string;  // snake_case to match backend
  site_type: 'Filiale' | 'Succursale';  // snake_case to match backend
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserSiteRequest {
  idGroupement: number;
  idSite: number;
  active?: boolean;
}

export interface UpdateUserSiteRequest {
  idGroupement: number;
  idSite: number;
  active: boolean;
}

export interface SearchUserSiteFilters {
  idGroupement?: number;
  groupement_name?: string;
  idSite?: number;
  site_type?: 'Filiale' | 'Succursale';
  onlyActive?: boolean;
}

export interface CreateGroupementRequest {
  name: string;
  active?: boolean;
}

export interface UpdateGroupementRequest {
  name?: string;
  active?: boolean;
}
