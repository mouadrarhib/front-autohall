// src/utils/permissionGrouping.ts
import type { Permission } from '../types/permission.types';

const RESOURCE_LABELS: Record<string, string> = {
  FILIALE: 'Filiale',
  SUCCURSALE: 'Succursale',
  GROUPEMENT: 'Groupement',
  MARQUE: 'Marque',
  MODELE: 'Modele',
  VEHICULE: 'Vehicule',
  SITE: 'Site',
  UTILISATEUR: 'Utilisateur',
  USER: 'Utilisateur',
  ROLE: 'Role',
  PERMISSION: 'Permission',
  OBJECTIF: 'Objectif',
  OBJECTIF_VERSION: 'Objectif Version',
  VENTE: 'Vente',
  STOCK: 'Stock',
  FACTURE: 'Facture',
  COMMANDE: 'Commande',
  CLIENT: 'Client',
};

const ACTION_LABELS: Record<string, string> = {
  LIST: 'Lister',
  READ: 'Voir',
  VIEW: 'Voir',
  CREATE: 'Creer',
  ADD: 'Ajouter',
  UPDATE: 'Modifier',
  EDIT: 'Modifier',
  DELETE: 'Supprimer',
  REMOVE: 'Supprimer',
  EXPORT: 'Exporter',
  MANAGE: 'Gerer',
  ACTIVATE: 'Activer',
  DEACTIVATE: 'Desactiver',
  ASSIGN: 'Assigner',
};

const ACTION_ORDER = [
  'LIST',
  'READ',
  'VIEW',
  'CREATE',
  'ADD',
  'UPDATE',
  'EDIT',
  'DELETE',
  'REMOVE',
  'EXPORT',
  'ACTIVATE',
  'DEACTIVATE',
  'ASSIGN',
  'MANAGE',
];

const toTitleCase = (value: string): string => {
  if (!value) {
    return '';
  }

  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const getResourceLabel = (resourceKey: string): string => {
  if (!resourceKey) {
    return '';
  }

  return RESOURCE_LABELS[resourceKey] ?? toTitleCase(resourceKey);
};

const getActionLabel = (actionKey: string): string => {
  if (!actionKey) {
    return '';
  }

  return ACTION_LABELS[actionKey] ?? toTitleCase(actionKey);
};

const getActionOrder = (actionKey: string): number => {
  const index = ACTION_ORDER.indexOf(actionKey);
  return index === -1 ? ACTION_ORDER.length : index;
};

const normalizePermissionName = (
  rawName?: string
): { resourceKey: string; actionKey: string } => {
  if (!rawName) {
    return { resourceKey: '', actionKey: '' };
  }

  const segments = rawName.split('_');

  if (segments.length === 1) {
    return { resourceKey: rawName, actionKey: 'MANAGE' };
  }

  const actionKey = segments.pop() ?? 'MANAGE';
  const resourceKey = segments.join('_');

  return { resourceKey, actionKey };
};

export interface GroupedPermissionAction {
  permission: Permission;
  actionKey: string;
  actionLabel: string;
  rawKey: string;
}

export interface PermissionGroup {
  resourceKey: string;
  resourceLabel: string;
  items: GroupedPermissionAction[];
}

interface GroupPermissionsOptions {
  searchTerm?: string;
}

const matchTerm = (term: string, ...candidates: string[]): boolean => {
  if (!term) {
    return true;
  }

  const loweredTerm = term.toLowerCase();
  return candidates.some((candidate) =>
    candidate.toLowerCase().includes(loweredTerm)
  );
};

export const groupPermissions = (
  permissions: Permission[],
  options: GroupPermissionsOptions = {}
): PermissionGroup[] => {
  const { searchTerm } = options;

  const groups = new Map<string, PermissionGroup>();

  permissions.forEach((permission) => {
    const rawName = permission.name || '';
    const { resourceKey, actionKey } = normalizePermissionName(rawName);

    const resourceLabel = getResourceLabel(resourceKey);
    const actionLabel = getActionLabel(actionKey);

    if (
      !matchTerm(
        searchTerm ?? '',
        rawName,
        resourceKey,
        resourceLabel,
        actionKey,
        actionLabel
      )
    ) {
      return;
    }

    const groupKey = `${resourceKey}::${resourceLabel}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        resourceKey,
        resourceLabel,
        items: [],
      });
    }

    const group = groups.get(groupKey);
    if (!group) {
      return;
    }

    group.items.push({
      permission,
      actionKey,
      actionLabel,
      rawKey: rawName,
    });
  });

  const sortedGroups = Array.from(groups.values()).map((group) => ({
    ...group,
    items: group.items
      .slice()
      .sort((a, b) => {
        const orderDiff =
          getActionOrder(a.actionKey) - getActionOrder(b.actionKey);
        if (orderDiff !== 0) {
          return orderDiff;
        }
        return a.actionLabel.localeCompare(b.actionLabel, 'fr', {
          sensitivity: 'base',
        });
      }),
  }));

  return sortedGroups.sort((a, b) =>
    a.resourceLabel.localeCompare(b.resourceLabel, 'fr', {
      sensitivity: 'base',
    })
  );
};

export const permissionGroupingUtils = {
  groupPermissions,
};

