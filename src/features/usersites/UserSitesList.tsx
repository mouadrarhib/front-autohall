// src/features/usersites/UserSitesList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Alert,
  Tooltip,
  CircularProgress,
  Switch,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import { DataTable } from '../../components/common/DataTable';
import { usersiteApi } from '../../api/endpoints/usersite.api';
import { useAuthStore } from '../../store/authStore';

interface UserSite {
  id: number;
  idGroupement: number;
  groupement_name: string;
  idSite: number;
  site_name: string;
  site_type: string;
  active: boolean;
}

export const UserSitesList: React.FC = () => {
  const navigate = useNavigate();
  const hasCreatePermission = useAuthStore((state) =>
    state.hasPermission('USERSITE_CREATE')
  );
  const hasUpdatePermission = useAuthStore((state) =>
    state.hasPermission('USERSITE_UPDATE')
  );

  const [usersites, setUsersites] = useState<UserSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadUserSites = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading all user sites...');
      const data = await usersiteApi.listUserSites();
      console.log('Loaded user sites:', data);
      setUsersites(data || []);
    } catch (err: any) {
      console.error('Failed to load user sites:', err);
      setError(err.response?.data?.error || 'Failed to load user sites');
      setUsersites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserSites();
  }, []);

  const handleToggleActive = async (usersite: UserSite, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!hasUpdatePermission || togglingId === usersite.id) return;

    try {
      setTogglingId(usersite.id);

      if (usersite.active) {
        await usersiteApi.deactivateUserSite(usersite.id);
      } else {
        await usersiteApi.activateUserSite(usersite.id);
      }

      setUsersites((prev) =>
        prev.map((u) =>
          u.id === usersite.id ? { ...u, active: !u.active } : u
        )
      );
    } catch (err: any) {
      console.error('Failed to toggle usersite:', err);
      setError(err.response?.data?.error || 'Failed to update user site');
      await loadUserSites();
    } finally {
      setTogglingId(null);
    }
  };

  const handleEditClick = (usersiteId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/user-sites/${usersiteId}/edit`);
  };

  const handleViewUsersClick = (usersiteId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/user-sites/${usersiteId}/users`);
  };

  const columns: GridColDef[] = [
    {
      field: 'groupement_name',
      headerName: 'Groupement',
      flex: 0.5,
      minWidth: 150,
    },
    {
      field: 'site_type',
      headerName: 'Site Type',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Unknown'}
          color={params.value === 'Filiale' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'site_name',
      headerName: 'Site Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      sortable: false,
      renderCell: (params) => {
        const isToggling = togglingId === params.row.id;

        return (
          <Box display="flex" gap={0.5} alignItems="center">
            {hasUpdatePermission && (
              <>
                <Tooltip title="Edit User Site">
                  <IconButton
                    size="small"
                    onClick={(e) => handleEditClick(params.row.id, e)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={params.row.active ? 'Deactivate' : 'Activate'}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <Switch
                      size="small"
                      checked={params.row.active}
                      onChange={(e) => handleToggleActive(params.row, e as any)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={isToggling}
                    />
                    {isToggling && (
                      <CircularProgress
                        size={20}
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-10px',
                          marginLeft: '-10px',
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              </>
            )}
            <Tooltip title="View Users">
              <Button
                size="small"
                variant="outlined"
                startIcon={<PeopleIcon fontSize="small" />}
                onClick={(e) => handleViewUsersClick(params.row.id, e)}
                sx={{ ml: 1 }}
              >
                Users
              </Button>
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

      <DataTable
        rows={usersites}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 50,
          totalRecords: usersites.length,
          totalPages: 1,
        }}
        loading={loading}
        onPaginationChange={() => {}}
      />
    </Box>
  );
};
