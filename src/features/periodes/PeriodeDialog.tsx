// src/features/periodes/PeriodeDialog.tsx

import React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import type { PeriodeFormState, DialogMode } from './periodeTypes';
import type { TypePeriode } from '../../api/endpoints/typeperiode.api';

interface PeriodeDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  formState: PeriodeFormState;
  typePeriodes: TypePeriode[];
  saving: boolean;
  isFormValid: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => void;
  onChangeField: <K extends keyof PeriodeFormState>(
    key: K,
    value: PeriodeFormState[K]
  ) => void;
  onClearError: () => void;
}

export const PeriodeDialog: React.FC<PeriodeDialogProps> = ({
  open,
  dialogMode,
  formState,
  typePeriodes,
  saving,
  isFormValid,
  error,
  onClose,
  onSave,
  onChangeField,
  onClearError,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha('#1e293b', 0.4)
              : alpha('#f8fafc', 0.8),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {dialogMode === 'create' ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
              }}
            >
              <AddIcon />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'warning.main',
                color: 'white',
              }}
            >
              <SaveIcon />
            </Box>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              {dialogMode === 'create' ? 'Nouvelle Période' : 'Modifier Période'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dialogMode === 'create' 
                ? 'Remplissez les informations pour créer une nouvelle période'
                : 'Modifiez les informations de la période'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={saving}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha('#ef4444', 0.1),
              color: 'error.main',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {error && (
          <Alert 
            severity="error" 
            onClose={onClearError} 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Period Information Section */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              Informations de la période
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Année"
                  type="number"
                  value={formState.year}
                  onChange={(e) => onChangeField('year', Number(e.target.value))}
                  fullWidth
                  required
                  disabled={saving}
                  inputProps={{ min: 2000, max: 2100 }}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Mois"
                  type="number"
                  value={formState.month}
                  onChange={(e) => onChangeField('month', Number(e.target.value))}
                  fullWidth
                  required
                  disabled={saving}
                  inputProps={{ min: 1, max: 12 }}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Semaine"
                  type="number"
                  value={formState.week}
                  onChange={(e) => onChangeField('week', Number(e.target.value))}
                  fullWidth
                  disabled={saving}
                  inputProps={{ min: 0, max: 53 }}
                  helperText="Optionnel"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Date Range Section */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              Plage de dates
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date début"
                  type="date"
                  value={formState.startedDate}
                  onChange={(e) => onChangeField('startedDate', e.target.value)}
                  fullWidth
                  required
                  disabled={saving}
                  InputLabelProps={{ shrink: true }}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date fin"
                  type="date"
                  value={formState.endDate}
                  onChange={(e) => onChangeField('endDate', e.target.value)}
                  fullWidth
                  required
                  disabled={saving}
                  InputLabelProps={{ shrink: true }}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Type Section */}
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2, 
                fontWeight: 700,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              Type de période
            </Typography>
            <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
              <InputLabel>Type de période</InputLabel>
              <Select
                value={formState.typePeriodeId || ''}
                label="Type de période"
                onChange={(e) => onChangeField('typePeriodeId', Number(e.target.value))}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                }}
              >
                {typePeriodes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: type.hebdomadaire ? 'success.main' : 'info.main',
                        }}
                      />
                      {type.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderColor: alpha('#64748b', 0.3),
            color: 'text.secondary',
            '&:hover': {
              borderColor: '#64748b',
              backgroundColor: alpha('#64748b', 0.08),
            },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : dialogMode === 'create' ? <AddIcon /> : <SaveIcon />}
          disabled={saving || !isFormValid}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
            },
          }}
        >
          {saving ? 'En cours...' : dialogMode === 'create' ? 'Créer la période' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
