// src/features/versions/useVersionColumns.tsx

import { useMemo } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';

import type { Version } from '../../api/endpoints/version.api';

interface UseVersionColumnsArgs {
  hasUpdate: boolean;
  togglingId: number | null;
  onEdit: (version: Version) => void;
  onToggleActive: (version: Version) => void;
}

export const useVersionColumns = ({
  hasUpdate,
  togglingId,
  onEdit,
  onToggleActive,
}: UseVersionColumnsArgs): GridColDef<Version>[] => {
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
      }),
    []
  );

  return useMemo<GridColDef<Version>[]>(() => {
    const alignCell = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    } as const;

    const numericTextStyle = {
      fontWeight: 600,
      lineHeight: 1,
    } as const;

    return [
      {
        field: 'name',
        headerName: 'Version',
        flex: 1.2,
        minWidth: 220,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {row.name}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'modeleName',
        headerName: 'Modele',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Chip
              label={row.modeleName ?? 'N/A'}
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
                bgcolor: alpha('#7c3aed', 0.12),
                color: '#5b21b6',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'price',
        headerName: 'Prix',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography variant="body2" sx={numericTextStyle}>
              {currencyFormatter.format(row.price ?? 0)}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'volume',
        headerName: 'Volume',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography variant="body2" sx={numericTextStyle}>
              {row.volume}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'tm',
        headerName: 'TM (%)',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography variant="body2" sx={numericTextStyle}>
              {`${((row.tm ?? 0) * 100).toFixed(1)}%`}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'margin',
        headerName: 'Marge (%)',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography variant="body2" sx={numericTextStyle}>
              {`${((row.margin ?? 0) * 100).toFixed(1)}%`}
            </Typography>
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
        width: 260,
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
  }, [currencyFormatter, hasUpdate, onEdit, onToggleActive, togglingId]);
};
