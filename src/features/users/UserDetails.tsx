// src/features/users/UserDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Divider,
  Alert,
  Skeleton,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import { authApi } from '../../api/endpoints/auth.api';

export const UserDetails: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
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
        console.error("Echec du chargement de l utilisateur:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            'Impossible de charger les details utilisateur.'
        );
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

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/users')} sx={{ mt: 2 }}>
          Retour a la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        maxWidth: 1200,
        mx: 'auto',
        width: '100%',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
          <IconButton onClick={() => navigate('/users')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            Details utilisateur
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/users/${userId}/edit`)}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Modifier
          </Button>
          <Button
            variant="contained"
            startIcon={<SecurityIcon />}
            onClick={() => navigate(`/users/${userId}/roles-permissions`)}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Gerer les autorisations
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informations de base
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Nom d'utilisateur
              </Typography>
              <Typography variant="body1">
                {user?.Username || user?.username}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Nom complet
              </Typography>
              <Typography variant="body1">
                {user?.FullName || user?.full_name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user?.Email || user?.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Site
              </Typography>
              <Typography variant="body1">
                {user?.SiteName || 'Site inconnu'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Statut
              </Typography>
              <Box>
                <Chip
                  label={user?.UserActive || user?.actif ? 'Actif' : 'Inactif'}
                  color={user?.UserActive || user?.actif ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Date de creation
              </Typography>
              <Typography variant="body1">
                {user?.UserCreatedAt
                  ? new Date(user.UserCreatedAt).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Roles et autorisations
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Roles actifs
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`${user?.ActiveRolesCount || 0} roles`}
                  color="primary"
                  size="small"
                />
              </Box>
              {user?.UserRoles && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {user.UserRoles}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Autorisations actives
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`${user?.ActivePermissionsCount || 0} autorisations`}
                  color="success"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
