// src/features/sites/SiteDialog.tsx

import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import type { DialogMode, SiteFormState, SiteType } from './siteTypes';

interface SiteDialogProps {
  open: boolean;
  dialogMode: DialogMode;
  siteType: SiteType;
  formState: SiteFormState;
  saving: boolean;
  isFormValid: boolean;
  onClose: () => void;
  onSave: () => void;
  onChangeField: <K extends keyof SiteFormState>(key: K, value: SiteFormState[K]) => void;
}

export const SiteDialog: React.FC<SiteDialogProps> = ({
  open,
  dialogMode,
  siteType,
  formState,
  saving,
  isFormValid,
  onClose,
  onSave,
  onChangeField,
}) => {
  const title = dialogMode === 'edit'
    ? `Modifier ${siteType === 'filiale' ? 'la filiale' : 'la succursale'}`
    : `Nouvelle ${siteType === 'filiale' ? 'filiale' : 'succursale'}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>{title}</DialogTitle>
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
