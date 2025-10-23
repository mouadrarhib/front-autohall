// src/features/marques/useMarqueColumns.tsx
import { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';
import type { Marque } from '../../api/endpoints/marque.api';

interface UseMarqueColumnsArgs {
  hasUpdate: boolean;
  togglingId: number | null;
  onEdit: (marque: Marque) => void;
  onToggleActive: (marque: Marque) => void;
}

export const useMarqueColumns = ({
  hasUpdate,
  togglingId,
  onEdit,
  onToggleActive,
}: UseMarqueColumnsArgs): GridColDef[] => {
  return useMemo<GridColDef[]>(() => {
    const alignCell = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    } as const;

    const alignCellLeft = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      height: '100%',
    } as const;

    return [
      {
        field: 'marque',
        headerName: 'Marque',
        flex: 1.5,
        minWidth: 250,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignCellLeft}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                component="img"
                src={row.imageUrl || '/placeholder-brand.png'}
                alt={row.name}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/placeholder-brand.png';
                }}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  p: 1,
                }}
              />
              <Typography variant="body2" fontWeight={600}>
                {row.name}
              </Typography>
            </Stack>
          </Box>
        ),
      },
      {
        field: 'filialeName',
        headerName: 'Filiale',
        flex: 1,
        minWidth: 180,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Chip
              label={row.filialeName ?? 'N/A'}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        ),
      },
      {
        field: 'active',
        headerName: 'Statut',
        width: 140,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Chip
              label={row.active ? 'Actif' : 'Inactif'}
              color={row.active ? 'success' : 'default'}
              size="small"
              sx={{ fontWeight: 700, minWidth: 80 }}
            />
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 260,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
              {hasUpdate && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(row)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Modifier
                </Button>
              )}
              {hasUpdate && (
                <Button
                  variant={row.active ? 'outlined' : 'contained'}
                  size="small"
                  color={row.active ? 'error' : 'success'}
                  onClick={() => onToggleActive(row)}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 110 }}
                  disabled={togglingId === row.id}
                >
                  {togglingId === row.id ? 'Patientez...' : row.active ? 'Desactiver' : 'Activer'}
                </Button>
              )}
            </Stack>
          </Box>
        ),
      },
    ];
  }, [hasUpdate, onEdit, onToggleActive, togglingId]);
};
