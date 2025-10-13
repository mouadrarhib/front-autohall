// src/features/usersites/UserSiteUsers.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Alert,
  Skeleton,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataTable } from '../../components/common/DataTable';
import { usersiteApi } from '../../api/endpoints/usersite.api';
import { groupementApi } from '../../api/endpoints/groupement.api';

// Updated interface to match backend response (snake_case)
interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  actif: boolean;
  idUserSite: number;
  createdAt: string;
  updatedAt: string | null;
}

interface UserSite {
  id: number;
  idGroupement: number;
  groupement_name: string;
  idSite: number;
  site_name: string;
  site_type: string;
  active: boolean;
}

export const UserSiteUsers: React.FC = () => {
  const { usersiteId } = useParams<{ usersiteId: string }>();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [usersite, setUsersite] = useState<UserSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!usersiteId) return;

      try {
        setLoading(true);
        
        console.log('Loading usersite and users for ID:', usersiteId);
        
        // Load usersite details
        const usersiteData = await usersiteApi.getUserSiteById(Number(usersiteId));
        console.log('UserSite data:', usersiteData);
        setUsersite(usersiteData);
        
        // Load users by groupement
        const usersResponse = await groupementApi.listUsersByGroupement(
          usersiteData.idGroupement,
          { page: 1, pageSize: 100 }
        );
        
        console.log('Users response:', usersResponse);
        
        // Handle nested data structure
        let usersData: User[] = [];
        if (usersResponse && typeof usersResponse === 'object') {
          if ('data' in usersResponse && Array.isArray(usersResponse.data)) {
            usersData = usersResponse.data;
          } else if (Array.isArray(usersResponse)) {
            usersData = usersResponse;
          }
        }
        
        console.log('Processed users:', usersData);
        setUsers(usersData);
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.response?.data?.error || 'Failed to load users for this site');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [usersiteId]);

  const handleViewUser = (userId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/users/${userId}`);
  };

  // FIXED: Column field names now match backend response (snake_case)
  const columns: GridColDef[] = [
    {
      field: 'username',  // Changed from Username
      headerName: 'Username',
      flex: 0.5,
      minWidth: 150,
    },
    {
      field: 'full_name',  // Changed from FullName
      headerName: 'Full Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'email',  // Changed from Email
      headerName: 'Email',
      flex: 1,
      minWidth: 220,
    },
    {
      field: 'actif',  // Changed from UserActive
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
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleViewUser(params.row.id, e)}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/user-sites')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Users in {usersite?.site_name}
        </Typography>
      </Box>

      {usersite && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Site Name
                </Typography>
                <Typography variant="body1">{usersite.site_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Site Type
                </Typography>
                <Typography variant="body1">
                  <Chip 
                    label={usersite.site_type} 
                    color={usersite.site_type === 'Filiale' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Total Users
                </Typography>
                <Typography variant="body1">
                  <Chip label={users.length} color="info" size="small" />
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {users.length === 0 && !loading && !error && (
        <Alert severity="info">
          No users found for this site.
        </Alert>
      )}

      <DataTable
        rows={users}
        columns={columns}
        pagination={{
          page: 1,
          pageSize: 50,
          totalRecords: users.length,
          totalPages: 1,
        }}
        loading={loading}
        onPaginationChange={() => {}}
      />
    </Box>
  );
};
