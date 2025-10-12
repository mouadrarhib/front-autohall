// src/hooks/usePermissions.ts
import { useAuthStore } from '../store/authStore';

export const usePermissions = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canRead: (resource: string) => hasPermission(`${resource}_READ`),
    canCreate: (resource: string) => hasPermission(`${resource}_CREATE`),
    canUpdate: (resource: string) => hasPermission(`${resource}_UPDATE`),
    canDelete: (resource: string) => hasPermission(`${resource}_DELETE`),
  };
};
