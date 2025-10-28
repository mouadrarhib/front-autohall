// src/features/users/useUserColumns.tsx

import { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import type { GridColDef } from '@mui/x-data-grid';
import type { User } from './userTypes';

interface UseUserColumnsArgs {
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  onView: (userId: number, event: React.MouseEvent) => void;
  onEdit: (userId: number, event: React.MouseEvent) => void;
}

export const useUserColumns = ({
  isSmallScreen,
  isMediumScreen,
  onView,
  onEdit,
}: UseUserColumnsArgs): GridColDef<User>[] => {
  const baseColumns = useMemo<GridColDef<User>[]>(() => {
    return [
      // Full Name Column
      {
        field: 'FullName',
        headerName: 'Full Name',
        minWidth: 200,
        flex: 1.2,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'text-center-cell',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={500}>
            {params.row.FullName}
          </Typography>
        ),
      },

      // Email Column
      {
        field: 'Email',
        headerName: 'Email',
        minWidth: 220,
        flex: 1.4,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'text-center-cell',
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.row.Email}
          </Typography>
        ),
      },

      // Groupement Column
      {
        field: 'GroupementType',
        headerName: 'Groupement',
        minWidth: 150,
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const isFiliale = params.row.GroupementType?.toLowerCase() === 'filiale';
          return (
            <Chip
              icon={isFiliale ? <BusinessIcon /> : <StoreIcon />}
              label={params.row.GroupementType || '-'}
              size="small"
              sx={{
                bgcolor: alpha(isFiliale ? '#22c55e' : '#0ea5e9', 0.12),
                color: isFiliale ? '#166534' : '#0c4a6e',
                fontWeight: 600,
              }}
            />
          );
        },
      },

      // Site Column
      {
        field: 'SiteName',
        headerName: 'Site',
        minWidth: 170,
        flex: 1.1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2">{params.row.SiteName || '-'}</Typography>
        ),
      },

      // Status Column
      {
        field: 'UserStatus',
        headerName: 'Status',
        minWidth: 130,
        flex: 0.9,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={params.row.UserActive ? 'Active' : 'Inactive'}
            size="small"
            color={params.row.UserActive ? 'success' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        ),
      },

      // Actions Column - SIMPLIFIED (only View + Edit)
      {
        field: 'actions',
        headerName: 'Actions',
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        minWidth: 120,
        flex: 0.8,
        renderCell: (params) => (
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            {/* View Button */}
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={(event) => onView(params.row.UserId, event)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: 'primary.main',
                    transform: 'scale(1.09)',
                  },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Edit Button - Now handles both info AND permissions */}
            <Tooltip title="Edit User">
              <IconButton
                size="small"
                onClick={(event) => onEdit(params.row.UserId, event)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.12),
                    color: 'warning.main',
                    transform: 'scale(1.09)',
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ];
  }, [onEdit, onView]);

  return useMemo(() => {
    if (isSmallScreen) {
      return baseColumns.filter((column) =>
        ['FullName', 'Email', 'UserStatus', 'actions'].includes(column.field as string)
      );
    }

    if (isMediumScreen) {
      return baseColumns.filter((column) =>
        !['GroupementType'].includes(column.field as string)
      );
    }

    return baseColumns;
  }, [baseColumns, isMediumScreen, isSmallScreen]);
};
