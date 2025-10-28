// src/features/marques/useMarqueColumns.tsx

import { useMemo } from 'react';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import type { GridColDef } from '@mui/x-data-grid';
import type { Marque } from '../../api/endpoints/marque.api';

interface UseMarqueColumnsArgs {
  hasUpdate: boolean;
  togglingId: number | null;
  onView: (marque: Marque) => void;
  onEdit: (marque: Marque) => void;
  onToggleActive: (marque: Marque) => void;
}

export const useMarqueColumns = ({
  hasUpdate,
  togglingId,
  onView,
  onEdit,
  onToggleActive,
}: UseMarqueColumnsArgs): GridColDef<Marque>[] => {
  return useMemo(() => {
    return [
      // Marque Name & Logo Column
      {
        field: 'marque',
        headerName: 'Marque',
        flex: 1.5,
        minWidth: 280,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"  // This centers items vertically
            sx={{ 
              height: '100%',  // Take full cell height
              width: '100%',
            }}
          >
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
                width: 48,  // Slightly smaller for better alignment
                height: 48,
                borderRadius: 2,
                objectFit: 'contain',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 0.5,
                flexShrink: 0,  // Prevent image from shrinking
              }}
            />
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{
                lineHeight: 1.5,  // Better line height for vertical centering
              }}
            >
              {row.name}
            </Typography>
          </Stack>
        ),
      },

      // Status Column
      {
        field: 'active',
        headerName: 'Statut',
        width: 140,
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
            alignItems="center"  // Center items vertically
            sx={{
              height: '100%',  // Take full cell height
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
