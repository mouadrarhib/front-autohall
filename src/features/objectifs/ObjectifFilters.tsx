// src/features/objectifs/ObjectifFilters.tsx

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
import type { Periode } from '../../api/endpoints/periode.api';

interface ObjectifFiltersProps {
  periodes: Periode[];
  selectedPeriode: number | null;
  hasCreate: boolean;
  error: string | null;
  onClearError: () => void;
  onChangePeriode: (value: number | null) => void;
  onCreate: () => void;
}

export const ObjectifFilters: React.FC<ObjectifFiltersProps> = ({
  periodes,
  selectedPeriode,
  hasCreate,
  error,
  onClearError,
  onChangePeriode,
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
                Objectifs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerez vos objectifs par periode et maintenez leur statut a jour.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center">
              <FormControl sx={{ minWidth: 250 }}>
                <InputLabel>Selectionner une periode</InputLabel>
                <Select
                  value={selectedPeriode ?? ''}
                  label="Selectionner une periode"
                  onChange={(e) => onChangePeriode(e.target.value ? Number(e.target.value) : null)}
                >
                  <MenuItem value="">
                    <em>Toutes les periodes</em>
                  </MenuItem>
                  {periodes.map((periode) => (
                    <MenuItem key={periode.id} value={periode.id}>
                      {periode.name && periode.name.trim().length > 0
                        ? periode.name
                        : `${periode.startedDate} - ${periode.endDate} (${periode.year})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {hasCreate && selectedPeriode && (
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
                  Nouvel Objectif
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
