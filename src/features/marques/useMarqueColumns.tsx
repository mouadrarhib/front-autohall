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
}: UseMarqueColumnsArgs): GridColDef<Marque>[] => {
  return useMemo<GridColDef<Marque>[]>(() => {
    const alignCell = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    } as const;

    return [
      {
        field: 'marque',
        headerName: 'Marque',
        flex: 1.6,
        minWidth: 240,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ minWidth: 0, width: '100%', justifyContent: 'flex-start' }}
          >
            <Box
              component="img"
              src={row.imageUrl ?? ''}
              alt={row.name}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = '';
              }}
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 0.5,
                boxShadow: '0 6px 14px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {row.name}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'filialeName',
        headerName: 'Filiale',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Chip
              label={row.filialeName ?? 'N/A'}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: alpha('#2563eb', 0.15),
                color: '#1d4ed8',
              }}
            />
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
          <Box sx={alignCell}>
            <Chip
              label={row.active ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: row.active ? alpha('#22c55e', 0.15) : alpha('#94a3b8', 0.2),
                color: row.active ? '#15803d' : '#475569',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 270,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            {hasUpdate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => onEdit(row)}
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
                onClick={() => onToggleActive(row)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 110 }}
                disabled={togglingId === row.id}
              >
                {togglingId === row.id ? 'Patientez...' : row.active ? 'Desactiver' : 'Activer'}
              </Button>
            )}
          </Stack>
        ),
      },
    ];
  }, [hasUpdate, onEdit, onToggleActive, togglingId]);
};
