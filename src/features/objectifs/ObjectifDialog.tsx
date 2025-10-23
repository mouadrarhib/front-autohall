// src/features/objectifs/ObjectifDialog.tsx

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
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import type { ObjectifFormState } from './objectifTypes';
import type { Periode } from '../../api/endpoints/periode.api';
import type { TypeVente } from '../../api/endpoints/typevente.api';
import type { TypeObjectif } from '../../api/endpoints/typeobjectif.api';
import type { Marque } from '../../api/endpoints/marque.api';
import type { Modele } from '../../api/endpoints/modele.api';
import type { Version } from '../../api/endpoints/version.api';
import type { Groupement } from '../../types/usersite.types';
import type { Filiale } from '../../api/endpoints/filiale.api';
import type { Succursale } from '../../api/endpoints/succursale.api';

interface ObjectifDialogProps {
  open: boolean;
  isEdit: boolean;
  formState: ObjectifFormState;
  saving: boolean;
  error: string | null;
  periodes: Periode[];
  typeVentes: TypeVente[];
  typeObjectifs: TypeObjectif[];
  marques: Marque[];
  modeles: Modele[];
  versions: Version[];
  groupements: Groupement[];
  sites: Array<Filiale | Succursale>;
  onClose: () => void;
  onSave: () => void;
  onChangeField: <K extends keyof ObjectifFormState>(key: K, value: ObjectifFormState[K]) => void;
  onClearError: () => void;
}

export const ObjectifDialog: React.FC<ObjectifDialogProps> = ({
  open,
  isEdit,
  formState,
  saving,
  error,
  periodes,
  typeVentes,
  typeObjectifs,
  marques,
  modeles,
  versions,
  groupements,
  sites,
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
      maxWidth="lg" 
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
          {!isEdit ? (
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
              {isEdit ? 'Modifier Objectif' : 'Nouveau Objectif'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEdit 
                ? "Modifiez les informations de l'objectif"
                : 'Remplissez les informations pour créer un nouveau objectif'}
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
            }}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Site & Period Information */}
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
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TrackChangesIcon sx={{ fontSize: '1rem' }} />
              Localisation et période
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Groupement</InputLabel>
                  <Select
                    value={formState.groupementId || ''}
                    label="Groupement"
                    onChange={(e) => onChangeField('groupementId', Number(e.target.value))}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {groupements.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Site</InputLabel>
                  <Select
                    value={formState.siteId || ''}
                    label="Site"
                    onChange={(e) => onChangeField('siteId', Number(e.target.value))}
                    disabled={saving || !formState.groupementId}
                    sx={{ borderRadius: 2 }}
                  >
                    {sites.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Période</InputLabel>
                  <Select
                    value={formState.periodeId || ''}
                    label="Période"
                    onChange={(e) => onChangeField('periodeId', Number(e.target.value))}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {periodes.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {`${p.startedDate} - ${p.endDate}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Type Information */}
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
              Type d'objectif
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Type Vente</InputLabel>
                  <Select
                    value={formState.typeVenteId || ''}
                    label="Type Vente"
                    onChange={(e) => onChangeField('typeVenteId', Number(e.target.value))}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {typeVentes.map((tv) => (
                      <MenuItem key={tv.id} value={tv.id}>
                        {tv.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Type Objectif</InputLabel>
                  <Select
                    value={formState.typeObjectifId || ''}
                    label="Type Objectif"
                    onChange={(e) => onChangeField('typeObjectifId', Number(e.target.value))}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {typeObjectifs.map((to) => (
                      <MenuItem key={to.id} value={to.id}>
                        {to.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Vehicle Selection */}
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
              Véhicule (optionnel)
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Marque (Optionnel)</InputLabel>
                  <Select
                    value={formState.marqueId || ''}
                    label="Marque (Optionnel)"
                    onChange={(e) => onChangeField('marqueId', Number(e.target.value))}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>Aucune</em>
                    </MenuItem>
                    {marques.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Modèle (Optionnel)</InputLabel>
                  <Select
                    value={formState.modeleId || ''}
                    label="Modèle (Optionnel)"
                    onChange={(e) => onChangeField('modeleId', Number(e.target.value))}
                    disabled={saving || !formState.marqueId}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>Aucun</em>
                    </MenuItem>
                    {modeles.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Version (Optionnel)</InputLabel>
                  <Select
                    value={formState.versionId || ''}
                    label="Version (Optionnel)"
                    onChange={(e) => onChangeField('versionId', Number(e.target.value))}
                    disabled={saving || !formState.modeleId}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">
                      <em>Aucune</em>
                    </MenuItem>
                    {versions.map((v) => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Metrics */}
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
              Métriques
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Volume"
                  type="number"
                  value={formState.volume}
                  onChange={(e) => onChangeField('volume', e.target.value)}
                  fullWidth
                  required
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prix de vente"
                  type="number"
                  value={formState.salePrice}
                  onChange={(e) => onChangeField('salePrice', e.target.value)}
                  fullWidth
                  required
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="TM Direct (%)"
                  type="number"
                  value={formState.tmDirect}
                  onChange={(e) => onChangeField('tmDirect', e.target.value)}
                  fullWidth
                  required
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Marge Inter Groupe (%)"
                  type="number"
                  value={formState.margeInterGroupe}
                  onChange={(e) => onChangeField('margeInterGroupe', e.target.value)}
                  fullWidth
                  required
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
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
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : !isEdit ? <AddIcon /> : <SaveIcon />}
          disabled={saving}
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
          {saving ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
