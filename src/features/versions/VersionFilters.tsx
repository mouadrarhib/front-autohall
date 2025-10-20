// src/features/versions/VersionFilters.tsx

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
import type { Modele } from '../../api/endpoints/modele.api';

interface VersionFiltersProps {
  marques: Marque[];
  modeles: Modele[];
  filterMarqueId: number | 'all';
  filterModeleId: number | 'all';
  marquesLoading: boolean;
  modelesLoading: boolean;
  totalRecords: number;
  hasCreate: boolean;
  filtersError: string | null;
  onClearFiltersError: () => void;
  onChangeMarque: (value: number | 'all') => void;
  onChangeModele: (value: number | 'all') => void;
  onCreate: () => void;
}

export const VersionFilters: React.FC<VersionFiltersProps> = ({
  marques,
  modeles,
  filterMarqueId,
  filterModeleId,
  marquesLoading,
  modelesLoading,
  totalRecords,
  hasCreate,
  filtersError,
  onClearFiltersError,
  onChangeMarque,
  onChangeModele,
  onCreate,
}) => {
  return (
    <>
      <Box textAlign="center">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Versions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Filtrez vos versions par marque et modele, puis ajustez leurs caracteristiques.
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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Modele (optionnel)</InputLabel>
              <Select
                value={filterModeleId === 'all' ? '' : filterModeleId}
                label="Modele (optionnel)"
                onChange={(event) => {
                  const value = event.target.value;
                  onChangeModele(value === '' ? 'all' : Number(value));
                }}
                disabled={modelesLoading && filterMarqueId !== 'all'}
              >
                <MenuItem value="">Tous les modeles</MenuItem>
                {modeles.map((modele) => (
                  <MenuItem key={modele.id} value={modele.id}>
                    {modele.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="center"
              alignItems="center"
            >
              <Chip
                label={`${totalRecords} version${totalRecords === 1 ? '' : 's'}`}
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
                  Nouvelle version
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        {filtersError && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={onClearFiltersError}>
            {filtersError}
          </Alert>
        )}
      </Paper>
    </>
  );
};
