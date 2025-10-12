// src/features/users/UserList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataTable } from '../../components/common/DataTable';
import { authApi } from '../../api/endpoints/auth.api';
import { useAuthStore } from '../../store/authStore';

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const hasCreatePermission = useAuthStore((state) => 
    state.hasPermission('USER_CREATE')
  );

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authApi.getAllUsers({ active_only: true });
      setUsers(response.data || []);
      setPagination({
        ...pagination,
        totalRecords: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / pagination.pageSize),
      });
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.pageSize]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'full_name', headerName: 'Full Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'actif',
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
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/users/${params.row.id}`)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => navigate(`/users/${params.row.id}/edit`)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users</Typography>
        {hasCreatePermission && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/users/create')}
          >
            Create User
          </Button>
        )}
      </Box>

      <DataTable
        rows={users}
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
