// src/features/objectifs/ObjectifManagement.tsx

import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Stack } from '@mui/material';
import type { GridPaginationModel } from '@mui/x-data-grid';
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
import type { Groupement } from '../../types/usersite.types';
import { ObjectifFilters } from './ObjectifFilters';
import { ObjectifTable } from './ObjectifTable';
import { ObjectifDialog } from './ObjectifDialog';
import { useObjectifColumns } from './useObjectifColumns';
import type { ObjectifFormState, PaginationState } from './objectifTypes';

const extractArray = <T,>(payload: any): T[] => {
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
    filiale?: Array<Filiale>;
    succursale?: Array<Succursale>;
  }>({});
  const modeleCache = useRef<Record<number, Modele[]>>({});
  const versionCache = useRef<Record<number, Version[]>>({});
  const objectifsCache = useRef<Record<number, ObjectifView[]>>({});

  const [selectedPeriode, setSelectedPeriode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 25,
    totalRecords: 0,
    totalPages: 1,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editingObjectif, setEditingObjectif] = useState<ObjectifView | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ObjectifFormState>({
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
          siteList = extractArray<Filiale>(response.data);
        } else if (normalizedName === 'succursale') {
          const response = await succursaleApi.listSuccursales({ pageSize: 1000 });
          siteList = extractArray<Succursale>(response.data);
        } else {
          setSites([]);
          return;
        }

        if (cacheKey) {
          siteCache.current[cacheKey] = siteList as any;
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
        const requestedPage = Math.min(Math.max(model.page + 1, 1), totalPages);

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
          margeInterGroupe: '0',
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

          const objectifModeleId = objectif.modeleID;
          if (typeof objectifModeleId === 'number' && objectifModeleId > 0) {
            const cachedVersions = versionCache.current[objectifModeleId];
            if (cachedVersions) {
              startTransition(() => setVersions(cachedVersions));
            }
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

  const handleFormChange = <K extends keyof ObjectifFormState>(
    key: K,
    value: ObjectifFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const columns = useObjectifColumns({
    hasUpdate: hasUpdatePermission,
    onEdit: handleOpenDialog,
  });

  return (
    <Box
      sx={{
        p: 4,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))'
            : 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(226,232,240,0.7))',
        borderRadius: 4,
        minHeight: '100%',
      }}
    >
      <Stack spacing={3}>
        <ObjectifFilters
          periodes={periodes}
          selectedPeriode={selectedPeriode}
          hasCreate={hasCreatePermission}
          error={error}
          onClearError={() => setError(null)}
          onChangePeriode={setSelectedPeriode}
          onCreate={() => handleOpenDialog()}
        />

        {!selectedPeriode && (
          <Alert severity="info">
            Veuillez sélectionner une période pour voir les objectifs.
          </Alert>
        )}

        {selectedPeriode && (
          <ObjectifTable
            rows={paginatedObjectifs}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            error={error}
            onClearError={() => setError(null)}
          />
        )}

        <ObjectifDialog
          open={openDialog}
          isEdit={!!editingObjectif}
          formState={formData}
          saving={saving}
          error={error}
          periodes={periodes}
          typeVentes={typeVentes}
          typeObjectifs={typeObjectifs}
          marques={marques}
          modeles={modeles}
          versions={versions}
          groupements={groupements}
          sites={sites}
          onClose={handleCloseDialog}
          onSave={handleSave}
          onChangeField={handleFormChange}
          onClearError={() => setError(null)}
        />
      </Stack>
    </Box>
  );
};
