// src/features/marques/MarqueFilters.tsx

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

import type { Filiale } from '../../api/endpoints/filiale.api';

interface MarqueFiltersProps {
  filiales: Filiale[];
  filterFilialeId: number | 'all';
  filialesLoading: boolean;
  totalRecords: number;
  hasCreate: boolean;
  error: string | null;
  onClearError: () => void;
  onChangeFiliale: (value: number | 'all') => void;
  onCreate: () => void;
}

export const MarqueFilters: React.FC<MarqueFiltersProps> = ({
  filiales,
  filterFilialeId,
  filialesLoading,
  totalRecords,
  hasCreate,
  error,
  onClearError,
  onChangeFiliale,
  onCreate,
}) => {
  return (
    <>
      <Box textAlign="center">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Marques
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Filtrez vos marques par filiale et maintenez leur statut a jour.
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
              <InputLabel>Filiale (optionnel)</InputLabel>
              <Select
                value={filterFilialeId === 'all' ? '' : filterFilialeId}
                label="Filiale (optionnel)"
                onChange={(event) => {
                  const value = event.target.value;
                  onChangeFiliale(value === '' ? 'all' : Number(value));
                }}
                disabled={filialesLoading}
              >
                <MenuItem value="">Toutes les filiales</MenuItem>
                {filiales.map((filiale) => (
                  <MenuItem key={filiale.id} value={filiale.id}>
                    {filiale.name}
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
                label={`${totalRecords} marque${totalRecords === 1 ? '' : 's'}`}
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
                  Nouvelle marque
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
