import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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
interface ObjectifDialogSiteInfo {
  siteName: string;
  groupementName?: string | null;
}

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
  marquesCount: number;
  modelesCount: number;
  versionsCount: number;
  siteInfo?: ObjectifDialogSiteInfo | null;
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
  marquesCount,
  modelesCount,
  versionsCount,
  siteInfo,
  onClose,
  onSave,
  onChangeField,
  onClearError,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const selectedMarque = useMemo(
    () => marques.find((marque) => marque.id === formState.marqueId),
    [marques, formState.marqueId]
  );

  const selectedModele = useMemo(
    () => modeles.find((modele) => modele.id === formState.modeleId),
    [modeles, formState.modeleId]
  );

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === formState.versionId),
    [versions, formState.versionId]
  );

  const selectedTypeVente = useMemo(
    () => typeVentes.find((type) => type.id === formState.typeVenteId),
    [typeVentes, formState.typeVenteId]
  );

  const normalizedTypeVenteName = selectedTypeVente?.name?.trim().toLowerCase() ?? '';
  const hasSelectedTypeVente = normalizedTypeVenteName.length > 0;
  const isDirectTypeVente = normalizedTypeVenteName === 'direct';
  const showTmDirectField = !hasSelectedTypeVente || isDirectTypeVente;
  const showTmInterField = !hasSelectedTypeVente || !isDirectTypeVente;
  const tmDirectEditable = isDirectTypeVente;
  const tmInterEditable = hasSelectedTypeVente && !isDirectTypeVente;
  const getMarqueImage = (marque?: Marque | null) => {
    const source =
      marque?.imageUrl ??
      (marque && 'image' in marque ? ((marque as any).image as string) : null);
    return source && source.trim().length > 0 ? source : '/placeholder-car.png';
  };
  const getModeleImage = (modele?: Modele | null) =>
    modele?.imageUrl && modele.imageUrl.trim().length > 0 ? modele.imageUrl : '/placeholder-car.png';

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCurrencyValue = useCallback(
    (value?: number | null) => {
      if (value === null || value === undefined) {
        return 'N/A';
      }
      return formatCurrency.format(value);
    },
    [formatCurrency]
  );

  const formatPercentValue = useCallback((value?: number | null) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 'N/A';
    }
    const normalized = Math.abs(numeric) > 1 ? numeric / 100 : numeric;
    return `${(normalized * 100).toFixed(2)}%`;
  }, []);

  const formatPeriodeLabel = useCallback((periode: Periode) => {
    if (periode.name && periode.name.trim().length > 0) {
      return periode.name;
    }

    const start = periode.startedDate ?? '';
    const end = periode.endDate ?? '';
    const yearPart = periode.year ? ` (${periode.year})` : '';

    if (start && end) {
      return `${start} - ${end}${yearPart}`;
    }

    if (start || end) {
      return `${start || end}${yearPart}`;
    }

    return `Periode ${periode.id}`;
  }, []);

  const selectedPeriodeOption = useMemo(
    () => periodes.find((periode) => periode.id === formState.periodeId) ?? null,
    [periodes, formState.periodeId]
  );

  const selectedPeriodeLabel = useMemo(() => {
    if (!selectedPeriodeOption) {
      return 'Aucune periode selectionnee';
    }
    return formatPeriodeLabel(selectedPeriodeOption);
  }, [selectedPeriodeOption, formatPeriodeLabel]);

  const targetSummary = useMemo(() => {
    if (formState.targetType === 'marque' && selectedMarque) {
      return {
        title: selectedMarque.name,
        subtitle: selectedMarque.filialeName ?? null,
        rows: [
          { label: 'Prix moyen', value: formatCurrencyValue(selectedMarque.averageSalePrice ?? 0) },
          { label: 'TM direct', value: formatPercentValue(selectedMarque.tmDirect ?? 0) },
          { label: 'TM inter groupe', value: formatPercentValue(selectedMarque.tmInterGroupe ?? 0) },
        ],
      };
    }

    if (formState.targetType === 'modele' && selectedModele) {
      return {
        title: selectedModele.name,
        subtitle: selectedModele.marqueName ?? selectedMarque?.name ?? null,
        rows: [
          { label: 'Prix moyen', value: formatCurrencyValue(selectedModele.averageSalePrice ?? 0) },
          { label: 'TM direct', value: formatPercentValue(selectedModele.tmDirect ?? 0) },
          { label: 'TM inter groupe', value: formatPercentValue(selectedModele.tmInterGroupe ?? 0) },
        ],
      };
    }

    if (formState.targetType === 'version' && selectedVersion) {
      return {
        title: selectedVersion.nom,
        subtitle:
          selectedVersion.nomModele && selectedVersion.nomMarque
            ? `${selectedVersion.nomMarque} / ${selectedVersion.nomModele}`
            : selectedVersion.nomModele ?? selectedVersion.nomMarque ?? null,
        rows: [
          { label: 'Prix moyen', value: formatCurrencyValue(selectedVersion.prixDeVente ?? 0) },
          { label: 'TM direct', value: formatPercentValue(selectedVersion.tmDirect ?? 0) },
          { label: 'TM inter groupe', value: formatPercentValue(selectedVersion.tmInterGroupe ?? 0) },
        ],
      };
    }

    return null;
  }, [
    formState.targetType,
    selectedMarque,
    selectedModele,
    selectedVersion,
    formatCurrencyValue,
    formatPercentValue,
  ]);

  const handleTargetTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    value: ObjectifFormState['targetType'] | null
  ) => {
    if (!value || value === formState.targetType) {
      return;
    }
    onChangeField('targetType', value);
  };

  const isModeleStep = formState.targetType === 'modele' || formState.targetType === 'version';
  const isVersionStep = formState.targetType === 'version';

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
          background: (muiTheme) =>
            muiTheme.palette.mode === 'dark'
              ? alpha('#1e293b', 0.4)
              : alpha('#f8fafc', 0.8),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            {isEdit ? <TrackChangesIcon /> : <AddIcon />}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {isEdit ? 'Modifier un objectif' : 'Nouvel objectif'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdit
                ? "Mettez a jour les parametres de l'objectif selectionne."
                : 'Definissez la cible et les parametres de votre nouvel objectif.'}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} aria-label="Fermer la fenetre">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: isMobile ? 2 : 4,
          background: (muiTheme) =>
            muiTheme.palette.mode === 'dark'
              ? alpha(muiTheme.palette.background.default, 0.9)
              : alpha('#f8fafc', 0.9),
        }}
      >
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={onClearError}>
              {error}
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
              Identification
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Site"
                  value={siteInfo?.siteName || 'Non attribue'}
                  fullWidth
                  size={isMobile ? 'small' : 'medium'}
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Groupement"
                  value={siteInfo?.groupementName || 'Non attribue'}
                  fullWidth
                  size={isMobile ? 'small' : 'medium'}
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
              Metadonnees
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {isEdit ? (
                  <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                    <InputLabel>Periode</InputLabel>
                    <Select
                      value={formState.periodeId || ''}
                      label="Periode"
                      onChange={(event) => onChangeField('periodeId', Number(event.target.value))}
                      disabled={saving}
                      sx={{ borderRadius: 2 }}
                    >
                      {periodes.map((periode) => (
                        <MenuItem key={periode.id} value={periode.id}>
                          {formatPeriodeLabel(periode)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Periode"
                    value={selectedPeriodeLabel}
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Type vente</InputLabel>
                  <Select
                    value={formState.typeVenteId || ''}
                    label="Type vente"
                    onChange={(event) => onChangeField('typeVenteId', Number(event.target.value))}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {typeVentes.map((typeVente) => (
                      <MenuItem key={typeVente.id} value={typeVente.id}>
                        {typeVente.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
                  <InputLabel>Type objectif</InputLabel>
                  <Select
                    value={formState.typeObjectifId || ''}
                    label="Type objectif"
                    onChange={(event) => onChangeField('typeObjectifId', Number(event.target.value))}
                    disabled={saving}
                    sx={{ borderRadius: 2 }}
                  >
                    {typeObjectifs.map((typeObjectif) => (
                      <MenuItem key={typeObjectif.id} value={typeObjectif.id}>
                        {typeObjectif.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: alpha(theme.palette.primary.light, theme.palette.mode === 'dark' ? 0.08 : 0.12),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            <Stack spacing={2}>
              <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Cible de l'objectif
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  color="primary"
                  value={formState.targetType}
                  onChange={handleTargetTypeChange}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiToggleButton-root': {
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 2.5,
                    },
                  }}
                >
                  <ToggleButton value="marque">Par marque</ToggleButton>
                  <ToggleButton value="modele">Par modele</ToggleButton>
                  <ToggleButton value="version">Par version</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
                <Box flex={1}>
                  <Grid container spacing={2}>
                    <Grid
                      item
                      xs={12}
                      sm={formState.targetType === 'marque' && selectedMarque ? 6 : 12}
                    >
                      <FormControl fullWidth size={isMobile ? 'small' : 'medium'} required>
                        <InputLabel>Marque</InputLabel>
                        <Select
                          value={formState.marqueId || ''}
                          label="Marque"
                          onChange={(event) => onChangeField('marqueId', Number(event.target.value))}
                          disabled={saving}
                          sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="">
                              <em>Aucune</em>
                            </MenuItem>
                            {marques.map((marque) => (
                              <MenuItem key={marque.id} value={marque.id}>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                                  <Avatar
                                    variant="rounded"
                                    src={getMarqueImage(marque)}
                                    alt={marque.name}
                                    imgProps={{
                                      style: {
                                        objectFit: 'contain',
                                        padding: 6,
                                      },
                                    }}
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      bgcolor: 'background.paper',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                    }}
                                  />
                                  <Typography variant="body2" fontWeight={600}>
                                    {marque.name}
                                  </Typography>
                                </Stack>
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText sx={{ ml: 0.5 }}>
                            {marquesCount} marque{marquesCount !== 1 ? 's' : ''} disponibles
                          </FormHelperText>
                      </FormControl>
                    </Grid>
                    {formState.targetType === 'marque' && selectedMarque && (
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 1.5,
                            bgcolor: 'background.paper',
                            height: '100%',
                          }}
                        >
                          <Box
                            component="img"
                            src={getMarqueImage(selectedMarque)}
                            alt={selectedMarque.name}
                            onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = '/placeholder-car.png';
                            }}
                            sx={{
                              width: '100%',
                              height: 140,
                              objectFit: 'contain',
                              borderRadius: 1,
                              mb: 1,
                              backgroundColor: 'white',
                              p: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                            Aperçu de la marque
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {isModeleStep && (
                      <>
                        <Grid item xs={12} sm={formState.targetType === 'version' ? 6 : 6}>
                          <FormControl fullWidth size={isMobile ? 'small' : 'medium'} required={formState.targetType !== 'marque'}>
                            <InputLabel>Modele</InputLabel>
                            <Select
                              value={formState.modeleId || ''}
                              label="Modele"
                              onChange={(event) => onChangeField('modeleId', Number(event.target.value))}
                              disabled={saving || !formState.marqueId}
                              sx={{ borderRadius: 2 }}
                            >
                              <MenuItem value="">
                                <em>Aucun</em>
                              </MenuItem>
                              {modeles.map((modele) => (
                                <MenuItem key={modele.id} value={modele.id}>
                                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                                    <Avatar
                                      variant="rounded"
                                      src={getModeleImage(modele)}
                                      alt={modele.name}
                                      imgProps={{
                                        style: {
                                          objectFit: 'contain',
                                          padding: 6,
                                        },
                                      }}
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                      }}
                                    />
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>
                                        {modele.name}
                                      </Typography>
                                      {modele.marqueName && (
                                        <Typography variant="caption" color="text.secondary">
                                          {modele.marqueName}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Stack>
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText sx={{ ml: 0.5 }}>
                              {modelesCount} modele{modelesCount !== 1 ? 's' : ''} disponibles
                            </FormHelperText>
                          </FormControl>
                        </Grid>
                        {selectedModele && (
                          <Grid item xs={12} sm={formState.targetType === 'version' ? 6 : 6}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 1.5,
                                bgcolor: 'background.paper',
                                height: '100%',
                              }}
                            >
                              <Box
                                component="img"
                                src={getModeleImage(selectedModele)}
                                alt={selectedModele.name}
                                onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
                                  event.currentTarget.onerror = null;
                                  event.currentTarget.src = '/placeholder-car.png';
                                }}
                                sx={{
                                  width: '100%',
                                  height: 140,
                                  objectFit: 'contain',
                                  borderRadius: 1,
                                  mb: 1,
                                  backgroundColor: 'white',
                                  p: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" textAlign="center">
                                Aperçu du modele
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </>
                    )}

                    {isVersionStep && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size={isMobile ? 'small' : 'medium'} required>
                          <InputLabel>Version</InputLabel>
                          <Select
                            value={formState.versionId || ''}
                            label="Version"
                            onChange={(event) => onChangeField('versionId', Number(event.target.value))}
                            disabled={saving || !formState.modeleId}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="">
                              <em>Aucune</em>
                            </MenuItem>
                            {versions.map((version) => (
                              <MenuItem key={version.id} value={version.id}>
                                {version.nom}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText sx={{ ml: 0.5 }}>
                            {versionsCount} version{versionsCount !== 1 ? 's' : ''} disponibles
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {targetSummary && (
                  <Paper
                    elevation={0}
                    sx={{
                      minWidth: { xs: '100%', md: 260 },
                      p: 2.5,
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      background: alpha(theme.palette.primary.light, theme.palette.mode === 'dark' ? 0.16 : 0.1),
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {targetSummary.title}
                    </Typography>
                    {targetSummary.subtitle && (
                      <Typography variant="body2" color="text.secondary">
                        {targetSummary.subtitle}
                      </Typography>
                    )}
                    <Stack spacing={1.25} sx={{ mt: 2 }}>
                      {targetSummary.rows.map((row) => (
                        <Box key={row.label}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
                          >
                            {row.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {row.value}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
              Metriques
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Volume"
                  type="number"
                  value={formState.volume}
                  onChange={(event) => onChangeField('volume', event.target.value)}
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
                  label="Prix de vente (unitaire)"
                  type="number"
                  value={formState.salePrice || '0'}
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
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Chiffre d'affaire"
                  type="number"
                  value={formState.chiffreAffaire || '0'}
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
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              {showTmDirectField && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="TM direct (%)"
                    type="number"
                    value={formState.tmDirect}
                    fullWidth
                    required={tmDirectEditable}
                    disabled={saving}
                    size={isMobile ? 'small' : 'medium'}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              )}

              {showTmInterField && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Marge inter groupe (%)"
                    type="number"
                    value={formState.margeInterGroupe}
                    fullWidth
                    required={tmInterEditable}
                    disabled={saving}
                    size={isMobile ? 'small' : 'medium'}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              )}
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
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : isEdit ? <SaveIcon /> : <AddIcon />}
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
          {saving ? 'En cours...' : isEdit ? 'Mettre a jour' : 'Creer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
