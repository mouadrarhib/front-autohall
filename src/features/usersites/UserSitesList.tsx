// src/features/usersites/UserSitesList.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataTable } from '../../components/common/DataTable';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/endpoints/auth.api';
import { filialeApi } from '../../api/endpoints/filiale.api';
import { succursaleApi } from '../../api/endpoints/succursale.api';
import type { User as UserWithSite } from '../../types/user.types';

export const UserSitesList: React.FC = () => {
  const navigate = useNavigate();
  const hasCreatePermission = useAuthStore((state) =>
    state.hasPermission('USERSITE_CREATE')
  );
  const hasUpdatePermission = useAuthStore((state) =>
    state.hasPermission('USERSITE_UPDATE')
  );

  const [users, setUsers] = useState<UserWithSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [siteType, setSiteType] = useState<'all' | 'filiale' | 'succursale'>('all');

  const filteredUsers = useMemo(() => {
    return users.map((user) => {
      const formattedGroupement = user.GroupementType
        ? user.GroupementType.charAt(0).toUpperCase() + user.GroupementType.slice(1).toLowerCase()
        : 'Unassigned';

      return {
        ...user,
        GroupementType: formattedGroupement,
      };
    });
  }, [users]);

  const loadUsersWithSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { site_type?: 'filiale' | 'succursale'; active_only?: boolean } = {};
      if (siteType !== 'all') {
        params.site_type = siteType;
      }
      if (showActiveOnly) {
        params.active_only = true;
      }

      const response = await authApi.getAllUsers(params);

      let usersData: UserWithSite[] = [];
      if (response && typeof response === 'object') {
        if ('data' in response && Array.isArray(response.data)) {
          usersData = response.data;
        } else if (Array.isArray(response)) {
          usersData = response;
        }
      }

      if (usersData.length) {
        const filialeIds = new Set<number>();
        const succursaleIds = new Set<number>();

        usersData.forEach((user) => {
          if (user.SiteId && user.GroupementType) {
            const type = user.GroupementType.toLowerCase();
            if (type === 'filiale') {
              filialeIds.add(user.SiteId);
            } else if (type === 'succursale') {
              succursaleIds.add(user.SiteId);
            }
          }
        });

        const [filialesResponse, succursalesResponse] = await Promise.all([
          filialeIds.size
            ? filialeApi
                .listFiliales({ page: 1, pageSize: 1000 })
                .catch((err) => {
                  console.warn('Failed to load filiales for user sites:', err);
                  return { data: [], pagination: { totalCount: 0 } };
                })
            : Promise.resolve({ data: [], pagination: { totalCount: 0 } }),
          succursaleIds.size
            ? succursaleApi
                .listSuccursales({ page: 1, pageSize: 1000 })
                .catch((err) => {
                  console.warn('Failed to load succursales for user sites:', err);
                  return { data: [], pagination: { totalCount: 0 } };
                })
            : Promise.resolve({ data: [], pagination: { totalCount: 0 } }),
        ]);

        const filialeNameById = new Map<number, string>();
        filialesResponse.data?.forEach((filiale) => {
          filialeNameById.set(filiale.id, filiale.name);
        });

        const succursaleNameById = new Map<number, string>();
        succursalesResponse.data?.forEach((succursale) => {
          succursaleNameById.set(succursale.id, succursale.name);
        });

        usersData = usersData.map((user) => {
          const type = user.GroupementType?.toLowerCase();
          const siteId = user.SiteId != null ? Number(user.SiteId) : null;

          let siteName = user.SiteName?.trim() ?? '';

          if (siteId) {
            if (type === 'filiale' && filialeNameById.has(siteId)) {
              siteName = filialeNameById.get(siteId) ?? siteName;
            } else if (type === 'succursale' && succursaleNameById.has(siteId)) {
              siteName = succursaleNameById.get(siteId) ?? siteName;
            }
          }

          return {
            ...user,
            SiteName: siteName && siteName.length > 0 ? siteName : 'Unassigned',
          };
        });
      }

      setUsers(usersData);
    } catch (err: any) {
      console.error('Failed to load users with sites:', err);
      setError(err.response?.data?.error || 'Failed to load users with sites');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [siteType, showActiveOnly]);

  useEffect(() => {
    loadUsersWithSites();
  }, [loadUsersWithSites]);

  const handleViewUser = (userId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/users/${userId}`);
  };

  const handleEditUserSite = (userSiteId: number | null, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!userSiteId || !hasUpdatePermission) return;
    navigate(`/user-sites/${userSiteId}/edit`);
  };

  const columns: GridColDef<UserWithSite>[] = [
    {
      field: 'Username',
      headerName: 'Username',
      flex: 0.4,
      minWidth: 150,
    },
    {
      field: 'FullName',
      headerName: 'Full Name',
      flex: 0.6,
      minWidth: 200,
    },
    {
      field: 'GroupementType',
      headerName: 'Groupement',
      width: 160,
      renderCell: (cellParams) => {
        const params = cellParams as GridRenderCellParams;
        return (
          <Chip
            label={params.value ?? 'Unassigned'}
            color={
              params.value === 'Filiale'
                ? 'primary'
                : params.value === 'Succursale'
                ? 'secondary'
                : 'default'
            }
            size="small"
          />
        );
      },
    },
    {
      field: 'SiteName',
      headerName: 'Site Name',
      flex: 0.8,
      minWidth: 220,
      valueGetter: (params) => {
        const typedParams = params as { value?: string | null };
        return typedParams.value || 'Not assigned';
      },
    },
    {
      field: 'UserSiteActive',
      headerName: 'User Site Status',
      width: 160,
      renderCell: (cellParams) => {
        const params = cellParams as GridRenderCellParams;
        return (
          <Chip
            label={
              params.row.UserSiteId
                ? params.value
                  ? 'Active'
                  : 'Inactive'
                : 'Not assigned'
            }
            color={
              params.row.UserSiteId
                ? params.value
                  ? 'success'
                  : 'default'
                : 'default'
            }
            size="small"
          />
        );
      },
    },
    {
      field: 'UserActive',
      headerName: 'User Status',
      width: 120,
      renderCell: (cellParams) => {
        const params = cellParams as GridRenderCellParams;
        return (
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            color={params.value ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (cellParams) => {
        const params = cellParams as GridRenderCellParams;
        return (
          <Box display="flex" gap={0.5} alignItems="center">
            <Tooltip title="View User">
              <IconButton
                size="small"
                onClick={(e) => handleViewUser(params.row.UserId, e)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                params.row.UserSiteId
                  ? hasUpdatePermission
                    ? 'Edit User Site'
                    : 'No permission'
                  : 'No site assigned'
              }
            >
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => handleEditUserSite(params.row.UserSiteId, e)}
                  disabled={!hasUpdatePermission || !params.row.UserSiteId}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Sites Management</Typography>
        {hasCreatePermission && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/user-sites/create')}
          >
            Create User Site
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="site-type-filter">Filter by Site Type</InputLabel>
          <Select
            labelId="site-type-filter"
            label="Filter by Site Type"
            value={siteType}
            onChange={(event) => setSiteType(event.target.value as 'all' | 'filiale' | 'succursale')}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="filiale">Filiale</MenuItem>
            <MenuItem value="succursale">Succursale</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Show only active users (and active sites)">
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={showActiveOnly}
                  onChange={(event) => setShowActiveOnly(event.target.checked)}
                />
              }
              label="Show Active Users Only"
            />
          </Box>
        </Tooltip>
      </Box>

      <DataTable
        rows={filteredUsers}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 50,
          totalRecords: filteredUsers.length,
          totalPages: 1,
        }}
        loading={loading}
        getRowId={(row) => row.UserId}
        onPaginationChange={() => {}}
      />
    </Box>
  );
};

