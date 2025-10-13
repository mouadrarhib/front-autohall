// src/features/permissions/PermissionsList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { DataTable } from '../../components/common/DataTable';
import { permissionsApi } from '../../api/endpoints/permissions.api';
import { useAuthStore } from '../../store/authStore';
import type { Permission } from '../../types/permission.types';

export const PermissionsList: React.FC = () => {
  const navigate = useNavigate();
  const hasCreatePermission = useAuthStore((state) =>
    state.hasPermission('PERMISSION_CREATE')
  );
  const hasUpdatePermission = useAuthStore((state) =>
    state.hasPermission('PERMISSION_UPDATE')
  );

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalRecords: 0,
    totalPages: 0,
  });

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await permissionsApi.listPermissions({
        active: activeFilter,
        search: searchTerm || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      let permissionsData: Permission[] = [];
      let paginationData = {
        totalCount: 0,
        totalPages: 0,
      };

      if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          permissionsData = response.data;
          paginationData = response.pagination || paginationData;
        } else if (Array.isArray(response)) {
          permissionsData = response;
        }
      }

      const validPermissions = permissionsData.filter(p => p && typeof p === 'object' && p.id);

      setPermissions(validPermissions);
      setPagination((prev) => ({
        ...prev,
        totalRecords: paginationData.totalCount || validPermissions.length,
        totalPages: paginationData.totalPages || 1,
      }));
    } catch (err: any) {
      console.error('Failed to load permissions:', err);
      setError(err.response?.data?.error || 'Failed to load permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [pagination.page, pagination.pageSize, activeFilter]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadPermissions();
  };

  const handleToggleActive = async (permission: Permission) => {
    if (!hasUpdatePermission) return;

    try {
      await permissionsApi.setPermissionActive(permission.id, !permission.active);
      loadPermissions();
    } catch (err: any) {
      console.error('Failed to toggle permission:', err);
      setError(err.response?.data?.error || 'Failed to update permission');
    }
  };

  const columns: GridColDef[] = [
    // ID column removed for security
    { 
      field: 'name', 
      headerName: 'Permission Name', 
      flex: 1, 
      minWidth: 250 
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
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5} alignItems="center">
          {hasUpdatePermission && (
            <>
              <Tooltip title="Edit Permission">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/permissions/${params.row.id}/edit`)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={params.row.active ? 'Deactivate' : 'Activate'}>
                <Switch
                  size="small"
                  checked={params.row.active}
                  onChange={() => handleToggleActive(params.row)}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="View Users">
            <Button
              size="small"
              variant="outlined"
              startIcon={<PeopleIcon fontSize="small" />}
              onClick={() => navigate(`/permissions/${params.row.id}/users`)}
              sx={{ ml: 1 }}
            >
              Users
            </Button>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Permissions Management</Typography>
        {hasCreatePermission && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/permissions/create')}
          >
            Create Permission
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ minWidth: 300 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={activeFilter !== false}
              onChange={(e) => setActiveFilter(e.target.checked ? true : undefined)}
            />
          }
          label="Show Active Only"
        />
      </Box>

      <DataTable
        rows={permissions}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onPaginationChange={(model) =>
          setPagination((prev) => ({
            ...prev,
            page: model.page,
            pageSize: model.pageSize,
          }))
        }
      />
    </Box>
  );
};
