// src/features/periodes/PeriodeFilters.tsx

import React from 'react';
import {
  Alert,
  Box,
  Button,
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
import type { TypePeriode } from '../../api/endpoints/typeperiode.api';

interface PeriodeFiltersProps {
  typePeriodes: TypePeriode[];
  selectedTypePeriode: number | null;
  totalRecords: number;
  hasCreate: boolean;
  error: string | null;
  onClearError: () => void;
  onChangeTypePeriode: (value: number | null) => void;
  onCreate: () => void;
}

export const PeriodeFilters: React.FC<PeriodeFiltersProps> = ({
  typePeriodes,
  selectedTypePeriode,
  totalRecords,
  hasCreate,
  error,
  onClearError,
  onChangeTypePeriode,
  onCreate,
}) => {
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
                Périodes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez vos périodes et maintenez leur statut à jour. Total: {totalRecords}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              alignItems="center"
            >
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Type de période</InputLabel>
                <Select
                  value={selectedTypePeriode ?? ''}
                  label="Type de période"
                  onChange={(e) =>
                    onChangeTypePeriode(e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <MenuItem value="">
                    <em>Tous les types</em>
                  </MenuItem>
                  {typePeriodes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  Nouvelle Période
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
