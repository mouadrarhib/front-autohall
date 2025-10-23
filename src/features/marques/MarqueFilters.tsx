// src/features/marques/MarqueFilters.tsx
import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
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

interface MarqueFiltersProps {
  filiales: any[];
  filterFilialeId: number | 'all';
  searchQuery: string;
  filialesLoading: boolean;
  totalRecords: number;
  hasCreate: boolean;
  error: string | null;
  onClearError: () => void;
  onChangeFiliale: (value: number | 'all') => void;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export const MarqueFilters: React.FC<MarqueFiltersProps> = ({
  filiales,
  filterFilialeId,
  searchQuery,
  filialesLoading,
  totalRecords,
  hasCreate,
  error,
  onClearError,
  onChangeFiliale,
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
              Marques
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filtrez vos marques par filiale et maintenez leur statut a jour.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={6}>
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

            <Grid item xs={12} sm={6} md={6}>
              <FormControl fullWidth size="small">
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
          </Grid>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              label={`${totalRecords} marque${totalRecords !== 1 ? 's' : ''} trouvee${totalRecords !== 1 ? 's' : ''}`}
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
                Nouvelle marque
              </Button>
            )}
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
