// src/features/sites/useSiteColumns.tsx

import { useMemo } from 'react';
import { Button, Chip, IconButton, Stack, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
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
  onViewMarques?: (filiale: Filiale) => void;
}

export const useSiteColumns = ({
  siteType,
  hasUpdate,
  togglingId,
  onEdit,
  onToggleActive,
  onViewMarques,
}: UseSiteColumnsArgs): GridColDef[] => {
  return useMemo<GridColDef[]>(() => {
    const alignCellCenter = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    } as const;

    const alignCellLeft = {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
    } as const;

    return [
      {
        field: 'name',
        headerName: siteType === 'filiale' ? 'Filiale' : 'Succursale',
        flex: 1.6,
        minWidth: 240,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignCellLeft}>
            {row.name}
          </Box>
        ),
      },
      {
        field: 'active',
        headerName: 'Statut',
        width: 150,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCellCenter}>
            <Chip
              label={row.active ? 'Active' : 'Inactive'}
              color={row.active ? 'success' : 'default'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: siteType === 'filiale' && onViewMarques ? 340 : 280,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={1} sx={alignCellCenter}>
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
            {siteType === 'filiale' && onViewMarques && (
              <Tooltip title="Voir les marques">
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewMarques(row as Filiale);
                  }}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <DirectionsCarIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ];
  }, [siteType, hasUpdate, onEdit, onToggleActive, togglingId, onViewMarques]);
};
