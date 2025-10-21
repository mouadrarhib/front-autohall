// src/features/sites/SiteFilters.tsx

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import type { SiteType } from './siteTypes';

interface SiteFiltersProps {
  siteType: SiteType;
  totalRecords: number;
  hasCreate: boolean;
  error: string | null;
  onClearError: () => void;
  onCreate: () => void;
}

export const SiteFilters: React.FC<SiteFiltersProps> = ({
  siteType,
  totalRecords,
  hasCreate,
  error,
  onClearError,
  onCreate,
}) => {
  const title = siteType === 'filiale' ? 'Filiales' : 'Succursales';
  const description = siteType === 'filiale' 
    ? 'Gerez vos filiales et maintenez leur statut a jour.'
    : 'Gerez vos succursales et maintenez leur statut a jour.';
  const buttonLabel = siteType === 'filiale' ? 'Nouvelle filiale' : 'Nouvelle succursale';

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha('#1e293b', 0.4)
              : alpha('#ffffff', 0.9),
          backdropFilter: 'blur(12px)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center">
              <Chip
                label={`${totalRecords} ${siteType === 'filiale' ? 'filiale(s)' : 'succursale(s)'}`}
                color="primary"
                variant="outlined"
              />
              {hasCreate && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onCreate}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: '0 12px 28px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {buttonLabel}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      {error && (
        <Alert severity="error" onClose={onClearError}>
          {error}
        </Alert>
      )}
    </>
  );
};
