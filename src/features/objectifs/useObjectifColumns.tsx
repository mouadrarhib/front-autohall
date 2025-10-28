// src/features/objectifs/useObjectifColumns.tsx

import { useMemo } from 'react';
import { Button, IconButton, Stack, Tooltip, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';
import type { ObjectifView } from '../../api/endpoints/objectif.api';

interface UseObjectifColumnsArgs {
  hasUpdate: boolean;
  onView: (objectif: ObjectifView) => void;
  onEdit: (objectif: ObjectifView) => void;
}

export const useObjectifColumns = ({
  hasUpdate,
  onView,
  onEdit,
}: UseObjectifColumnsArgs): GridColDef<ObjectifView>[] => {
  const formatCurrency = (value?: number | null): string => {
    if (value === null || value === undefined) return '—';
    return `${value.toLocaleString('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DH`;
  };

  return useMemo(() => {
    return [
      // Période Column
      {
        field: 'periodeName',
        headerName: 'Période',
        flex: 1.2,
        minWidth: 180,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {row.periodeName || '—'}
            </Typography>
          </Box>
        ),
      },

      // Site Column
      {
        field: 'SiteName',
        headerName: 'Site',
        flex: 1,
        minWidth: 150,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography variant="body2">
              {row.SiteName || '—'}
            </Typography>
          </Box>
        ),
      },

      // Type Objectif Column
      {
        field: 'typeObjectifName',
        headerName: 'Type Objectif',
        flex: 1,
        minWidth: 140,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography variant="body2">
              {row.typeObjectifName || '—'}
            </Typography>
          </Box>
        ),
      },

      // Marque Column
      {
        field: 'marqueName',
        headerName: 'Marque',
        flex: 1,
        minWidth: 130,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography variant="body2">
              {row.marqueName || '—'}
            </Typography>
          </Box>
        ),
      },

      // Volume Column
      {
        field: 'volume',
        headerName: 'Volume',
        width: 100,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {row.volume ?? '—'}
            </Typography>
          </Box>
        ),
      },

      // Chiffre d'Affaire Column
      {
        field: 'ChiffreDaffaire',
        headerName: 'CA',
        flex: 1,
        minWidth: 130,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(row.ChiffreDaffaire)}
            </Typography>
          </Box>
        ),
      },

      // Actions Column
      {
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{
              height: '100%',
              width: '100%',
            }}
          >
            {/* View Details Button */}
            <Tooltip title="Voir les détails">
              <IconButton
                size="small"
                onClick={() => onView(row)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Edit Button */}
            {hasUpdate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEdit(row)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 100,
                }}
              >
                Modifier
              </Button>
            )}
          </Stack>
        ),
      },
    ];
  }, [hasUpdate, onView, onEdit]);
};
