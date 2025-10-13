// src/types/permission.types.ts
export interface Permission {
  id: number;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Updated to match backend response exactly
export interface UserPermissionLink {
  idUser: number;
  idPermission: number;
  active: boolean;  // This is the user-permission active status
  permissionName: string;
  permissionActive: boolean;  // This is the permission's own active status
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
    itemsOnPage: number;
    firstItemNumber: number;
    lastItemNumber: number;
  };
}
