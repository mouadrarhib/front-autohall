// src/features/versions/VersionDialog.tsx

import React from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import type { Marque } from '../../api/endpoints/marque.api';
import type { Modele } from '../../api/endpoints/modele.api';
import type { DialogMode, VersionFormState } from './versionTypes';

interface VersionDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  formState: VersionFormState;
  marques: Marque[];
  modeles: Modele[];
  saving: boolean;
  isFormValid: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeField: <K extends keyof VersionFormState>(key: K, value: VersionFormState[K]) => void;
  onSelectMarque: (value: number | null) => void;
}

export const VersionDialog: React.FC<VersionDialogProps> = ({
  open,
  dialogMode,
  formState,
  marques,
  modeles,
  saving,
  isFormValid,
  onClose,
  onSave,
  onChangeField,
  onSelectMarque,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        {dialogMode === 'edit' ? 'Modifier la version' : 'Nouvelle version'}
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            label="Nom"
            name="name"
            value={formState.name}
            onChange={(event) => onChangeField('name', event.target.value)}
            fullWidth
            required
            autoFocus
          />

          <FormControl fullWidth required>
            <InputLabel>Marque</InputLabel>
            <Select
              label="Marque"
              value={formState.idMarque ?? ''}
              onChange={(event) => {
                const value = event.target.value === '' ? null : Number(event.target.value);
                onSelectMarque(value);
              }}
            >
              <MenuItem value="">
                <em>Selectionner une marque</em>
              </MenuItem>
              {marques.map((marque) => (
                <MenuItem key={marque.id} value={marque.id}>
                  {marque.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required disabled={!formState.idMarque}>
            <InputLabel>Modele</InputLabel>
            <Select
              label="Modele"
              value={formState.idModele ?? ''}
              onChange={(event) =>
                onChangeField('idModele', event.target.value === '' ? null : Number(event.target.value))
              }
            >
              <MenuItem value="">
                <em>Selectionner un modele</em>
              </MenuItem>
              {modeles.map((modele) => (
                <MenuItem key={modele.id} value={modele.id}>
                  {modele.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Volume"
            type="number"
            name="volume"
            value={formState.volume}
            onChange={(event) => onChangeField('volume', Number(event.target.value))}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Prix"
            type="number"
            name="price"
            value={formState.price}
            onChange={(event) => onChangeField('price', Number(event.target.value))}
            fullWidth
            required
            inputProps={{ min: 0, step: 100 }}
          />

          <TextField
            label="TM (%)"
            type="number"
            name="tmPercent"
            value={formState.tmPercent}
            onChange={(event) => onChangeField('tmPercent', Number(event.target.value))}
            fullWidth
            required
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />

          <TextField
            label="Marge (%)"
            type="number"
            name="marginPercent"
            value={formState.marginPercent}
            onChange={(event) => onChangeField('marginPercent', Number(event.target.value))}
            fullWidth
            required
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formState.active}
                onChange={(event) => onChangeField('active', event.target.checked)}
              />
            }
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : undefined}
          disabled={saving || !isFormValid}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {dialogMode === 'edit' ? 'Mettre a jour' : 'Creer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
