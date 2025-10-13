// src/types/permission.types.ts
export interface Permission {
  id: number;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPermissionLink {
  UserId: number;
  Username: string;
  PermissionId: number;
  PermissionName: string;
  PermissionActive: boolean;
  UserPermissionActive: boolean;
  TotalRecords?: number;
}

export interface CreatePermissionRequest {
  name: string;
  active?: boolean;
}

export interface UpdatePermissionRequest {
  name?: string;
  active?: boolean;
}

export interface AssignPermissionRequest {
  idPermission: number;
}

export interface PermissionsListResponse {
  data: Permission[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface UserPermissionsResponse {
  data: UserPermissionLink[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
