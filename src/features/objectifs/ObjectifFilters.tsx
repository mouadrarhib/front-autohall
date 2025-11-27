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
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha('#1e293b', 0.4)
              : alpha('#ffffff', 0.9),
          backdropFilter: 'blur(12px)',
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Objectifs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerez vos objectifs par periode et maintenez leur statut a jour.
            </Typography>
          </Box>

          <Box sx={{ width: '100%', maxWidth: { xs: 600, md: 1100 }, mx: 'auto' }}>
            <Stack spacing={2.5}>
              <FormControl fullWidth>
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

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={2}
              >
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  {selectedPeriode ? 'Periode selectionnee' : 'Toutes les periodes'}
                </Typography>
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
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Nouvel Objectif
                  </Button>
                )}
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>
      {error && (
        <Alert severity="error" onClose={onClearError}>
          {error}
        </Alert>
      )}
    </>
  );
};
