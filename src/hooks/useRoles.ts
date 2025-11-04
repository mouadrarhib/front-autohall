// src/hooks/useRoles.ts

import { useAuthStore } from '../store/authStore';

// Define your role names as constants
export const ROLES = {
  ADMIN_FONCTIONNEL: 'administrateur fonctionnel',
  INTEGRATEUR_OBJECTIFS: 'intégrateur des objectifs',
  INTEGRATEUR_VENTES: 'intégrateur des ventes',
  ADMIN_SYSTEM: 'administrateur system',
  OPERATIONS_MANAGER: 'OperationsManager',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

export const useRoles = () => {
  const roles = useAuthStore((state) => state.roles);
  const hasRole = useAuthStore((state) => state.hasRole);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const hasAllRoles = useAuthStore((state) => state.hasAllRoles);

  const getRoleNames = (): string[] => {
    return roles.map((role: any) => role.RoleName || role.name || role.roleName || '');
  };

  return {
    userRoles: roles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getRoleNames,
    isAdminFonctionnel: hasRole(ROLES.ADMIN_FONCTIONNEL),
    isIntegrateurObjectifs: hasRole(ROLES.INTEGRATEUR_OBJECTIFS),
    isIntegrateurVentes: hasRole(ROLES.INTEGRATEUR_VENTES),
    isAdminSystem: hasRole(ROLES.ADMIN_SYSTEM),
    isOperationsManager: hasRole(ROLES.OPERATIONS_MANAGER),
  };
};
