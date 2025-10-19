// src/features/objectifs/ObjectifManagement.tsx

import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { DataTable } from '../../components/common/DataTable';
import { objectifApi, ObjectifView } from '../../api/endpoints/objectif.api';
import { periodeApi, Periode } from '../../api/endpoints/periode.api';
import { typeventeApi, TypeVente } from '../../api/endpoints/typevente.api';
import { typeobjectifApi, TypeObjectif } from '../../api/endpoints/typeobjectif.api';
import { marqueApi, Marque } from '../../api/endpoints/marque.api';
import { modeleApi, Modele } from '../../api/endpoints/modele.api';
import { versionApi, Version } from '../../api/endpoints/version.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { filialeApi, Filiale } from '../../api/endpoints/filiale.api';
import { succursaleApi, Succursale } from '../../api/endpoints/succursale.api';
import { useAuthStore } from '../../store/authStore';
import type { PaginationMeta } from '../../types/api.types';
import type { Groupement } from '../../types/usersite.types';

const extractArray = <T = any>(payload: any): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const ObjectifManagement: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const hasCreatePermission = useAuthStore((state) => state.hasPermission('OBJECTIF_CREATE'));
  const hasUpdatePermission = useAuthStore((state) => state.hasPermission('OBJECTIF_UPDATE'));

  const [objectifs, setObjectifs] = useState<ObjectifView[]>([]);
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [typeVentes, setTypeVentes] = useState<TypeVente[]>([]);
  const [typeObjectifs, setTypeObjectifs] = useState<TypeObjectif[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [groupements, setGroupements] = useState<Groupement[]>([]);
  const [sites, setSites] = useState<Array<Filiale | Succursale>>([]);

  const siteCache = useRef<{
    filiale?: Array<Filiale | Succursale>;
    succursale?: Array<Filiale | Succursale>;
  }>({});
  const modeleCache = useRef<Record<number, Modele[]>>({});
  const versionCache = useRef<Record<number, Version[]>>({});
  const objectifsCache = useRef<Record<number, ObjectifView[]>>({});

  const [selectedPeriode, setSelectedPeriode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 25,
    totalRecords: 0,
    totalPages: 1,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editingObjectif, setEditingObjectif] = useState<ObjectifView | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    groupementId: 0,
    siteId: 0,
    periodeId: 0,
    typeVenteId: 0,
    typeObjectifId: 0,
    marqueId: 0,
    modeleId: 0,
    versionId: 0,
    volume: '',
    salePrice: '',
    tmDirect: '',
    margeInterGroupe: '',
  });

  const loadAllDropdownData = useCallback(async () => {
    try {
      setLoading(true);
      const [periodesRes, typeVentesRes, typeObjectifsRes, marquesRes, groupementsRes] =
        await Promise.all([
          periodeApi.listActivePeriodes({ pageSize: 1000 }),
          typeventeApi.listActiveTypeVentes(),
          typeobjectifApi.listActiveTypeObjectifs(),
          marqueApi.list({ onlyActive: true, pageSize: 1000 }),
          groupementApi.listGroupements(),
        ]);

      setPeriodes(extractArray<Periode>(periodesRes.data));
      setTypeVentes(extractArray<TypeVente>(typeVentesRes.data));
      setTypeObjectifs(extractArray<TypeObjectif>(typeObjectifsRes.data));
      setMarques(extractArray<Marque>(marquesRes.data));
      setGroupements(extractArray<Groupement>(groupementsRes));
    } catch (err: any) {
      console.error('Failed to load dropdown data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSitesByGroupement = useCallback(
    async (groupementId: number) => {
      try {
        const groupement = groupements.find((g) => g.id === groupementId);
        if (!groupement) {
          setSites([]);
          return;
        }

        const normalizedName = groupement.name?.toLowerCase();
        const cacheKey =
          normalizedName === 'filiale'
            ? 'filiale'
            : normalizedName === 'succursale'
            ? 'succursale'
            : undefined;

        if (cacheKey && siteCache.current[cacheKey]) {
          const cachedSites = siteCache.current[cacheKey] ?? [];
          startTransition(() => setSites(cachedSites));
          return;
        }

        let siteList: Array<Filiale | Succursale> = [];

        if (normalizedName === 'filiale') {
          const response = await filialeApi.listFiliales({ pageSize: 1000 });
          siteList = extractArray<Filiale | Succursale>(response.data);
        } else if (normalizedName === 'succursale') {
          const response = await succursaleApi.listSuccursales({ pageSize: 1000 });
          siteList = extractArray<Filiale | Succursale>(response.data);
        } else {
          setSites([]);
          return;
        }

        if (cacheKey) {
          siteCache.current[cacheKey] = siteList;
        }

        startTransition(() => setSites(siteList));
      } catch (err: any) {
        console.error('Failed to load sites:', err);
      }
    },
    [groupements]
  );

  const loadModelesByMarque = useCallback(async (marqueId: number) => {
    try {
      if (modeleCache.current[marqueId]) {
        const cachedModeles = modeleCache.current[marqueId];
        startTransition(() => setModeles(cachedModeles));
        return;
      }

      const response = await modeleApi.listByMarque(marqueId, { pageSize: 1000 });
      const modelesList = extractArray<Modele>(response.data);
      modeleCache.current[marqueId] = modelesList;
      startTransition(() => setModeles(modelesList));
    } catch (err: any) {
      console.error('Failed to load modeles:', err);
    }
  }, []);

  const loadVersionsByModele = useCallback(async (modeleId: number) => {
    try {
      if (versionCache.current[modeleId]) {
        const cachedVersions = versionCache.current[modeleId];
        startTransition(() => setVersions(cachedVersions));
        return;
      }

      const response = await versionApi.listByModele({ idModele: modeleId, pageSize: 1000 });
      const versionList = extractArray<Version>(response.data);
      versionCache.current[modeleId] = versionList;
      startTransition(() => setVersions(versionList));
    } catch (err: any) {
      console.error('Failed to load versions:', err);
    }
  }, []);

  const loadObjectifs = useCallback(
    async (options: { force?: boolean } = {}) => {
      if (!selectedPeriode) return;

      const { force = false } = options;
      const cached = objectifsCache.current[selectedPeriode];
      const shouldShowLoader = !cached || force;

      if (cached && !force) {
        startTransition(() => setObjectifs(cached));
      }

      try {
        if (shouldShowLoader) {
          setLoading(true);
        }
        setError(null);
        const response = await objectifApi.listObjectifsView({
          periodeId: selectedPeriode,
        });

        const objectifsData = extractArray<ObjectifView>(response.data);
        objectifsCache.current[selectedPeriode] = objectifsData;
        startTransition(() => setObjectifs(objectifsData));
      } catch (err: any) {
        console.error('Failed to load objectifs:', err);
        setError(err.response?.data?.error || 'Failed to load objectifs');
      } finally {
        if (shouldShowLoader) {
          setLoading(false);
        }
      }
    },
    [selectedPeriode]
  );

  useEffect(() => {
    loadAllDropdownData();
  }, [loadAllDropdownData]);

  useEffect(() => {
    if (selectedPeriode) {
      loadObjectifs();
    }
  }, [selectedPeriode, loadObjectifs]);

  useEffect(() => {
    if (formData.groupementId) {
      loadSitesByGroupement(formData.groupementId);
    }
  }, [formData.groupementId, loadSitesByGroupement]);

  useEffect(() => {
    if (formData.marqueId) {
      loadModelesByMarque(formData.marqueId);
    } else {
      setModeles([]);
    }
  }, [formData.marqueId, loadModelesByMarque]);

  useEffect(() => {
    if (formData.modeleId) {
      loadVersionsByModele(formData.modeleId);
    } else {
      setVersions([]);
    }
  }, [formData.modeleId, loadVersionsByModele]);
  
  useEffect(() => {
    setPagination((prev) => {
      const totalRecords = objectifs.length;
      const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / prev.pageSize) : 1;
      const nextPage = Math.min(Math.max(prev.page, 1), totalPages);

      if (
        prev.totalRecords === totalRecords &&
        prev.totalPages === totalPages &&
        prev.page === nextPage
      ) {
        return prev;
      }

      return {
        ...prev,
        page: nextPage,
        totalRecords,
        totalPages,
      };
    });
  }, [objectifs]);

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      setPagination(() => {
        const nextPageSize = Math.max(model.pageSize, 1);
        const totalRecords = objectifs.length;
        const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / nextPageSize) : 1;
        const requestedPage = Math.min(Math.max(model.page, 1), totalPages);

        return {
          page: requestedPage,
          pageSize: nextPageSize,
          totalRecords,
          totalPages,
        };
      });
    },
    [objectifs.length]
  );

  const paginatedObjectifs = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    return objectifs.slice(startIndex, startIndex + pagination.pageSize);
  }, [objectifs, pagination.page, pagination.pageSize]);

  const handleOpenDialog = useCallback(
    (objectif?: ObjectifView) => {
      if (objectif) {
        setEditingObjectif(objectif);
        setFormData({
          groupementId: objectif.groupementID,
          siteId: objectif.SiteID,
          periodeId: objectif.periodeID,
          typeVenteId: objectif.typeVenteID,
          typeObjectifId: objectif.typeObjectifId,
          marqueId: objectif.marqueID || 0,
          modeleId: objectif.modeleID || 0,
          versionId: objectif.versionID || 0,
          volume: objectif.volume.toString(),
          salePrice: objectif.price.toString(),
          tmDirect: (objectif.TauxMarge * 100).toFixed(2),
          margeInterGroupe: '0', // Calculate if needed
        });

        const normalizedGroupement = objectif.groupementName?.toLowerCase();
        const siteCacheKey =
          normalizedGroupement === 'filiale'
            ? 'filiale'
            : normalizedGroupement === 'succursale'
            ? 'succursale'
            : undefined;

        if (siteCacheKey && siteCache.current[siteCacheKey]) {
          startTransition(() => setSites(siteCache.current[siteCacheKey] ?? []));
        }

        const objectifMarqueId = objectif.marqueID;
        if (typeof objectifMarqueId === 'number' && objectifMarqueId > 0) {
          const cachedModeles = modeleCache.current[objectifMarqueId];
          if (cachedModeles) {
            startTransition(() => setModeles(cachedModeles));
          }
        }

        const objectifModeleId = objectif.modeleID;
        if (typeof objectifModeleId === 'number' && objectifModeleId > 0) {
          const cachedVersions = versionCache.current[objectifModeleId];
          if (cachedVersions) {
            startTransition(() => setVersions(cachedVersions));
          }
        }
      } else {
        setEditingObjectif(null);
        setFormData({
          groupementId: 0,
          siteId: 0,
          periodeId: selectedPeriode || 0,
          typeVenteId: 0,
          typeObjectifId: 0,
          marqueId: 0,
          modeleId: 0,
          versionId: 0,
          volume: '',
          salePrice: '',
          tmDirect: '',
          margeInterGroupe: '',
        });
        startTransition(() => {
          setSites([]);
          setModeles([]);
          setVersions([]);
        });
      }
      setOpenDialog(true);
    },
    [selectedPeriode]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingObjectif(null);
    setError(null);
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const apiData = {
        userId: currentUser?.id || 0,
        groupementId: formData.groupementId,
        siteId: formData.siteId,
        periodeId: formData.periodeId,
        typeVenteId: formData.typeVenteId,
        typeObjectifId: formData.typeObjectifId,
        marqueId: formData.marqueId || null,
        modeleId: formData.modeleId || null,
        versionId: formData.versionId || null,
        volume: parseInt(formData.volume) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        tmDirect: (parseFloat(formData.tmDirect) || 0) / 100,
        margeInterGroupe: (parseFloat(formData.margeInterGroupe) || 0) / 100,
      };

      if (editingObjectif) {
        await objectifApi.updateObjectif(editingObjectif.id, apiData);
      } else {
        await objectifApi.createObjectif(apiData);
      }

        handleCloseDialog();
        await loadObjectifs({ force: true });
    } catch (err: any) {
      console.error('Failed to save objectif:', err);
      const apiError = err.response?.data;
      if (apiError?.details && typeof apiError.details === 'object') {
        const detailMessages = Object.values(apiError.details)
          .filter((message): message is string => typeof message === 'string')
          .join(' • ');
        setError(detailMessages || apiError.error || 'Failed to save objectif');
      } else {
        setError(apiError?.error || err.message || 'Failed to save objectif');
      }
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
    {
      field: 'groupementName',
      headerName: 'Groupement',
      width: 120,
    },
    {
      field: 'SiteName',
      headerName: 'Site',
      width: 150,
    },
    {
      field: 'periodeName',
      headerName: 'Période',
      width: 180,
    },
    {
      field: 'typeVenteName',
      headerName: 'Type Vente',
      width: 110,
    },
    {
      field: 'typeObjectifName',
      headerName: 'Type Objectif',
      width: 130,
    },
    {
      field: 'marqueName',
      headerName: 'Marque',
      width: 120,
    },
    {
      field: 'modeleName',
      headerName: 'Modèle',
      width: 120,
    },
    {
      field: 'versionName',
      headerName: 'Version',
      width: 130,
    },
    {
      field: 'volume',
      headerName: 'Volume',
      width: 90,
      align: 'right' as const,
      headerAlign: 'right' as const,
    },
    {
      field: 'ChiffreDaffaire',
      headerName: 'CA',
      width: 120,
      align: 'right' as const,
      headerAlign: 'right' as const,
      renderCell: (params) => (
        <span>
          {params.row.ChiffreDaffaire.toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          DH
        </span>
      ),
    },
    {
      field: 'Marge',
      headerName: 'Marge',
      width: 120,
      align: 'right' as const,
      headerAlign: 'right' as const,
      renderCell: (params) => (
        <span>
          {params.row.Marge.toLocaleString('fr-MA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          DH
        </span>
      ),
    },
    {
      field: 'TauxMarge',
      headerName: 'Taux Marge',
      width: 110,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: (params) => <span>{(params.row.TauxMarge * 100).toFixed(2)}%</span>,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: (params) =>
        hasUpdatePermission ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tooltip title="Edit">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(params.row)}
                  sx={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    backgroundColor: 'rgba(148, 163, 184, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(251, 191, 36, 0.16)',
                      borderColor: 'rgba(245, 158, 11, 0.4)',
                      color: 'warning.main',
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ) : null,
    },
  ],
    [hasUpdatePermission, handleOpenDialog]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Sélectionner une période</InputLabel>
          <Select
            value={selectedPeriode || ''}
            label="Sélectionner une période"
            onChange={(e) => setSelectedPeriode(e.target.value ? Number(e.target.value) : null)}
          >
            {periodes.map((periode) => (
              <MenuItem key={periode.id} value={periode.id}>
                {`${periode.startedDate} - ${periode.endDate} (${periode.year})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasCreatePermission && selectedPeriode && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Objectif
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!selectedPeriode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Veuillez sélectionner une période pour voir les objectifs.
        </Alert>
      )}

        {selectedPeriode && (
          <DataTable
            rows={paginatedObjectifs}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
          />
        )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingObjectif ? 'Modifier Objectif' : 'Nouveau Objectif'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Groupement</InputLabel>
                <Select
                  value={formData.groupementId}
                  label="Groupement"
                  onChange={(e) =>
                    setFormData({ ...formData, groupementId: Number(e.target.value), siteId: 0 })
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
                  value={formData.siteId}
                  label="Site"
                  onChange={(e) => setFormData({ ...formData, siteId: Number(e.target.value) })}
                  disabled={saving || !formData.groupementId}
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
                  value={formData.periodeId}
                  label="Période"
                  onChange={(e) => setFormData({ ...formData, periodeId: Number(e.target.value) })}
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
                  value={formData.typeVenteId}
                  label="Type Vente"
                  onChange={(e) =>
                    setFormData({ ...formData, typeVenteId: Number(e.target.value) })
                  }
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
                  value={formData.typeObjectifId}
                  label="Type Objectif"
                  onChange={(e) =>
                    setFormData({ ...formData, typeObjectifId: Number(e.target.value) })
                  }
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
                  value={formData.marqueId}
                  label="Marque (Optionnel)"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marqueId: Number(e.target.value),
                      modeleId: 0,
                      versionId: 0,
                    })
                  }
                  disabled={saving}
                >
                  <MenuItem value={0}>Aucune</MenuItem>
                  {marques.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.marqueId}>
                <InputLabel>Modèle (Optionnel)</InputLabel>
                <Select
                  value={formData.modeleId}
                  label="Modèle (Optionnel)"
                  onChange={(e) =>
                    setFormData({ ...formData, modeleId: Number(e.target.value), versionId: 0 })
                  }
                  disabled={saving || !formData.marqueId}
                >
                  <MenuItem value={0}>Aucun</MenuItem>
                  {modeles.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.modeleId}>
                <InputLabel>Version (Optionnel)</InputLabel>
                <Select
                  value={formData.versionId}
                  label="Version (Optionnel)"
                  onChange={(e) => setFormData({ ...formData, versionId: Number(e.target.value) })}
                  disabled={saving || !formData.modeleId}
                >
                  <MenuItem value={0}>Aucune</MenuItem>
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
                fullWidth
                label="Volume"
                type="number"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                required
                disabled={saving}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix de Vente (DH)"
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                required
                disabled={saving}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="TM Direct (%)"
                type="number"
                value={formData.tmDirect}
                onChange={(e) => setFormData({ ...formData, tmDirect: e.target.value })}
                required
                disabled={saving}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marge Inter Groupe (%)"
                type="number"
                value={formData.margeInterGroupe}
                onChange={(e) => setFormData({ ...formData, margeInterGroupe: e.target.value })}
                required
                disabled={saving}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              saving ||
              !formData.groupementId ||
              !formData.siteId ||
              !formData.periodeId ||
              !formData.typeVenteId ||
              !formData.typeObjectifId ||
              !formData.volume
            }
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'En cours...' : editingObjectif ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
