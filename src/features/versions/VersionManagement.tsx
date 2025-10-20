// src/features/versions/VersionManagement.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { marqueApi, type Marque } from '../../api/endpoints/marque.api';
import { modeleApi, type Modele } from '../../api/endpoints/modele.api';
import { versionApi, type Version } from '../../api/endpoints/version.api';
import { useAuthStore } from '../../store/authStore';

interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface VersionFormState {
  name: string;
  idMarque: number | null;
  idModele: number | null;
  volume: number;
  price: number;
  tmPercent: number;
  marginPercent: number;
  active: boolean;
}

type DialogMode = 'create' | 'edit';

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const VersionManagement: React.FC = () => {
  const hasCreate = useAuthStore((state) => state.hasPermission('VERSION_CREATE'));
  const hasUpdate = useAuthStore((state) => state.hasPermission('VERSION_UPDATE'));

  const [marques, setMarques] = useState<Marque[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [marquesLoading, setMarquesLoading] = useState(false);
  const [modelesLoading, setModelesLoading] = useState(false);
  const [filtersError, setFiltersError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [pageState, setPageState] = useState({ page: 1, pageSize: 10 });
  const [filterMarqueId, setFilterMarqueId] = useState<number | 'all'>('all');
  const [filterModeleId, setFilterModeleId] = useState<number | 'all'>('all');
  const [reloadToken, setReloadToken] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [formState, setFormState] = useState<VersionFormState>({
    name: '',
    idMarque: null,
    idModele: null,
    volume: 1,
    price: 0,
    tmPercent: 0,
    marginPercent: 0,
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const loadMarques = useCallback(async () => {
    try {
      setMarquesLoading(true);
      setFiltersError(null);
      const response = await marqueApi.list({ onlyActive: true, page: 1, pageSize: 1000 });
      setMarques(response.data ?? []);
    } catch (err: any) {
      console.error('Failed to load marques', err);
      setFiltersError(err?.response?.data?.error ?? 'Impossible de charger les marques.');
    } finally {
      setMarquesLoading(false);
    }
  }, []);

  const loadModeles = useCallback(
    async (marqueId: number | 'all') => {
      if (marqueId === 'all') {
        setModeles([]);
        setFilterModeleId('all');
        return;
      }
      try {
        setModelesLoading(true);
        setFiltersError(null);
        const response = await modeleApi.list({
          idMarque: marqueId,
          onlyActive: true,
          page: 1,
          pageSize: 1000,
        });
        setModeles(response.data ?? []);
        if (response.data && response.data.length > 0) {
          setFilterModeleId(response.data[0].id);
        } else {
          setFilterModeleId('all');
        }
      } catch (err: any) {
        console.error('Failed to load modeles', err);
        setFiltersError(err?.response?.data?.error ?? 'Impossible de charger les modeles.');
        setModeles([]);
        setFilterModeleId('all');
      } finally {
        setModelesLoading(false);
      }
    },
    []
  );

  const loadVersions = useCallback(async () => {
    try {
      setVersionsLoading(true);
      setVersionsError(null);
      const response = await versionApi.list({
        idModele: filterModeleId === 'all' ? undefined : filterModeleId,
        onlyActive: false,
        page: pageState.page,
        pageSize: pageState.pageSize,
      });

      const enriched = (response.data ?? []).map((version) => ({
        ...version,
        modeleName: version.modeleName ?? modeles.find((m) => m.id === version.idModele)?.name ?? 'N/A',
        marqueName:
          version.marqueName ??
          marques.find((marque) => marque.id === modeles.find((m) => m.id === version.idModele)?.idMarque)?.name ??
          'N/A',
      }));

      setVersions(enriched);
      setPagination({
        page: response.pagination?.page ?? pageState.page,
        pageSize: response.pagination?.pageSize ?? pageState.pageSize,
        totalRecords: response.pagination?.totalRecords ?? enriched.length,
        totalPages: response.pagination?.totalPages ?? 1,
      });
    } catch (err: any) {
      console.error('Failed to load versions', err);
      setVersionsError(err?.response?.data?.error ?? 'Impossible de charger les versions.');
      setVersions([]);
      setPagination((prev) => ({ ...prev, totalRecords: 0, totalPages: 0 }));
    } finally {
      setVersionsLoading(false);
    }
  }, [filterModeleId, modeles, marques, pageState.page, pageState.pageSize, reloadToken]);

  useEffect(() => {
    loadMarques();
  }, [loadMarques]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  useEffect(() => {
    if (filterMarqueId !== 'all') {
      loadModeles(filterMarqueId);
    } else {
      setModeles([]);
      setFilterModeleId('all');
      setReloadToken((value) => value + 1);
    }
  }, [filterMarqueId, loadModeles]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPageState({
      page: model.page + 1,
      pageSize: model.pageSize,
    });
  };

  const openDialog = (mode: DialogMode, version?: Version) => {
    setDialogMode(mode);
    setCurrentVersion(version ?? null);
    if (mode === 'edit' && version) {
      const associatedModele = modeles.find((m) => m.id === version.idModele);
      setFormState({
        name: version.name,
        idMarque: associatedModele?.idMarque ?? null,
        idModele: version.idModele,
        volume: version.volume,
        price: version.price,
        tmPercent: Math.round(version.tm * 1000) / 10,
        marginPercent: Math.round(version.margin * 1000) / 10,
        active: version.active,
      });
      if (associatedModele) {
        setFilterMarqueId(associatedModele.idMarque);
        setFilterModeleId(associatedModele.id);
      }
    } else {
      setFormState({
        name: '',
        idMarque: filterMarqueId === 'all' ? null : filterMarqueId,
        idModele: filterModeleId === 'all' ? null : filterModeleId,
        volume: 1,
        price: 0,
        tmPercent: 0,
        marginPercent: 0,
        active: true,
      });
    }
    setVersionsError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setCurrentVersion(null);
  };

  const handleFormChange = <K extends keyof VersionFormState>(
    key: K,
    value: VersionFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      setVersionsError('Le nom de la version est requis.');
      return;
    }
    if (!formState.idModele) {
      setVersionsError('Veuillez selectionner un modele.');
      return;
    }
    if (formState.volume <= 0 || formState.price <= 0) {
      setVersionsError('Veuillez saisir un volume et un prix valides.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: formState.name.trim(),
        idModele: formState.idModele,
        volume: formState.volume,
        price: formState.price,
        tm: formState.tmPercent / 100,
        margin: formState.marginPercent / 100,
      };

      if (dialogMode === 'edit' && currentVersion) {
        await versionApi.update(currentVersion.id, payload);
      } else {
        await versionApi.create(payload);
        setPageState((prev) => ({ ...prev, page: 1 }));
      }
      setDialogOpen(false);
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to save version', err);
      setVersionsError(err?.response?.data?.error ?? 'Impossible de sauvegarder la version.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (version: Version) => {
    try {
      setTogglingId(version.id);
      if (version.active) {
        await versionApi.deactivate(version.id);
      } else {
        await versionApi.activate(version.id);
      }
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error('Failed to toggle version', err);
      setVersionsError(err?.response?.data?.error ?? "Impossible de mettre a jour l'etat de la version.");
    } finally {
      setTogglingId(null);
    }
  };

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
      }),
    []
  );

  const columns = useMemo<GridColDef<Version>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Version',
        flex: 1.2,
        minWidth: 220,
        align: 'left',
        headerAlign: 'left',
        sortable: false,
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {row.name}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'modeleName',
        headerName: 'Modele',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Chip
              label={row.modeleName ?? 'N/A'}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: alpha('#2563eb', 0.15),
                color: '#1d4ed8',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'marqueName',
        headerName: 'Marque',
        flex: 1,
        minWidth: 160,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Chip
              label={row.marqueName ?? 'N/A'}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: alpha('#7c3aed', 0.12),
                color: '#5b21b6',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'price',
        headerName: 'Prix',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>
              {currencyFormatter.format(row.price ?? 0)}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'volume',
        headerName: 'Volume',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>
              {row.volume}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'tm',
        headerName: 'TM (%)',
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>
              {`${((row.tm ?? 0) * 100).toFixed(1)}%`}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'margin',
        headerName: 'Marge (%)',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>
              {`${((row.margin ?? 0) * 100).toFixed(1)}%`}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'active',
        headerName: 'Statut',
        width: 140,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Chip
              label={row.active ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: row.active ? alpha('#22c55e', 0.15) : alpha('#94a3b8', 0.2),
                color: row.active ? '#15803d' : '#475569',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 260,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            {hasUpdate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => openDialog('edit', row)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Modifier
              </Button>
            )}
            {hasUpdate && (
              <Button
                variant="contained"
                size="small"
                color={row.active ? 'error' : 'success'}
                onClick={() => handleToggleActive(row)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minWidth: 110 }}
                disabled={togglingId === row.id}
              >
                {togglingId === row.id
                  ? 'Patientez...'
                  : row.active
                  ? 'Desactiver'
                  : 'Activer'}
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    [currencyFormatter, hasUpdate, togglingId]
  );

  const isFormValid =
    formState.name.trim().length > 0 &&
    formState.idModele !== null &&
    formState.volume > 0 &&
    formState.price > 0;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))'
            : 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(226,232,240,0.7))',
        borderRadius: 4,
        minHeight: '100%',
      }}
    >
      <Stack spacing={3}>
        <Box textAlign="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Versions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filtrez vos versions par marque et modele, puis ajustez leurs caracteristiques.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2.5, md: 3 },
            border: '1px solid',
            borderColor: alpha('#1e293b', 0.05),
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Marque (optionnel)</InputLabel>
                <Select
                  value={filterMarqueId === 'all' ? '' : filterMarqueId}
                  label="Marque (optionnel)"
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilterMarqueId(value === '' ? 'all' : Number(value));
                    setPageState((prev) => ({ ...prev, page: 1 }));
                  }}
                  disabled={marquesLoading}
                >
                  <MenuItem value="">Toutes les marques</MenuItem>
                  {marques.map((marque) => (
                    <MenuItem key={marque.id} value={marque.id}>
                      {marque.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Modele (optionnel)</InputLabel>
                <Select
                  value={filterModeleId === 'all' ? '' : filterModeleId}
                  label="Modele (optionnel)"
                  onChange={(event) => {
                    const value = event.target.value;
                    const parsed = value === '' ? 'all' : Number(value);
                    setFilterModeleId(parsed);
                    setPageState((prev) => ({ ...prev, page: 1 }));
                    setReloadToken((prev) => prev + 1);
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
            <Grid item xs={12} md={4}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
              >
                <Chip
                  label={`${pagination.totalRecords} version${pagination.totalRecords === 1 ? '' : 's'}`}
                  color="primary"
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                />
                {hasCreate && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openDialog('create')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      boxShadow: '0 12px 28px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    Nouvelle version
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
          {filtersError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setFiltersError(null)}>
              {filtersError}
            </Alert>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2.5, md: 3 },
            border: '1px solid',
            borderColor: alpha('#1e293b', 0.05),
            boxShadow: '0 22px 48px rgba(15, 23, 42, 0.12)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {versionsError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setVersionsError(null)}>
              {versionsError}
            </Alert>
          )}
          <DataGrid
            autoHeight
            rows={versions}
            columns={columns}
            getRowId={(row) => row.id}
            loading={versionsLoading}
            paginationMode="server"
            paginationModel={{
              page: Math.max(pagination.page - 1, 0),
              pageSize: pagination.pageSize,
            }}
            rowCount={pagination.totalRecords}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            disableColumnMenu
            disableColumnFilter
            disableColumnSelector
            density="comfortable"
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '& .MuiDataGrid-row': {
                borderRadius: 3,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 18px 30px rgba(15, 23, 42, 0.14)',
                  backgroundColor: alpha('#2563eb', 0.06),
                },
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: alpha('#1e293b', 0.05),
                paddingTop: '14px',
                paddingBottom: '14px',
              },
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: '1px solid',
                borderColor: alpha('#1e293b', 0.1),
                background: alpha('#1d4ed8', 0.1),
              },
            }}
          />
        </Paper>
      </Stack>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialogMode === 'edit' ? 'Modifier la version' : 'Nouvelle version'}
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 2,
            maxHeight: { xs: '60vh', md: '65vh' },
            overflowY: 'auto',
            pr: 1,
            flexGrow: 1,
          }}
        >
          <TextField
            label="Nom de la version"
            value={formState.name}
            onChange={(event) => handleFormChange('name', event.target.value)}
            fullWidth
            required
            autoFocus
          />

          <FormControl fullWidth required>
            <InputLabel>Marque</InputLabel>
            <Select
              value={formState.idMarque ?? ''}
              label="Marque"
              onChange={(event) => {
                const marqueId = event.target.value === '' ? null : Number(event.target.value);
                handleFormChange('idMarque', marqueId);
                if (marqueId) {
                  loadModeles(marqueId);
                } else {
                  setModeles([]);
                  handleFormChange('idModele', null);
                }
              }}
            >
              <MenuItem value="">Selectionner une marque</MenuItem>
              {marques.map((marque) => (
                <MenuItem key={marque.id} value={marque.id}>
                  {marque.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Modele</InputLabel>
            <Select
              value={formState.idModele ?? ''}
              label="Modele"
              onChange={(event) =>
                handleFormChange('idModele', event.target.value === '' ? null : Number(event.target.value))
              }
            >
              <MenuItem value="">Selectionner un modele</MenuItem>
              {modeles.map((modele) => (
                <MenuItem key={modele.id} value={modele.id}>
                  {modele.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Volume"
                type="number"
                value={formState.volume}
                onChange={(event) => handleFormChange('volume', Number(event.target.value))}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prix (MAD)"
                type="number"
                value={formState.price}
                onChange={(event) => handleFormChange('price', Number(event.target.value))}
                fullWidth
                required
                inputProps={{ min: 0, step: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="TM (%)"
                type="number"
                value={formState.tmPercent}
                onChange={(event) => handleFormChange('tmPercent', Number(event.target.value))}
                fullWidth
                required
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Marge (%)"
                type="number"
                value={formState.marginPercent}
                onChange={(event) => handleFormChange('marginPercent', Number(event.target.value))}
                fullWidth
                required
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Switch
                checked={formState.active}
                onChange={(event) => handleFormChange('active', event.target.checked)}
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
            disabled={saving || !isFormValid}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {dialogMode === 'edit' ? 'Mettre a jour' : 'Creer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
