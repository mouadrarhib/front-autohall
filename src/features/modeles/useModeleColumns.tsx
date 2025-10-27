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
}: UseModeleColumnsArgs): GridColDef[] => {
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
      }),
    []
  );

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

    const numericTextStyle = {
      fontWeight: 600,
      lineHeight: 1,
    } as const;

    const formatPercent = (value?: number | null) => {
      if (value === null || value === undefined) {
        return '—';
      }

      return `${value.toFixed(1)}%`;
    };

    return [
      {
        field: 'modele',
        headerName: 'Modele',
        flex: 1.5,
        minWidth: 300,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignCellLeft}>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Box
                sx={{
                  position: 'relative',
                  width: 150,
                  height: 96,
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 12px 28px rgba(15, 35, 95, 0.15)',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: alpha('#0A1F44', 0.04),
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(10,31,68,0.35), rgba(10,31,68,0))',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::after': {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  component="img"
                  src={row.imageUrl || '/placeholder-car.png'}
                  alt={row.name}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src = '/placeholder-car.png';
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {row.name}
              </Typography>
            </Stack>
          </Box>
        ),
      },
      {
        field: 'marqueName',
        headerName: 'Marque',
        flex: 1,
        minWidth: 180,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Chip
              label={row.marqueName ?? 'N/A'}
              size="medium"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.9rem' }}
            />
          </Box>
        ),
      },
      {
        field: 'averageSalePrice',
        headerName: 'Prix de vente',
        width: 170,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography sx={numericTextStyle}>
              {row.averageSalePrice !== undefined && row.averageSalePrice !== null
                ? currencyFormatter.format(row.averageSalePrice)
                : '—'}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'tmDirect',
        headerName: 'TM Direct',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography sx={numericTextStyle}>{formatPercent(row.tmDirect)}</Typography>
          </Box>
        ),
      },
      {
        field: 'tmInterGroupe',
        headerName: 'TM InterGroupe',
        width: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography sx={numericTextStyle}>{formatPercent(row.tmInterGroupe)}</Typography>
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
              label={row.active ? 'Actif' : 'Inactif'}
              color={row.active ? 'success' : 'default'}
              size="medium"
              sx={{ fontWeight: 700, minWidth: 90, fontSize: '0.85rem' }}
            />
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 280,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
              {hasUpdate && (
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(row)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                  }}
                >
                  Modifier
                </Button>
              )}
              {hasUpdate && (
                <Button
                  variant={row.active ? 'outlined' : 'contained'}
                  size="medium"
                  color={row.active ? 'error' : 'success'}
                  onClick={() => onToggleActive(row)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 120,
                    px: 2.5,
                  }}
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
  }, [currencyFormatter, hasUpdate, onEdit, onToggleActive, togglingId]);
};
