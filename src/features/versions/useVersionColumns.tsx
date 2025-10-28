// src/features/versions/useVersionColumns.tsx

import { useMemo } from 'react';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';
import type { Version } from '../../api/endpoints/version.api';

interface UseVersionColumnsArgs {
  hasUpdate: boolean;
  togglingId: number | null;
  onView: (version: Version) => void;
  onEdit: (version: Version) => void;
  onToggleActive: (version: Version) => void;
}

export const useVersionColumns = ({
  hasUpdate,
  togglingId,
  onView,
  onEdit,
  onToggleActive,
}: UseVersionColumnsArgs): GridColDef<Version>[] => {
  return useMemo(() => {
    return [
      // Version Name Column
      {
        field: 'nom',
        headerName: 'Version',
        flex: 1.5,
        minWidth: 250,
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
              {row.nom}
            </Typography>
          </Box>
        ),
      },

      // Status Column
      {
        field: 'active',
        headerName: 'Statut',
        width: 150,
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
            <Chip
              label={row.active ? 'Active' : 'Inactive'}
              size="small"
              color={row.active ? 'success' : 'default'}
              sx={{
                fontWeight: 600,
                minWidth: 90,
              }}
            />
          </Box>
        ),
      },

      // Actions Column
      {
        field: 'actions',
        headerName: 'Actions',
        width: 320,
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

            {/* Toggle Active Button */}
            {hasUpdate && (
              <Button
                variant={row.active ? 'outlined' : 'contained'}
                color={row.active ? 'error' : 'success'}
                size="small"
                onClick={() => onToggleActive(row)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 110,
                }}
                disabled={togglingId === row.id}
              >
                {togglingId === row.id
                  ? 'Patientez...'
                  : row.active
                  ? 'Désactiver'
                  : 'Activer'}
              </Button>
            )}
          </Stack>
        ),
      },
    ];
  }, [hasUpdate, onEdit, onToggleActive, onView, togglingId]);
};
