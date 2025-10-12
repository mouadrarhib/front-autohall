// src/types/auth.types.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  full_name: string;
  password: string;
  idUserSite?: number;
  actif?: boolean;
}

export interface LoginResponse {
  user: UserProfile;
  // No token field - backend uses cookies
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  actif: boolean;
  idUserSite?: number;
}

export interface UserRole {
  UserId: number;
  Username: string;
  RoleId: number;
  RoleName: string;
  RoleActive: boolean;
  UserRoleActive: boolean;
  TotalRecords: number;
}

export interface UserPermission {
  UserId: number;
  Username: string;
  PermissionId: number;
  PermissionName: string;
  PermissionActive: boolean;
  UserPermissionActive: boolean;
  TotalRecords: number;
}

export interface CreateUserCompleteRequest {
  full_name: string;
  email: string;
  username: string;
  password: string;
  groupement_name: 'filiale' | 'succursale';
  site_id: number;
  role_ids?: number[];
  permission_ids?: number[];
}

export interface PaginatedPermissionsResponse {
  data: UserPermission[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    itemsOnPage: number;
    firstItemNumber: number;
    lastItemNumber: number;
  };
}
