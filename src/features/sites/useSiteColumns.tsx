// src/features/sites/useSiteColumns.tsx

import { useMemo } from 'react';
import { Button, Chip, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';
import type { Filiale } from '../../api/endpoints/filiale.api';
import type { Succursale } from '../../api/endpoints/succursale.api';
import type { SiteType } from './siteTypes';

interface UseSiteColumnsArgs {
  siteType: SiteType;
  hasUpdate: boolean;
  togglingId: number | null;
  onEdit: (site: Filiale | Succursale) => void;
  onToggleActive: (site: Filiale | Succursale) => void;
}

export const useSiteColumns = ({
  siteType,
  hasUpdate,
  togglingId,
  onEdit,
  onToggleActive,
}: UseSiteColumnsArgs): GridColDef[] => {
  return useMemo<GridColDef[]>(() => {
    return [
      {
        field: 'name',
        headerName: siteType === 'filiale' ? 'Filiale' : 'Succursale',
        flex: 1.2,
        minWidth: 260,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {row.name}
          </Typography>
        ),
      },
      {
        field: 'active',
        headerName: 'Statut',
        width: 180,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <Chip
              label={row.active ? 'Active' : 'Inactive'}
              color={row.active ? 'success' : 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: hasUpdate ? 280 : 160,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            {hasUpdate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(row);
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Modifier
              </Button>
            )}
            {hasUpdate && (
              <Button
                variant="contained"
                size="small"
                color={row.active ? 'error' : 'success'}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleActive(row);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 110,
                }}
                disabled={togglingId === row.id}
              >
                {togglingId === row.id ? 'Patientez...' : row.active ? 'Desactiver' : 'Activer'}
              </Button>
            )}
          </Stack>
        ),
      },
    ];
  }, [siteType, hasUpdate, onEdit, onToggleActive, togglingId]);
};
