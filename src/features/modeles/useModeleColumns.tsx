// src/features/modeles/useModeleColumns.tsx

import { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';

import type { Modele } from '../../api/endpoints/modele.api';

interface UseModeleColumnsArgs {
  hasUpdate: boolean;
  togglingId: number | null;
  onEdit: (modele: Modele) => void;
  onToggleActive: (modele: Modele) => void;
}

export const useModeleColumns = ({
  hasUpdate,
  togglingId,
  onEdit,
  onToggleActive,
}: UseModeleColumnsArgs): GridColDef<Modele>[] => {
  return useMemo<GridColDef<Modele>[]>(() => {
    const alignCell = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    } as const;

    return [
      {
        field: 'modele',
        headerName: 'Modele',
        flex: 1.4,
        minWidth: 220,
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
                width: 48,
                height: 48,
                borderRadius: 2,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 0.5,
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {row.name}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'marqueName',
        headerName: 'Marque',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Chip
              label={row.marqueName ?? 'N/A'}
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
        width: 140,
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
        width: 240,
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
