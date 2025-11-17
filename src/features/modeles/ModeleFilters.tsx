// src/features/modeles/ModeleFilters.tsx
import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Avatar,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import type { Marque } from '../../api/endpoints/marque.api';

interface ModeleFiltersProps {
  marques: Marque[];
  filterMarqueId: number | 'all';
  searchQuery: string;
  marquesLoading: boolean;
  totalRecords: number;
  hasCreate: boolean;
  error: string | null;
  onClearError: () => void;
  onChangeMarque: (value: number | 'all') => void;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export const ModeleFilters: React.FC<ModeleFiltersProps> = ({
  marques,
  filterMarqueId,
  searchQuery,
  marquesLoading,
  totalRecords,
  hasCreate,
  error,
  onClearError,
  onChangeMarque,
  onSearchChange,
  onCreate,
}) => {
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.15)}, ${alpha(
                  theme.palette.background.paper,
                  0.9
                )})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)}, ${alpha(
                  '#ffffff',
                  0.95
                )})`,
          borderRadius: 3,
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.primary.main, 0.1)
            }`,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Modeles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filtrez vos modeles par marque et maintenez leur statut a jour.
            </Typography>
          </Box>

          <Grid container spacing={2} columns={{ xs: 12, md: 18 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => onSearchChange('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Marque</InputLabel>
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
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          src={marque.imageUrl || undefined}
                          alt={marque.name}
                          sx={{ width: 28, height: 28, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
                        >
                          {marque.name?.[0] || 'M'}
                        </Avatar>
                        <Typography variant="body2">{marque.name}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ height: '100%' }}
              >
                <Chip
                  label={`${totalRecords} modele${totalRecords !== 1 ? 's' : ''} trouve${totalRecords !== 1 ? 's' : ''}`}
                  color="primary"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
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
