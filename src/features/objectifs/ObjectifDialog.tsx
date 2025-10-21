// src/features/objectifs/ObjectifDialog.tsx

import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>{isEdit ? 'Modifier Objectif' : 'Nouveau Objectif'}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Groupement</InputLabel>
                <Select
                  value={formState.groupementId || ''}
                  label="Groupement"
                  onChange={(e) =>
                    onChangeField('groupementId', Number(e.target.value))
                  }
                  disabled={saving}
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
              <FormControl fullWidth required>
                <InputLabel>Site</InputLabel>
                <Select
                  value={formState.siteId || ''}
                  label="Site"
                  onChange={(e) => onChangeField('siteId', Number(e.target.value))}
                  disabled={saving || !formState.groupementId}
                >
                  {sites.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Période</InputLabel>
                <Select
                  value={formState.periodeId || ''}
                  label="Période"
                  onChange={(e) => onChangeField('periodeId', Number(e.target.value))}
                  disabled={saving}
                >
                  {periodes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {`${p.startedDate} - ${p.endDate}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type Vente</InputLabel>
                <Select
                  value={formState.typeVenteId || ''}
                  label="Type Vente"
                  onChange={(e) => onChangeField('typeVenteId', Number(e.target.value))}
                  disabled={saving}
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
              <FormControl fullWidth required>
                <InputLabel>Type Objectif</InputLabel>
                <Select
                  value={formState.typeObjectifId || ''}
                  label="Type Objectif"
                  onChange={(e) => onChangeField('typeObjectifId', Number(e.target.value))}
                  disabled={saving}
                >
                  {typeObjectifs.map((to) => (
                    <MenuItem key={to.id} value={to.id}>
                      {to.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Marque (Optionnel)</InputLabel>
                <Select
                  value={formState.marqueId || ''}
                  label="Marque (Optionnel)"
                  onChange={(e) =>
                    onChangeField('marqueId', Number(e.target.value))
                  }
                  disabled={saving}
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Modèle (Optionnel)</InputLabel>
                <Select
                  value={formState.modeleId || ''}
                  label="Modèle (Optionnel)"
                  onChange={(e) => onChangeField('modeleId', Number(e.target.value))}
                  disabled={saving || !formState.marqueId}
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Version (Optionnel)</InputLabel>
                <Select
                  value={formState.versionId || ''}
                  label="Version (Optionnel)"
                  onChange={(e) => onChangeField('versionId', Number(e.target.value))}
                  disabled={saving || !formState.modeleId}
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

            <Grid item xs={12} sm={6}>
              <TextField
                label="Volume"
                type="number"
                value={formState.volume}
                onChange={(e) => onChangeField('volume', e.target.value)}
                fullWidth
                required
                disabled={saving}
                inputProps={{ min: 0, step: 1 }}
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
                inputProps={{ min: 0, step: 0.01 }}
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
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Marge Inter-Groupe (%)"
                type="number"
                value={formState.margeInterGroupe}
                onChange={(e) => onChangeField('margeInterGroupe', e.target.value)}
                fullWidth
                required
                disabled={saving}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
          </Grid>
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
          disabled={saving}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
