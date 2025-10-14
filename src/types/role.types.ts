// src/types/role.types.ts
export interface Role {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  active: boolean;
}
