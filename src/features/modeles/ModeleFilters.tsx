// src/features/modeles/ModeleFilters.tsx

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

import type { Marque } from '../../api/endpoints/marque.api';

interface ModeleFiltersProps {
  marques: Marque[];
  filterMarqueId: number | 'all';
  marquesLoading: boolean;
  totalRecords: number;
  hasCreate: boolean;
  error: string | null;
  onClearError: () => void;
  onChangeMarque: (value: number | 'all') => void;
  onCreate: () => void;
}

export const ModeleFilters: React.FC<ModeleFiltersProps> = ({
  marques,
  filterMarqueId,
  marquesLoading,
  totalRecords,
  hasCreate,
  error,
  onClearError,
  onChangeMarque,
  onCreate,
}) => {
  return (
    <>
      <Box textAlign="center">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Modeles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Filtrez vos modeles par marque et maintenez leur statut a jour.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
          border: '1px solid',
          borderColor: alpha('#1e293b', 0.05),
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Marque (optionnel)</InputLabel>
              <Select
                value={filterMarqueId === 'all' ? '' : filterMarqueId}
                label="Marque (optionnel)"
                onChange={(event) => {
                  const value = event.target.value;
                  onChangeMarque(value === '' ? 'all' : Number(value));
                }}
                disabled={marquesLoading}
              >
                <MenuItem value="">Toutes les marques</MenuItem>
                {marques.map((marque) => (
                  <MenuItem key={marque.id} value={marque.id}>
                    {marque.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="center"
              alignItems="center"
            >
              <Chip
                label={`${totalRecords} modele${totalRecords === 1 ? '' : 's'}`}
                color="primary"
                sx={{ fontWeight: 600, borderRadius: 2 }}
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
                  Nouveau modele
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={onClearError}>
            {error}
          </Alert>
        )}
      </Paper>
    </>
  );
};
