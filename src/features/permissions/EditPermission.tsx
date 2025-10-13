// src/features/permissions/EditPermission.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { FormInput } from '../../components/common/FormInput';
import { permissionsApi } from '../../api/endpoints/permissions.api';

interface EditPermissionFormData {
  name: string;
  active: boolean;
}

export const EditPermission: React.FC = () => {
  const { permissionId } = useParams<{ permissionId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPermission, setLoadingPermission] = useState(true);

  const methods = useForm<EditPermissionFormData>({
    defaultValues: {
      name: '',
      active: true,
    },
  });

  useEffect(() => {
    const loadPermission = async () => {
      if (!permissionId) return;

      try {
        setLoadingPermission(true);
        const permission = await permissionsApi.getPermissionById(Number(permissionId));
        
        methods.reset({
          name: permission.name,
          active: permission.active,
        });
      } catch (err: any) {
        console.error('Failed to load permission:', err);
        setError(err.response?.data?.error || 'Failed to load permission');
      } finally {
        setLoadingPermission(false);
      }
    };

    loadPermission();
  }, [permissionId, methods]);

  const onSubmit = async (data: EditPermissionFormData) => {
    if (!permissionId) return;

    try {
      setError(null);
      setIsLoading(true);
      await permissionsApi.updatePermission(Number(permissionId), data);
      navigate('/permissions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update permission');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingPermission) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Card sx={{ maxWidth: 600 }}>
          <CardContent>
            <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={56} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/permissions')}
          disabled={isLoading}
        >
          Back
        </Button>
        <Typography variant="h4">Edit Permission</Typography>
      </Box>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <FormInput
                name="name"
                label="Permission Name"
                rules={{
                  required: 'Permission name is required',
                  pattern: {
                    value: /^[A-Z_]+$/,
                    message: 'Use only uppercase letters and underscores',
                  },
                }}
                helperText="Example: VEHICLE_READ, USER_CREATE"
                disabled={isLoading}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    {...methods.register('active')}
                    disabled={isLoading}
                  />
                }
                label="Active"
              />

              <Box display="flex" gap={2} mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  fullWidth
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                >
                  {isLoading ? 'Updating...' : 'Update Permission'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/permissions')}
                  fullWidth
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
};
