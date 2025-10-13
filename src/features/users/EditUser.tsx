// src/features/users/EditUser.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { authApi } from '../../api/endpoints/auth.api';

export const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const userData = await authApi.getUserCompleteInfo(Number(userId));
        setUser(userData);
      } catch (err: any) {
        console.error('Failed to load user:', err);
        setError(err.response?.data?.error || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
        >
          Back
        </Button>
        <Typography variant="h4">Edit User</Typography>
      </Box>

      <Card sx={{ maxWidth: 800 }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info">
            Edit user form coming soon. User: {user?.Username || user?.username}
          </Alert>

          {/* TODO: Add edit user form here */}
        </CardContent>
      </Card>
    </Box>
  );
};
