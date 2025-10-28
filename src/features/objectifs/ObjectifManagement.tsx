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
import { objectifApi, ObjectifView } from "../../api/endpoints/objectif.api";
import { periodeApi, Periode } from "../../api/endpoints/periode.api";
import { typeventeApi, TypeVente } from "../../api/endpoints/typevente.api";
import {
  typeobjectifApi,
  TypeObjectif,
} from "../../api/endpoints/typeobjectif.api";
import { marqueApi, Marque } from "../../api/endpoints/marque.api";
import { modeleApi, Modele } from "../../api/endpoints/modele.api";
import { versionApi, Version } from "../../api/endpoints/version.api";
import { groupementApi } from "../../api/endpoints/groupement.api";
import { filialeApi, Filiale } from "../../api/endpoints/filiale.api";
import { succursaleApi, Succursale } from "../../api/endpoints/succursale.api";
import { useAuthStore } from "../../store/authStore";
import type { Groupement } from "../../types/usersite.types";
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
  const hasCreatePermission = useAuthStore((state) =>
    state.hasPermission("OBJECTIF_CREATE")
  );
  const hasUpdatePermission = useAuthStore((state) =>
    state.hasPermission("OBJECTIF_UPDATE")
  );

  const [objectifs, setObjectifs] = useState<ObjectifView[]>([]);
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [typeVentes, setTypeVentes] = useState<TypeVente[]>([]);
  const [typeObjectifs, setTypeObjectifs] = useState<TypeObjectif[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [groupements, setGroupements] = useState<Groupement[]>([]);
  const [marquesTotal, setMarquesTotal] = useState(0);
  const [modelesTotal, setModelesTotal] = useState(0);
  const [versionsTotal, setVersionsTotal] = useState(0);
  const [sites, setSites] = useState<Array<Filiale | Succursale>>([]);

  const allMarquesRef = useRef<Marque[]>([]);
  const allModelesRef = useRef<Modele[]>([]);
  const allVersionsRef = useRef<Version[]>([]);
  const siteCache = useRef<{
    filiale?: Array<Filiale>;
    succursale?: Array<Succursale>;
  }>({});
  const modeleCache = useRef<
    Record<number, { items: Modele[]; total: number }>
  >({});
  const versionCache = useRef<
    Record<number, { items: Version[]; total: number }>
  >({});
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
  const [editingObjectif, setEditingObjectif] = useState<ObjectifView | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ObjectifFormState>({
    targetType: "marque",
    groupementId: 0,
    siteId: 0,
    periodeId: 0,
    typeVenteId: 0,
    typeObjectifId: 0,
    marqueId: 0,
    modeleId: 0,
    versionId: 0,
    volume: "",
    salePrice: "0",
    chiffreAffaire: "0",
    tmDirect: "",
    margeInterGroupe: "",
  });

  // View Details Dialog State (NEW)
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewObjectif, setViewObjectif] = useState<ObjectifView | null>(null);

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
        groupementsRes,
      ] = await Promise.all([
        periodeApi.listActivePeriodes({ pageSize: 1000 }),
        typeventeApi.listActiveTypeVentes(),
        typeobjectifApi.listActiveTypeObjectifs(),
        marqueApi.list({ onlyActive: true, pageSize: 1000 }),
        modeleApi.list({ onlyActive: true, pageSize: 1000 }),
        versionApi.list({ onlyActive: true, pageSize: 1000 }),
        groupementApi.listGroupements(),
      ]);

      setPeriodes(extractArray<Periode>(periodesRes.data));
      setTypeVentes(extractArray<TypeVente>(typeVentesRes.data));
      setTypeObjectifs(extractArray<TypeObjectif>(typeObjectifsRes.data));

      const marqueList = extractArray<Marque>(marquesRes.data);
      setMarques(marqueList);
      allMarquesRef.current = marqueList;
      const totalMarques =
        marquesRes.pagination?.totalRecords ?? marqueList.length;
      setMarquesTotal(totalMarques);

      const allModeles = extractArray<Modele>(modelesRes.data);
      allModelesRef.current = allModeles;
      const totalModeles =
        modelesRes.pagination?.totalRecords ?? allModeles.length;
      setModelesTotal(totalModeles);

      const allVersions = extractArray<Version>(versionsRes.data);
      allVersionsRef.current = allVersions;
      const totalVersions =
        versionsRes.pagination?.totalRecords ?? allVersions.length;
      setVersionsTotal(totalVersions);

      setGroupements(extractArray<Groupement>(groupementsRes));
    } catch (err: any) {
      console.error("Failed to load dropdown data:", err);
      setError(err.response?.data?.error || "Failed to load data");
      setMarquesTotal(0);
      setModelesTotal(0);
      setVersionsTotal(0);
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
          normalizedName === "filiale"
            ? "filiale"
            : normalizedName === "succursale"
            ? "succursale"
            : undefined;

        if (cacheKey && siteCache.current[cacheKey]) {
          const cachedSites = siteCache.current[cacheKey] ?? [];
          startTransition(() => setSites(cachedSites));
          return;
        }

        let siteList: Array<Filiale | Succursale> = [];
        if (normalizedName === "filiale") {
          const response = await filialeApi.listFiliales({ pageSize: 1000 });
          siteList = extractArray<Filiale>(response.data);
        } else if (normalizedName === "succursale") {
          const response = await succursaleApi.listSuccursales({
            pageSize: 1000,
          });
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
        console.error("Failed to load sites:", err);
      }
    },
    [groupements]
  );

  const loadModelesByMarque = useCallback(async (marqueId: number) => {
    try {
      const cached = modeleCache.current[marqueId];
      if (cached) {
        startTransition(() => setModeles(cached.items));
        setModelesTotal(cached.total);
        return;
      }

      startTransition(() => setModeles([]));
      const response = await modeleApi.listByMarque(marqueId, {
        onlyActive: true,
        pageSize: 1000,
      });

      const items = response.data ?? [];
      const total = response.pagination?.totalRecords ?? items.length;

      modeleCache.current[marqueId] = { items, total };
      startTransition(() => setModeles(items));
      setModelesTotal(total);
    } catch (err: any) {
      console.error("Failed to load modeles:", err);
      startTransition(() => setModeles([]));
      setModelesTotal(0);
    }
  }, []);

  const loadVersionsByModele = useCallback(async (modeleId: number) => {
    try {
      const cached = versionCache.current[modeleId];
      if (cached) {
        startTransition(() => setVersions(cached.items));
        setVersionsTotal(cached.total);
        return;
      }

      startTransition(() => setVersions([]));
      const response = await versionApi.listByModele({
        idModele: modeleId,
        onlyActive: true,
        pageSize: 1000,
      });

      const items = response.data ?? [];
      const total = response.pagination?.totalRecords ?? items.length;

      versionCache.current[modeleId] = { items, total };
      startTransition(() => setVersions(items));
      setVersionsTotal(total);
    } catch (err: any) {
      console.error("Failed to load versions:", err);
      startTransition(() => setVersions([]));
      setVersionsTotal(0);
    }
  }, []);

  const loadObjectifs = useCallback(
    async (options: { force?: boolean } = {}) => {
      const { force = false } = options;

      if (force) {
        objectifsCache.current = {};
      }

      const cacheKey = selectedPeriode ? selectedPeriode.toString() : "all";
      const cached = objectifsCache.current[cacheKey];
      const shouldShowLoader = !cached || force;

      if (cached && !force) {
        startTransition(() => setObjectifs(cached));
        return;
      }

      try {
        if (shouldShowLoader) {
          setLoading(true);
        }

        setError(null);
        const response = await objectifApi.listObjectifsView(
          selectedPeriode ? { periodeId: selectedPeriode } : undefined
        );

        const objectifsData = extractArray<ObjectifView>(response.data);
        objectifsCache.current[cacheKey] = objectifsData;
        startTransition(() => setObjectifs(objectifsData));
      } catch (err: any) {
        console.error("Failed to load objectifs:", err);
        setError(err.response?.data?.error || "Failed to load objectifs");
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
    loadObjectifs();
  }, [selectedPeriode, loadObjectifs]);

  useEffect(() => {
    if (formData.groupementId) {
      loadSitesByGroupement(formData.groupementId);
    }
  }, [formData.groupementId, loadSitesByGroupement]);

  useEffect(() => {
    const selectedGroupement = groupements.find(
      (groupement) => groupement.id === formData.groupementId
    );
    const normalizedGroupementName =
      selectedGroupement?.name?.trim().toLowerCase() ?? "";

    if (normalizedGroupementName === "filiale") {
      if (!formData.siteId) {
        startTransition(() => setMarques([]));
        setMarquesTotal(0);
        setFormData((prev) => {
          if (
            prev.marqueId === 0 &&
            prev.modeleId === 0 &&
            prev.versionId === 0
          ) {
            return prev;
          }

          return {
            ...prev,
            marqueId: 0,
            modeleId: 0,
            versionId: 0,
            volume: "",
            salePrice: "0",
            chiffreAffaire: "0",
            tmDirect: "",
            margeInterGroupe: "",
          };
        });
        return;
      }

      const filteredMarques = allMarquesRef.current.filter(
        (marque) => marque.idFiliale === formData.siteId
      );
      startTransition(() => setMarques(filteredMarques));
      setMarquesTotal(filteredMarques.length);

      setFormData((prev) => {
        const isCurrentMarqueValid = filteredMarques.some(
          (marque) => marque.id === prev.marqueId
        );
        if (isCurrentMarqueValid) {
          return prev;
        }

        if (
          prev.marqueId === 0 &&
          prev.modeleId === 0 &&
          prev.versionId === 0
        ) {
          return prev;
        }

        return {
          ...prev,
          marqueId: 0,
          modeleId: 0,
          versionId: 0,
          volume: "",
          salePrice: "0",
          chiffreAffaire: "0",
          tmDirect: "",
          margeInterGroupe: "",
        };
      });
      return;
    }

    startTransition(() => setMarques(allMarquesRef.current));
    setMarquesTotal(allMarquesRef.current.length);
  }, [formData.groupementId, formData.siteId, groupements]);

  useEffect(() => {
    if (!formData.marqueId) {
      setModeles([]);
      setModelesTotal(allModelesRef.current.length);
      return;
    }

    if (formData.targetType === "marque") {
      setModeles([]);
      setModelesTotal(allModelesRef.current.length);
      return;
    }

    loadModelesByMarque(formData.marqueId);
  }, [formData.marqueId, formData.targetType, loadModelesByMarque]);

  useEffect(() => {
    if (!formData.modeleId || formData.targetType !== "version") {
      setVersions([]);
      setVersionsTotal(allVersionsRef.current.length);
      return;
    }

    loadVersionsByModele(formData.modeleId);
  }, [formData.modeleId, formData.targetType, loadVersionsByModele]);

  useEffect(() => {
    setPagination((prev) => {
      const totalRecords = objectifs.length;
      const totalPages =
        totalRecords > 0 ? Math.ceil(totalRecords / prev.pageSize) : 1;
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
        const totalPages =
          totalRecords > 0 ? Math.ceil(totalRecords / nextPageSize) : 1;
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

  // Handle View Details (NEW)
  const handleViewObjectif = useCallback((objectif: ObjectifView) => {
    setViewObjectif(objectif);
    setViewDialogOpen(true);
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setViewDialogOpen(false);
    setViewObjectif(null);
  }, []);

  const handleOpenDialog = useCallback(
    (objectif?: ObjectifView) => {
      if (objectif) {
        const toNumber = (value: unknown): number => {
          if (typeof value === "number" && Number.isFinite(value)) {
            return value;
          }
          if (typeof value === "string") {
            const parsed = Number.parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
          }
          return 0;
        };

        const inferredTargetType =
          objectif.versionID && objectif.versionID > 0
            ? "version"
            : objectif.modeleID && objectif.modeleID > 0
            ? "modele"
            : "marque";

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
          salePrice: salePriceValue > 0 ? salePriceValue.toFixed(2) : "0",
          chiffreAffaire:
            chiffreAffaireValue > 0 ? chiffreAffaireValue.toFixed(2) : "0",
          tmDirect: (tmDirectValue * 100).toFixed(2),
          margeInterGroupe: (tmInterValue * 100).toFixed(2),
        });

        const normalizedGroupement = objectif.groupementName?.toLowerCase();
        const siteCacheKey =
          normalizedGroupement === "filiale"
            ? "filiale"
            : normalizedGroupement === "succursale"
            ? "succursale"
            : undefined;

        if (siteCacheKey && siteCache.current[siteCacheKey]) {
          startTransition(() =>
            setSites(siteCache.current[siteCacheKey] ?? [])
          );
        }

        const objectifMarqueId = objectif.marqueID;
        if (typeof objectifMarqueId === "number" && objectifMarqueId > 0) {
          const cachedModeles = modeleCache.current[objectifMarqueId];
          if (cachedModeles) {
            startTransition(() => setModeles(cachedModeles.items));
            setModelesTotal(cachedModeles.total);
          }

          if (!cachedModeles) {
            void loadModelesByMarque(objectifMarqueId);
          }
        }

        const objectifModeleId = objectif.modeleID;
        if (typeof objectifModeleId === "number" && objectifModeleId > 0) {
          const cachedVersions = versionCache.current[objectifModeleId];
          if (cachedVersions) {
            startTransition(() => setVersions(cachedVersions.items));
            setVersionsTotal(cachedVersions.total);
          }

          if (!cachedVersions) {
            void loadVersionsByModele(objectifModeleId);
          }
        }
      } else {
        setEditingObjectif(null);
        setFormData({
          targetType: "marque",
          groupementId: 0,
          siteId: 0,
          periodeId: selectedPeriode || 0,
          typeVenteId: 0,
          typeObjectifId: 0,
          marqueId: 0,
          modeleId: 0,
          versionId: 0,
          volume: "",
          salePrice: "0",
          chiffreAffaire: "0",
          tmDirect: "",
          margeInterGroupe: "",
        });

        startTransition(() => {
          setSites([]);
          setModeles([]);
          setVersions([]);
        });

        setModelesTotal(allModelesRef.current.length);
        setVersionsTotal(allVersionsRef.current.length);
      }

      setOpenDialog(true);
    },
    [selectedPeriode, loadModelesByMarque, loadVersionsByModele]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingObjectif(null);
    setError(null);
  }, []);

  const handleSave = async () => {
    try {
      if (formData.targetType === "marque" && !formData.marqueId) {
        setError("Veuillez selectionner une marque.");
        return;
      }

      if (formData.targetType === "modele") {
        if (!formData.marqueId) {
          setError(
            "Veuillez selectionner une marque afin de choisir un modele."
          );
          return;
        }
        if (!formData.modeleId) {
          setError("Veuillez selectionner un modele.");
          return;
        }
      }

      if (formData.targetType === "version") {
        if (!formData.marqueId || !formData.modeleId || !formData.versionId) {
          setError(
            "Veuillez selectionner une marque, un modele et une version."
          );
          return;
        }
      }

      setSaving(true);
      setError(null);

      const marqueIdPayload = formData.marqueId ? formData.marqueId : null;
      const modeleIdPayload =
        formData.targetType === "modele" || formData.targetType === "version"
          ? formData.modeleId || null
          : null;
      const versionIdPayload =
        formData.targetType === "version" ? formData.versionId || null : null;

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
      console.error("Failed to save objectif:", err);
      const apiError = err.response?.data;

      if (apiError?.details && typeof apiError.details === "object") {
        const detailMessages = Object.values(apiError.details)
          .filter((message): message is string => typeof message === "string")
          .join(" • ");
        setError(detailMessages || apiError.error || "Failed to save objectif");
      } else {
        setError(apiError?.error || err.message || "Failed to save objectif");
      }
    } finally {
      setSaving(false);
    }
  };

  const getUnitMetrics = useCallback(
    (
      nextState: ObjectifFormState
    ): {
      unitPrice: number;
      unitTmDirect: number;
      unitTmInter: number;
    } => {
      const findById = <T extends { id: number }>(
        collections: T[][],
        id: number
      ): T | undefined => {
        for (const collection of collections) {
          const match = collection.find((item) => item.id === id);
          if (match) return match;
        }
        return undefined;
      };

      if (nextState.versionId) {
        const versionSources: Version[][] = [
          versions,
          ...Object.values(versionCache.current).map((entry) => entry.items),
          allVersionsRef.current,
        ];

        const selectedVersion = findById(versionSources, nextState.versionId);
        if (selectedVersion) {
          return {
            unitPrice: selectedVersion.prixDeVente ?? 0,
            unitTmDirect: selectedVersion.tmDirect ?? 0,
            unitTmInter: selectedVersion.tmInterGroupe ?? 0,
          };
        }
      }

      if (nextState.modeleId) {
        const modeleSources: Modele[][] = [
          modeles,
          ...Object.values(modeleCache.current).map((entry) => entry.items),
          allModelesRef.current,
        ];

        const selectedModele = findById(modeleSources, nextState.modeleId);
        if (selectedModele) {
          return {
            unitPrice: selectedModele.averageSalePrice ?? 0,
            unitTmDirect: selectedModele.tmDirect ?? 0,
            unitTmInter: selectedModele.tmInterGroupe ?? 0,
          };
        }
      }

      if (nextState.marqueId) {
        const selectedMarque =
          marques.find((marque) => marque.id === nextState.marqueId) ??
          allMarquesRef.current.find(
            (marque) => marque.id === nextState.marqueId
          );

        if (selectedMarque) {
          return {
            unitPrice: selectedMarque.averageSalePrice ?? 0,
            unitTmDirect: selectedMarque.tmDirect ?? 0,
            unitTmInter: selectedMarque.tmInterGroupe ?? 0,
          };
        }
      }

      return {
        unitPrice: 0,
        unitTmDirect: 0,
        unitTmInter: 0,
      };
    },
    [marques, modeles, versions]
  );

  const handleFormChange = useCallback(
    <K extends keyof ObjectifFormState>(
      key: K,
      rawValue: ObjectifFormState[K]
    ) => {
      setFormData((prev) => {
        const nextState: ObjectifFormState = { ...prev };

        if (key === "targetType") {
          const targetValue =
            (rawValue as ObjectifFormState["targetType"]) ?? "marque";
          nextState.targetType = targetValue;
          nextState.marqueId = 0;
          nextState.modeleId = 0;
          nextState.versionId = 0;
          nextState.volume = "";
          nextState.chiffreAffaire = "0";
        } else if (key === "marqueId") {
          const marqueId = Number(rawValue) || 0;
          nextState.marqueId = marqueId;

          if (nextState.targetType !== "marque") {
            nextState.modeleId = 0;
            nextState.versionId = 0;
          }

          nextState.volume = "0";
          nextState.chiffreAffaire = "0";
        } else if (key === "modeleId") {
          const modeleId = Number(rawValue) || 0;
          nextState.modeleId = modeleId;

          if (nextState.targetType === "version") {
            nextState.versionId = 0;
          }

          nextState.volume = "0";
          nextState.chiffreAffaire = "0";
        } else if (key === "versionId") {
          const versionId = Number(rawValue) || 0;
          nextState.versionId = versionId;
          nextState.volume = "0";
          nextState.chiffreAffaire = "0";
        } else if (key === "volume") {
          const numericVolume = Number(rawValue);
          nextState.volume =
            Number.isFinite(numericVolume) && numericVolume >= 0
              ? (rawValue as string)
              : "0";
        } else {
          nextState[key] = rawValue;
        }

        const { unitPrice, unitTmDirect, unitTmInter } =
          getUnitMetrics(nextState);
        const parsedVolume = Number(nextState.volume) || 0;

        const computedUnitPrice = unitPrice > 0 ? unitPrice : 0;
        nextState.salePrice =
          computedUnitPrice > 0 ? computedUnitPrice.toFixed(2) : "0";

        const computedChiffreAffaire =
          computedUnitPrice > 0 && parsedVolume > 0
            ? computedUnitPrice * parsedVolume
            : 0;
        nextState.chiffreAffaire =
          computedChiffreAffaire > 0 ? computedChiffreAffaire.toFixed(2) : "0";

        const computedTmDirect = unitTmDirect > 0 ? unitTmDirect : 0;
        nextState.tmDirect =
          computedTmDirect > 0 ? (computedTmDirect * 100).toFixed(2) : "0";

        const computedTmInter = unitTmInter > 0 ? unitTmInter : 0;
        nextState.margeInterGroupe =
          computedTmInter > 0 ? (computedTmInter * 100).toFixed(2) : "0";

        return nextState;
      });
    },
    [getUnitMetrics]
  );

  const columns = useObjectifColumns({
    hasUpdate: hasUpdatePermission,
    onView: handleViewObjectif, // NEW
    onEdit: handleOpenDialog,
  });

  return (
    <Box
      sx={{
        p: 3,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))"
            : "linear-gradient(135deg, rgba(248,250,252,0.9), rgba(226,232,240,0.7))",
        borderRadius: 4,
        minHeight: "100%",
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
          groupements={groupements}
          sites={sites}
          onClose={handleCloseDialog}
          onSave={handleSave}
          onChangeField={handleFormChange}
          onClearError={() => setError(null)}
        />

        {/* View Details Dialog */}
        <ObjectifDetailsDialog
          open={viewDialogOpen}
          objectif={viewObjectif}
          onClose={handleCloseViewDialog}
        />
      </Stack>
    </Box>
  );
};
