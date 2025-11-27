// src/features/objectifs/ObjectifManagement.tsx

import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Stack } from "@mui/material";
import type { GridPaginationModel } from "@mui/x-data-grid";
import {
  objectifApi,
  ObjectifView,
  ListObjectifsParams,
} from "../../api/endpoints/objectif.api";
import { periodeApi, Periode } from "../../api/endpoints/periode.api";
import { typeventeApi, TypeVente } from "../../api/endpoints/typevente.api";
import {
  typeobjectifApi,
  TypeObjectif,
} from "../../api/endpoints/typeobjectif.api";
import { marqueApi, Marque } from "../../api/endpoints/marque.api";
import { modeleApi, Modele } from "../../api/endpoints/modele.api";
import { versionApi, Version } from "../../api/endpoints/version.api";
import { usersiteApi } from "../../api/endpoints/usersite.api";
import { useAuthStore } from "../../store/authStore";
import { useRoles } from "../../hooks/useRoles";
import type { UserSite } from "../../types/usersite.types";
import { ObjectifFilters } from "./ObjectifFilters";
import { ObjectifTable } from "./ObjectifTable";
import { ObjectifDialog } from "./ObjectifDialog";
import { ObjectifDetailsDialog } from "./ObjectifDetailsDialog"; // NEW
import { useObjectifColumns } from "./useObjectifColumns";
import type { ObjectifFormState, PaginationState } from "./objectifTypes";

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
  const { isIntegrateurObjectifs, isAdminFonctionnel } = useRoles();
  const canManageObjectifs = isIntegrateurObjectifs;
  const canCreateObjectif = canManageObjectifs;
  const canUpdateObjectif = canManageObjectifs;

  const [objectifs, setObjectifs] = useState<ObjectifView[]>([]);
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [typeVentes, setTypeVentes] = useState<TypeVente[]>([]);
  const [typeObjectifs, setTypeObjectifs] = useState<TypeObjectif[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [marquesTotal, setMarquesTotal] = useState(0);
  const [modelesTotal, setModelesTotal] = useState(0);
  const [versionsTotal, setVersionsTotal] = useState(0);
  const [userSiteAssignments, setUserSiteAssignments] = useState<UserSite[]>([]);
  const [dialogSiteInfo, setDialogSiteInfo] = useState<{
    siteId: number;
    siteName: string;
    groupementName?: string | null;
  } | null>(null);

  const userSiteIdFromProfile = useMemo(() => {
    if (!currentUser) return null;
    const possibleIds = [
      (currentUser as any)?.idUserSite,
      (currentUser as any)?.UserSiteId,
    ];
    for (const value of possibleIds) {
      if (value == null) continue;
      const parsedValue = Number(value);
      if (Number.isFinite(parsedValue) && parsedValue > 0) {
        return parsedValue;
      }
    }
    return null;
  }, [currentUser]);

  const fallbackUserSiteAssignment = useMemo((): UserSite | null => {
    if (!currentUser) return null;
    const rawSiteId = Number(
      (currentUser as any)?.SiteId ?? (currentUser as any)?.siteId ?? (currentUser as any)?.idSite ?? 0
    );
    const rawGroupement = (
      (currentUser as any)?.GroupementType ??
      (currentUser as any)?.groupementname ??
      (currentUser as any)?.SiteType ??
      (currentUser as any)?.sitetype ??
      ''
    ) as string;
    if (!Number.isFinite(rawSiteId) || rawSiteId <= 0 || !rawGroupement) {
      return null;
    }
    const normalizedGroupement = rawGroupement.toLowerCase();
    const siteType: 'Filiale' | 'Succursale' =
      normalizedGroupement === 'succursale' ? 'Succursale' : 'Filiale';
    return {
      id: Number((currentUser as any)?.idUserSite ?? (currentUser as any)?.UserSiteId ?? 0) || 0,
      idGroupement:
        Number((currentUser as any)?.idGroupement ?? (currentUser as any)?.GroupementId ?? 0) || 0,
      groupement_name: rawGroupement,
      idSite: rawSiteId,
      site_name: ((currentUser as any)?.SiteName ?? (currentUser as any)?.sitename ?? '') as string,
      site_type: siteType,
      active: ((currentUser as any)?.UserSiteActive ?? (currentUser as any)?.userSiteActive ?? true) as boolean,
      createdAt: ((currentUser as any)?.createdAt ?? (currentUser as any)?.CreatedAt) as string | undefined,
      updatedAt: ((currentUser as any)?.updatedAt ?? (currentUser as any)?.UpdatedAt) as string | undefined,
    };
  }, [currentUser]);

  const primaryAssignment = useMemo(() => {
    if (userSiteAssignments.length > 0) {
      return userSiteAssignments[0];
    }
    return fallbackUserSiteAssignment;
  }, [userSiteAssignments, fallbackUserSiteAssignment]);

  const resolveUserSiteInfo = useCallback(async (assignment: UserSite | null): Promise<UserSite | null> => {
    if (!assignment) {
      return null;
    }

    const hasSiteName = typeof assignment.site_name === 'string' && assignment.site_name.trim().length > 0;
    const hasGroupementName =
      typeof assignment.groupement_name === 'string' && assignment.groupement_name.trim().length > 0;

    if (hasSiteName && hasGroupementName) {
      return assignment;
    }

    try {
      if (assignment.id && assignment.id > 0) {
        const detailed = await usersiteApi.getUserSiteById(assignment.id);
        return { ...assignment, ...detailed };
      }

      if (assignment.idSite && assignment.idSite > 0) {
        const matches = await usersiteApi.searchUserSites({
          idSite: assignment.idSite,
          onlyActive: true,
        });
        const matched =
          matches.find((item) => item.id === assignment.id) ||
          matches.find((item) => item.idGroupement === assignment.idGroupement) ||
          matches[0];
        if (matched) {
          return { ...assignment, ...matched };
        }
      }
    } catch (err) {
      console.error('Failed to resolve user site details', err);
    }

    return assignment;
  }, []);

  useEffect(() => {
    const loadUserSiteAssignments = async () => {
      if (!currentUser) {
        setUserSiteAssignments([]);
        return;
      }

      const applyResolvedAssignment = async (input: UserSite | null) => {
        const resolved = await resolveUserSiteInfo(input);
        setUserSiteAssignments(resolved ? [resolved] : []);
      };

      if (!userSiteIdFromProfile) {
        await applyResolvedAssignment(fallbackUserSiteAssignment);
        return;
      }

      try {
        const assignment = await usersiteApi.getUserSiteById(userSiteIdFromProfile);
        if (assignment) {
          await applyResolvedAssignment(assignment);
          return;
        }
      } catch (err) {
        console.error('Failed to load user site assignment', err);
      }

      await applyResolvedAssignment(fallbackUserSiteAssignment);
    };

    void loadUserSiteAssignments();
  }, [currentUser, fallbackUserSiteAssignment, resolveUserSiteInfo, userSiteIdFromProfile]);

  const allMarquesRef = useRef<Marque[]>([]);
  const allModelesRef = useRef<Modele[]>([]);
  const allVersionsRef = useRef<Version[]>([]);
  const modeleCache = useRef<Record<number, { items: Modele[]; total: number }>>({});
  const versionCache = useRef<Record<number, { items: Version[]; total: number }>>({});
  const objectifsCache = useRef<Record<string, ObjectifView[]>>({});

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
    targetType: 'marque',
    groupementId: 0,
    siteId: 0,
    periodeId: 0,
    typeVenteId: 0,
    typeObjectifId: 0,
    marqueId: 0,
    modeleId: 0,
    versionId: 0,
    volume: '',
    salePrice: '0',
    chiffreAffaire: '0',
    tmDirect: '',
    margeInterGroupe: '',
  });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewObjectif, setViewObjectif] = useState<ObjectifView | null>(null);

  const applySiteScopedMarques = useCallback(
    (siteId: number, groupementName?: string | null) => {
      const normalizedGroupement = groupementName?.trim().toLowerCase() ?? '';
      const shouldFilterByFiliale = normalizedGroupement === 'filiale';

      if (siteId > 0 && shouldFilterByFiliale) {
        const filteredMarques = allMarquesRef.current.filter(
          (marque) => marque.idFiliale === siteId
        );

        startTransition(() => {
          setMarques(filteredMarques);
          setMarquesTotal(filteredMarques.length);
        });

        setFormData((prev) => {
          const isCurrentMarqueValid = filteredMarques.some((marque) => marque.id === prev.marqueId);
          if (isCurrentMarqueValid) {
            return prev;
          }
          if (prev.marqueId === 0 && prev.modeleId === 0 && prev.versionId === 0) {
            return prev;
          }
          return {
            ...prev,
            marqueId: 0,
            modeleId: 0,
            versionId: 0,
            volume: '',
            salePrice: '0',
            chiffreAffaire: '0',
            tmDirect: '',
            margeInterGroupe: '',
          };
        });
        return;
      }

      startTransition(() => {
        setMarques(allMarquesRef.current);
        setMarquesTotal(allMarquesRef.current.length);
      });
    },
    []
  );

  const loadAllDropdownData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        periodesRes,
        typeVentesRes,
        typeObjectifsRes,
        marquesRes,
        modelesRes,
        versionsRes,
      ] = await Promise.all([
        periodeApi.listActivePeriodes({ pageSize: 1000 }),
        typeventeApi.listActiveTypeVentes(),
        typeobjectifApi.listActiveTypeObjectifs(),
        marqueApi.list({ onlyActive: true, pageSize: 1000 }),
        modeleApi.list({ onlyActive: true, pageSize: 1000 }),
        versionApi.list({ onlyActive: true, pageSize: 1000 }),
      ]);

      setPeriodes(extractArray<Periode>(periodesRes.data));
      setTypeVentes(extractArray<TypeVente>(typeVentesRes.data));
      setTypeObjectifs(extractArray<TypeObjectif>(typeObjectifsRes.data));

      const marqueList = extractArray<Marque>(marquesRes.data);
      setMarques(marqueList);
      allMarquesRef.current = marqueList;
      const totalMarques = marquesRes.pagination?.totalRecords ?? marqueList.length;
      setMarquesTotal(totalMarques);

      const allModeles = extractArray<Modele>(modelesRes.data);
      allModelesRef.current = allModeles;
      const totalModeles = modelesRes.pagination?.totalRecords ?? allModeles.length;
      setModelesTotal(totalModeles);

      const allVersions = extractArray<Version>(versionsRes.data);
      allVersionsRef.current = allVersions;
      const totalVersions = versionsRes.pagination?.totalRecords ?? allVersions.length;
      setVersionsTotal(totalVersions);

    } catch (err: any) {
      console.error('Failed to load dropdown data', err);
      setError(err.response?.data?.error || 'Failed to load data');
      setMarquesTotal(0);
      setModelesTotal(0);
      setVersionsTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadModelesByMarque = useCallback(async (marqueId: number) => {
    try {
      const cached = modeleCache.current[marqueId];
      if (cached) {
        startTransition(() => {
          setModeles(cached.items);
          setModelesTotal(cached.total);
        });
        return;
      }

      startTransition(() => {
        setModeles([]);
      });

      const response = await modeleApi.listByMarque(marqueId, {
        onlyActive: true,
        pageSize: 1000,
      });
      const items = response.data ?? [];
      const total = response.pagination?.totalRecords ?? items.length;

      modeleCache.current[marqueId] = { items, total };

      startTransition(() => {
        setModeles(items);
        setModelesTotal(total);
      });
    } catch (err: any) {
      console.error('Failed to load modeles', err);
      startTransition(() => {
        setModeles([]);
        setModelesTotal(0);
      });
    }
  }, []);

  const loadVersionsByModele = useCallback(async (modeleId: number) => {
    try {
      const cached = versionCache.current[modeleId];
      if (cached) {
        startTransition(() => {
          setVersions(cached.items);
          setVersionsTotal(cached.total);
        });
        return;
      }

      startTransition(() => {
        setVersions([]);
      });

      const response = await versionApi.listByModele({
        idModele: modeleId,
        onlyActive: true,
        pageSize: 1000,
      });
      const items = response.data ?? [];
      const total = response.pagination?.totalRecords ?? items.length;

      versionCache.current[modeleId] = { items, total };

      startTransition(() => {
        setVersions(items);
        setVersionsTotal(total);
      });
    } catch (err: any) {
      console.error('Failed to load versions', err);
      startTransition(() => {
        setVersions([]);
        setVersionsTotal(0);
      });
    }
  }, []);

  const loadObjectifs = useCallback(
    async (options?: { force?: boolean }) => {
      const { force = false } = options || {};
      if (force) {
        objectifsCache.current = {};
      }

      const activeSiteIds = userSiteAssignments
        .map((assignment) => Number(assignment.idSite) || 0)
        .filter((id) => Number.isFinite(id) && id > 0);
      const distinctSiteIds = Array.from(new Set(activeSiteIds)).sort((a, b) => a - b);

      const cacheKeyParts = [
        selectedPeriode ? `periode:${selectedPeriode}` : 'periode:all',
        isAdminFonctionnel ? 'scope:all' : `sites:${distinctSiteIds.join(',') || 'none'}`,
      ];
      const cacheKey = cacheKeyParts.join('|');

      const cached = objectifsCache.current[cacheKey];
      const shouldShowLoader = !cached || force;

      if (cached && !force) {
        startTransition(() => {
          setObjectifs(cached);
        });
        return;
      }

      if (!isAdminFonctionnel && distinctSiteIds.length === 0) {
        objectifsCache.current[cacheKey] = [];
        if (shouldShowLoader) {
          setLoading(false);
        }
        startTransition(() => {
          setObjectifs([]);
        });
        return;
      }

      try {
        if (shouldShowLoader) {
          setLoading(true);
          setError(null);
        }

        const baseParams: ListObjectifsParams = {};
        if (selectedPeriode) {
          baseParams.periodeId = selectedPeriode;
        }

        let objectifsData: ObjectifView[] = [];

        if (isAdminFonctionnel) {
          const response = await objectifApi.listObjectifsView(
            Object.keys(baseParams).length > 0 ? baseParams : undefined
          );
          objectifsData = extractArray<ObjectifView>(response.data);
        } else {
          const responses = await Promise.all(
            distinctSiteIds.map((siteId) =>
              objectifApi.listObjectifsView({
                ...baseParams,
                siteId,
              })
            )
          );

          const mergedObjectifs = new Map<number, ObjectifView>();
          for (const response of responses) {
            const items = extractArray<ObjectifView>(response.data);
            for (const item of items) {
              mergedObjectifs.set(item.id, item);
            }
          }
          objectifsData = Array.from(mergedObjectifs.values());
        }

        objectifsCache.current[cacheKey] = objectifsData;

        startTransition(() => {
          setObjectifs(objectifsData);
        });
      } catch (err: any) {
        console.error('Failed to load objectifs', err);
        setError(err.response?.data?.error || 'Failed to load objectifs');
      } finally {
        if (shouldShowLoader) {
          setLoading(false);
        }
      }
    },
    [selectedPeriode, isAdminFonctionnel, userSiteAssignments]
  );

  useEffect(() => {
    loadAllDropdownData();
  }, [loadAllDropdownData]);

  useEffect(() => {
    loadObjectifs();
  }, [selectedPeriode, loadObjectifs]);

  useEffect(() => {
    if (allMarquesRef.current.length === 0) {
      return;
    }
    const contextSiteId = dialogSiteInfo?.siteId ?? primaryAssignment?.idSite ?? 0;
    const contextGroupement =
      dialogSiteInfo?.groupementName ?? primaryAssignment?.groupement_name ?? null;
    applySiteScopedMarques(contextSiteId, contextGroupement);
  }, [dialogSiteInfo, primaryAssignment, applySiteScopedMarques]);



  useEffect(() => {
    if (!formData.marqueId) {
      setModeles([]);
      setModelesTotal(allModelesRef.current.length);
      return;
    }

    if (formData.targetType === 'marque') {
      setModeles([]);
      setModelesTotal(allModelesRef.current.length);
      return;
    }

    loadModelesByMarque(formData.marqueId);
  }, [formData.marqueId, formData.targetType, loadModelesByMarque]);

  useEffect(() => {
    if (!formData.modeleId || formData.targetType !== 'version') {
      setVersions([]);
      setVersionsTotal(allVersionsRef.current.length);
      return;
    }

    loadVersionsByModele(formData.modeleId);
  }, [formData.modeleId, formData.targetType, loadVersionsByModele]);

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

  const handleViewObjectif = useCallback((objectif: ObjectifView) => {
    setViewObjectif(objectif);
    setViewDialogOpen(true);
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setViewDialogOpen(false);
    setViewObjectif(null);
  }, []);

  // ✅ UPDATED: handleOpenDialog with auto-fill logic
  const handleOpenDialog = useCallback(
    (objectif?: ObjectifView) => {
      if (!canManageObjectifs) return;

      if (objectif) {
        // EDIT MODE
        const toNumber = (value: unknown): number => {
          if (typeof value === 'number' && Number.isFinite(value)) return value;
          if (typeof value === 'string') {
            const parsed = Number.parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
          }
          return 0;
        };

        const inferredTargetType =
          objectif.versionID && objectif.versionID > 0
            ? 'version'
            : objectif.modeleID && objectif.modeleID > 0
            ? 'modele'
            : 'marque';

        setEditingObjectif(objectif);

        const salePriceValue = toNumber(objectif.price);
        const tmDirectValue = toNumber(
          objectif.TMDirect ?? objectif.tmDirect ?? objectif.TauxMarge
        );
        const tmInterValue = toNumber(
          objectif.MargeInterGroupe ?? objectif.margeInterGroupe
        );
        const chiffreAffaireValue = toNumber(objectif.ChiffreDaffaire);

        setFormData({
          targetType: inferredTargetType,
          groupementId: objectif.groupementID,
          siteId: objectif.SiteID,
          periodeId: objectif.periodeID,
          typeVenteId: objectif.typeVenteID,
          typeObjectifId: objectif.typeObjectifId,
          marqueId: objectif.marqueID || 0,
          modeleId: objectif.modeleID || 0,
          versionId: objectif.versionID || 0,
          volume: objectif.volume.toString(),
          salePrice: salePriceValue > 0 ? salePriceValue.toFixed(2) : '0',
          chiffreAffaire:
            chiffreAffaireValue > 0 ? chiffreAffaireValue.toFixed(2) : '0',
          tmDirect: (tmDirectValue * 100).toFixed(2),
          margeInterGroupe: (tmInterValue * 100).toFixed(2),
        });

        setDialogSiteInfo({
          siteId: objectif.SiteID,
          siteName: objectif.SiteName ?? '',
          groupementName: objectif.groupementName ?? null,
        });

        applySiteScopedMarques(objectif.SiteID, objectif.groupementName ?? null);

        const objectifMarqueId = objectif.marqueID;
        if (typeof objectifMarqueId === 'number' && objectifMarqueId > 0) {
          const cachedModeles = modeleCache.current[objectifMarqueId];
          if (cachedModeles) {
            startTransition(() => {
              setModeles(cachedModeles.items);
              setModelesTotal(cachedModeles.total);
            });
          }
          if (!cachedModeles) {
            void loadModelesByMarque(objectifMarqueId);
          }
        }

        const objectifModeleId = objectif.modeleID;
        if (typeof objectifModeleId === 'number' && objectifModeleId > 0) {
          const cachedVersions = versionCache.current[objectifModeleId];
          if (cachedVersions) {
            startTransition(() => {
              setVersions(cachedVersions.items);
              setVersionsTotal(cachedVersions.total);
            });
          }
          if (!cachedVersions) {
            void loadVersionsByModele(objectifModeleId);
          }
        }

        setOpenDialog(true);
      } else {
        // ✅ CREATE MODE - Auto-fill from user assignment
        const defaultGroupementId = primaryAssignment?.idGroupement ?? 0;
        const defaultSiteId = primaryAssignment?.idSite ?? 0;

        setEditingObjectif(null);
        setFormData({
          targetType: 'marque',
          groupementId: defaultGroupementId,
          siteId: defaultSiteId,
          periodeId: selectedPeriode ?? 0,
          typeVenteId: 0,
          typeObjectifId: 0,
          marqueId: 0,
          modeleId: 0,
          versionId: 0,
          volume: '',
          salePrice: '0',
          chiffreAffaire: '0',
          tmDirect: '',
          margeInterGroupe: '',
        });

        if (primaryAssignment) {
          setDialogSiteInfo({
            siteId: defaultSiteId,
            siteName: primaryAssignment.site_name ?? '',
            groupementName: primaryAssignment.groupement_name ?? null,
          });
        } else {
          setDialogSiteInfo(null);
        }

        applySiteScopedMarques(defaultSiteId, primaryAssignment?.groupement_name ?? null);

        startTransition(() => {
          setModeles([]);
          setVersions([]);
        });

        setModelesTotal(allModelesRef.current.length);
        setVersionsTotal(allVersionsRef.current.length);

        setOpenDialog(true);
      }
    },
    [
      canManageObjectifs,
      selectedPeriode,
      loadModelesByMarque,
      loadVersionsByModele,
      applySiteScopedMarques,
      primaryAssignment,
    ]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingObjectif(null);
    setError(null);
    setDialogSiteInfo(null);
  }, []);

  const handleSave = async () => {
    if (!canManageObjectifs) return;

    try {
      if (formData.targetType === 'marque' && !formData.marqueId) {
        setError('Veuillez sélectionner une marque.');
        return;
      }
      if (formData.targetType === 'modele') {
        if (!formData.marqueId) {
          setError('Veuillez sélectionner une marque afin de choisir un modèle.');
          return;
        }
        if (!formData.modeleId) {
          setError('Veuillez sélectionner un modèle.');
          return;
        }
      }
      if (formData.targetType === 'version') {
        if (!formData.marqueId || !formData.modeleId || !formData.versionId) {
          setError('Veuillez sélectionner une marque, un modèle et une version.');
          return;
        }
      }

      setSaving(true);
      setError(null);

      const marqueIdPayload = formData.marqueId ? formData.marqueId : null;
      const modeleIdPayload =
        formData.targetType === 'modele' || formData.targetType === 'version'
          ? formData.modeleId || null
          : null;
      const versionIdPayload =
        formData.targetType === 'version' ? formData.versionId || null : null;

      const apiData = {
        userId: currentUser?.id || 0,
        groupementId: formData.groupementId,
        siteId: formData.siteId,
        periodeId: formData.periodeId,
        typeVenteId: formData.typeVenteId,
        typeObjectifId: formData.typeObjectifId,
        marqueId: marqueIdPayload,
        modeleId: modeleIdPayload,
        versionId: versionIdPayload,
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
      console.error('Failed to save objectif', err);
      const apiError = err.response?.data;
      if (apiError?.details && typeof apiError.details === 'object') {
        const detailMessages = Object.values(apiError.details)
          .filter((message) => message && typeof message === 'string')
          .join('; ');
        setError(detailMessages || apiError.error || 'Failed to save objectif');
      } else {
        setError(apiError?.error || err.message || 'Failed to save objectif');
      }
    } finally {
      setSaving(false);
    }
  };

  const normalizeRatio = (value?: number | null): number => {
    if (value === null || value === undefined) {
      return 0;
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    return Math.abs(numeric) > 1 ? numeric / 100 : numeric;
  };

  const getUnitMetrics = useCallback(
    (nextState: ObjectifFormState): { unitPrice: number; unitTmDirect: number; unitTmInter: number } => {
      const findById = <T extends { id: number }>(collections: T[][], id: number): T | undefined => {
        for (const collection of collections) {
          const match = collection.find((item) => item.id === id);
          if (match) return match;
        }
        return undefined;
      };

      if (nextState.versionId) {
        const versionSources: Version[] = [
          versions,
          ...Object.values(versionCache.current).map((entry) => entry.items),
          allVersionsRef.current,
        ].flat();
        const selectedVersion = findById(
          [versionSources],
          nextState.versionId
        );
        if (selectedVersion) {
          return {
            unitPrice: selectedVersion.prixDeVente ?? 0,
            unitTmDirect: normalizeRatio(selectedVersion.tmDirect),
            unitTmInter: normalizeRatio(selectedVersion.tmInterGroupe),
          };
        }
      }

      if (nextState.modeleId) {
        const modeleSources: Modele[] = [
          modeles,
          ...Object.values(modeleCache.current).map((entry) => entry.items),
          allModelesRef.current,
        ].flat();
        const selectedModele = findById([modeleSources], nextState.modeleId);
        if (selectedModele) {
          return {
            unitPrice: selectedModele.averageSalePrice ?? 0,
            unitTmDirect: normalizeRatio(selectedModele.tmDirect),
            unitTmInter: normalizeRatio(selectedModele.tmInterGroupe),
          };
        }
      }

      if (nextState.marqueId) {
        const selectedMarque =
          marques.find((marque) => marque.id === nextState.marqueId) ??
          allMarquesRef.current.find((marque) => marque.id === nextState.marqueId);
        if (selectedMarque) {
          return {
            unitPrice: selectedMarque.averageSalePrice ?? 0,
            unitTmDirect: normalizeRatio(selectedMarque.tmDirect),
            unitTmInter: normalizeRatio(selectedMarque.tmInterGroupe),
          };
        }
      }

      return { unitPrice: 0, unitTmDirect: 0, unitTmInter: 0 };
    },
    [marques, modeles, versions]
  );

  const handleFormChange = useCallback(
    <K extends keyof ObjectifFormState>(key: K, rawValue: ObjectifFormState[K]) => {
      setFormData((prev) => {
        const nextState: ObjectifFormState = { ...prev };

        if (key === 'targetType') {
          const targetValue = (rawValue as ObjectifFormState['targetType']) ?? 'marque';
          nextState.targetType = targetValue;
          nextState.marqueId = 0;
          nextState.modeleId = 0;
          nextState.versionId = 0;
          nextState.volume = '';
          nextState.chiffreAffaire = '0';
        } else if (key === 'marqueId') {
          const marqueId = Number(rawValue) || 0;
          nextState.marqueId = marqueId;
          if (nextState.targetType !== 'marque') {
            nextState.modeleId = 0;
            nextState.versionId = 0;
          }
          nextState.volume = '';
          nextState.chiffreAffaire = '0';
        } else if (key === 'modeleId') {
          const modeleId = Number(rawValue) || 0;
          nextState.modeleId = modeleId;
          if (nextState.targetType === 'version') {
            nextState.versionId = 0;
          }
          nextState.volume = '';
          nextState.chiffreAffaire = '0';
        } else if (key === 'versionId') {
          const versionId = Number(rawValue) || 0;
          nextState.versionId = versionId;
          nextState.volume = '';
          nextState.chiffreAffaire = '0';
        } else if (key === 'volume') {
          const numericVolume = Number(rawValue);
          nextState.volume =
            Number.isFinite(numericVolume) && numericVolume >= 0 ? (rawValue as string) : '0';
        } else {
          nextState[key] = rawValue;
        }

        const { unitPrice, unitTmDirect, unitTmInter } = getUnitMetrics(nextState);

        const parsedVolume = Number(nextState.volume) || 0;

        const computedUnitPrice = unitPrice > 0 ? unitPrice : 0;
        nextState.salePrice = computedUnitPrice > 0 ? computedUnitPrice.toFixed(2) : '0';

        const computedChiffreAffaire =
          computedUnitPrice > 0 && parsedVolume > 0 ? computedUnitPrice * parsedVolume : 0;
        nextState.chiffreAffaire = computedChiffreAffaire > 0 ? computedChiffreAffaire.toFixed(2) : '0';

        const computedTmDirect = unitTmDirect > 0 ? unitTmDirect : 0;
        nextState.tmDirect = computedTmDirect > 0 ? (computedTmDirect * 100).toFixed(2) : '0';

        const computedTmInter = unitTmInter > 0 ? unitTmInter : 0;
        nextState.margeInterGroupe = computedTmInter > 0 ? (computedTmInter * 100).toFixed(2) : '0';

        return nextState;
      });
    },
    [getUnitMetrics]
  );

  const columns = useObjectifColumns({
    hasUpdate: canUpdateObjectif,
    onView: handleViewObjectif,
    onEdit: handleOpenDialog,
  });

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))'
            : 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(226,232,240,0.7))',
        borderRadius: 4,
        minHeight: '100%',
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      <Stack spacing={3}>
        <ObjectifFilters
          periodes={periodes}
          selectedPeriode={selectedPeriode}
          hasCreate={canCreateObjectif}
          error={error}
          onClearError={() => setError(null)}
          onChangePeriode={setSelectedPeriode}
          onCreate={() => handleOpenDialog()}
        />

        <ObjectifTable
          rows={paginatedObjectifs}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          error={error}
          onClearError={() => setError(null)}
        />

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
          marquesCount={marquesTotal}
          modelesCount={modelesTotal}
          versionsCount={versionsTotal}
          siteInfo={dialogSiteInfo}
          onClose={handleCloseDialog}
          onSave={handleSave}
          onChangeField={handleFormChange}
          onClearError={() => setError(null)}
        />

        <ObjectifDetailsDialog
          open={viewDialogOpen}
          objectif={viewObjectif}
          onClose={handleCloseViewDialog}
        />
      </Stack>
    </Box>
  );
};
