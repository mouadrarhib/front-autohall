// src/features/users/userTypes.ts

export interface User {
  UserId: number;
  FullName: string;
  Email: string;
  Username: string;
  UserActive: boolean;
  UserEnabled: boolean;
  UserCreatedAt: string;
  UserUpdatedAt: string | null;
  UserSiteId: number | null;
  GroupementType: string | null;
  SiteId: number | null;
  UserSiteActive: boolean | null;
  SiteName: string;
  SiteActive: boolean | null;
  UserRoles: string | null;
  ActiveRolesCount: number;
  UserPermissions: string | null;
  ActivePermissionsCount: number;
  UserStatus: string;
  LastActivity: string | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
