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
}: UseVersionColumnsArgs): GridColDef[] => {
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

    return [
      {
        field: 'nom',
        headerName: 'Version',
        flex: 1.2,
        minWidth: 220,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignCellLeft}>
            <Typography variant="body2" fontWeight={600}>
              {row.nom}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'nomModele',
        headerName: 'Modele',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Chip
              label={row.nomModele ?? 'N/A'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        ),
      },
      {
        field: 'nomMarque',
        headerName: 'Marque',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Chip
              label={row.nomMarque ?? 'N/A'}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        ),
      },
      {
        field: 'prixDeVente',
        headerName: 'Prix',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography sx={numericTextStyle}>
              {currencyFormatter.format(row.prixDeVente ?? 0)}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'tmDirect',
        headerName: 'TM (%)',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography sx={numericTextStyle}>
              {`${(row.tmDirect ?? 0).toFixed(1)}%`}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'tmInterGroupe',
        headerName: 'Marge (%)',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={alignCell}>
            <Typography sx={numericTextStyle}>
              {`${(row.tmInterGroupe ?? 0).toFixed(1)}%`}
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
  }, [currencyFormatter, hasUpdate, onEdit, onToggleActive, togglingId]);
};
