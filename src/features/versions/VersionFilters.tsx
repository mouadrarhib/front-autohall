// src/features/versions/VersionFilters.tsx
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
import type { Modele } from '../../api/endpoints/modele.api';

interface VersionFiltersProps {
  marques: Marque[];
  modeles: Modele[];
  filterMarqueId: number | 'all';
  filterModeleId: number | 'all';
  searchQuery: string;
  marquesLoading: boolean;
  modelesLoading: boolean;
  totalRecords: number;
  hasCreate: boolean;
  filtersError: string | null;
  onClearFiltersError: () => void;
  onChangeMarque: (value: number | 'all') => void;
  onChangeModele: (value: number | 'all') => void;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export const VersionFilters: React.FC<VersionFiltersProps> = ({
  marques,
  modeles,
  filterMarqueId,
  filterModeleId,
  searchQuery,
  marquesLoading,
  modelesLoading,
  totalRecords,
  hasCreate,
  filtersError,
  onClearFiltersError,
  onChangeMarque,
  onChangeModele,
  onSearchChange,
  onCreate,
}) => {
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
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
              Versions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filtrez vos versions par marque et modele, puis ajustez leurs caracteristiques.
            </Typography>
          </Box>

          <Box sx={{ width: '100%', maxWidth: { xs: 600, md: 1100 }, mx: 'auto' }}>
            <Grid
              container
              spacing={2.5}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={12} md={5}>
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

              <Grid item xs={12} sm={6} md={3.5}>
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

              <Grid item xs={12} sm={6} md={3.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Modele</InputLabel>
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
            </Grid>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2}
            sx={{ width: '100%', maxWidth: { xs: 600, md: 1100 }, mx: 'auto' }}
          >
            <Chip
              label={`${totalRecords} version${totalRecords !== 1 ? 's' : ''} trouvee${totalRecords !== 1 ? 's' : ''}`}
              color="primary"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, width: { xs: '100%', sm: 'auto' }, textAlign: 'center' }}
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
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Nouvelle version
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>

      {filtersError && (
        <Alert severity="error" onClose={onClearFiltersError}>
          {filtersError}
        </Alert>
      )}
    </>
  );
};
