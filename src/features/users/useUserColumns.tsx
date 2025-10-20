// src/features/users/useUserColumns.tsx

import { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import type { GridColDef } from '@mui/x-data-grid';

import type { User } from './userTypes';

interface UseUserColumnsArgs {
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  onView: (userId: number, event: React.MouseEvent) => void;
  onEdit: (userId: number, event: React.MouseEvent) => void;
  onPermissions: (userId: number, event: React.MouseEvent) => void;
}

export const useUserColumns = ({
  isSmallScreen,
  isMediumScreen,
  onView,
  onEdit,
  onPermissions,
}: UseUserColumnsArgs): GridColDef<User>[] => {
  const baseColumns = useMemo<GridColDef<User>[]>(() => {
    const cellCenter = {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as const;

    return [
      {
        field: 'Username',
        headerName: 'Username',
        minWidth: 130,
        flex: 0.9,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'text-center-cell',
        renderCell: (params) => (
          <Box sx={cellCenter}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                maxWidth: '100%',
              }}
            >
              {params.row.Username}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'FullName',
        headerName: 'Full Name',
        minWidth: 180,
        flex: 1.1,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'text-center-cell',
        renderCell: (params) => (
          <Box sx={cellCenter}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                maxWidth: '100%',
              }}
            >
              {params.row.FullName}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'Email',
        headerName: 'Email',
        minWidth: 220,
        flex: 1.4,
        align: 'center',
        headerAlign: 'center',
        cellClassName: 'text-center-cell',
        renderCell: (params) => (
          <Box sx={cellCenter}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {params.row.Email}
            </Typography>
          </Box>
        ),
      },
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
              icon={isFiliale ? <BusinessIcon fontSize="small" /> : <StoreIcon fontSize="small" />}
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
      {
        field: 'SiteName',
        headerName: 'Site',
        minWidth: 170,
        flex: 1.1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {params.row.SiteName || '-'}
          </Typography>
        ),
      },
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
            color={params.row.UserActive ? 'success' : 'default'}
            size="small"
            sx={{
              fontWeight: 600,
              px: 1.5,
              textTransform: 'uppercase',
            }}
          />
        ),
      },
      {
        field: 'ActiveRolesCount',
        headerName: 'Roles',
        minWidth: 120,
        flex: 0.8,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={`${params.row.ActiveRolesCount || 0}`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: 'rgba(59, 130, 246, 0.12)',
              color: 'primary.main',
            }}
          />
        ),
      },
      {
        field: 'ActivePermissionsCount',
        headerName: 'Permissions',
        minWidth: 140,
        flex: 0.9,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={`${params.row.ActivePermissionsCount || 0}`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: 'rgba(147, 51, 234, 0.12)',
              color: '#6d28d9',
            }}
          />
        ),
      },
      {
        field: 'LastActivity',
        headerName: 'Last Activity',
        minWidth: 180,
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.row.LastActivity ? new Date(params.row.LastActivity).toLocaleString() : '-'}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        minWidth: 150,
        flex: 0.9,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="View details" arrow>
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
            <Tooltip title="Edit roles & permissions" arrow>
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
            <Tooltip title="Direct permissions" arrow>
              <IconButton
                size="small"
                onClick={(event) => onPermissions(params.row.UserId, event)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.success.main, 0.12),
                    color: 'success.main',
                    transform: 'scale(1.09)',
                  },
                }}
              >
                <SecurityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];
  }, [onEdit, onPermissions, onView]);

  return useMemo(() => {
    if (isSmallScreen) {
      return baseColumns.filter((column) =>
        ['Username', 'FullName', 'UserStatus', 'actions'].includes(column.field as string)
      );
    }

    if (isMediumScreen) {
      return baseColumns.filter((column) =>
        !['ActivePermissionsCount', 'UserPermissions', 'UserRoles'].includes(column.field as string)
      );
    }

    return baseColumns;
  }, [baseColumns, isMediumScreen, isSmallScreen]);
};
