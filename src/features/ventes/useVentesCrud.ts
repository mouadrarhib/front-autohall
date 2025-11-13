import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { ventesApi, Vente } from "../../api/endpoints/ventes.api";
import { typeventeApi, TypeVente } from "../../api/endpoints/typevente.api";
import { marqueApi, Marque } from "../../api/endpoints/marque.api";
import { modeleApi, Modele } from "../../api/endpoints/modele.api";
import { versionApi, Version } from "../../api/endpoints/version.api";
import { filialeApi } from "../../api/endpoints/filiale.api";
import { succursaleApi } from "../../api/endpoints/succursale.api";
import { useAuthStore } from "../../store/authStore";
import {
  buildVentePayload,
  defaultPaginationState,
  defaultVenteFormState,
  extractPaginationState,
  extractVentes,
  normalizeVente,
  PaginationState,
  VenteFormState,
  VenteTargetType,
  VenteSiteContext,
  venteToFormState,
} from "./VenteType";

const toNumberOrNull = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickFirstNumber = (...values: any[]): number | null => {
  for (const value of values) {
    const parsed = toNumberOrNull(value);
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
};

interface UseVentesCrudResult {
  ventes: Vente[];
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  typeVentes: TypeVente[];
  marques: Marque[];
  modeles: Modele[];
  versions: Version[];
  siteContext: VenteSiteContext | null;
  openDialog: boolean;
  editingVente: Vente | null;
  saving: boolean;
  formState: VenteFormState;
  handlePaginationChange: (model: GridPaginationModel) => void;
  handleAddVente: () => void;
  handleEditVente: (vente: Vente) => void;
  handleCloseDialog: () => void;
  handleSaveVente: () => Promise<void>;
  handleChangeField: (key: keyof VenteFormState, value: string) => void;
  clearError: () => void;
}

export const useVentesCrud = (canRead: boolean): UseVentesCrudResult => {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    ...defaultPaginationState,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeVentes, setTypeVentes] = useState<TypeVente[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVente, setEditingVente] = useState<Vente | null>(null);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState<VenteFormState>({
    ...defaultVenteFormState,
  });
  const [siteContext, setSiteContext] = useState<VenteSiteContext | null>(null);
  const modeleCacheRef = useRef<Record<number, Modele[]>>({});
  const versionCacheRef = useRef<Record<number, Version[]>>({});
  const siteFilterKeyRef = useRef<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const userDetails = useAuthStore((state) => state.userDetails);

  const derivedSiteInfo = useMemo(() => {
    const siteId = pickFirstNumber(
      userDetails?.siteId,
      userDetails?.raw?.SiteId,
      userDetails?.raw?.siteId,
      (user as any)?.siteId,
      (user as any)?.SiteId
    );

    const groupementName = (
      userDetails?.groupementType ??
      userDetails?.raw?.GroupementType ??
      (user as any)?.groupement_type ??
      (user as any)?.GroupementType ??
      ""
    ) as string;

    if (!siteId || !groupementName) {
      return null;
    }

    const normalized = groupementName.trim().toLowerCase();
    const siteType: "Filiale" | "Succursale" =
      normalized === "succursale" ? "Succursale" : "Filiale";

    const siteName =
      (userDetails?.siteName ??
        userDetails?.raw?.SiteName ??
        (user as any)?.site_name ??
        (user as any)?.SiteName ??
        "") as string;

    return { siteId, siteName, siteType };
  }, [user, userDetails]);

  useEffect(() => {
    let cancelled = false;

    const hydrateSiteContext = async () => {
      if (!derivedSiteInfo) {
        if (!cancelled) {
          setSiteContext(null);
        }
        return;
      }

      const { siteId, siteType, siteName } = derivedSiteInfo;

      if (siteType === "Filiale") {
        try {
          const filiale = await filialeApi.getFilialeById(siteId);
          if (!cancelled) {
            setSiteContext({
              siteType,
              filialeId: siteId,
              succursaleId: null,
              siteName: filiale?.name ?? siteName ?? "",
            });
          }
        } catch (err) {
          console.error("Failed to load filiale info for ventes", err);
          if (!cancelled) {
            setSiteContext({
              siteType,
              filialeId: siteId,
              succursaleId: null,
              siteName: siteName ?? "",
            });
          }
        }
        return;
      }

      try {
        const succursale = await succursaleApi.getSuccursaleById(siteId);
        const filialeId =
          Number((succursale as any)?.idFiliale ?? (succursale as any)?.IdFiliale ?? 0) ||
          null;
        if (!cancelled) {
          setSiteContext({
            siteType,
            filialeId,
            succursaleId: siteId,
            siteName: succursale?.name ?? siteName ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load succursale info for ventes", err);
        if (!cancelled) {
          setSiteContext({
            siteType,
            filialeId: null,
            succursaleId: siteId,
            siteName: siteName ?? "",
          });
        }
      }
    };

    hydrateSiteContext();

    return () => {
      cancelled = true;
    };
  }, [derivedSiteInfo]);

  useEffect(() => {
    if (!siteContext) return;
    if (editingVente) return;
    setFormState((prev) => {
      const next = { ...prev };
      if (siteContext.siteType === "Filiale" && siteContext.filialeId) {
        next.idFiliale = `${siteContext.filialeId}`;
        next.idSuccursale = "";
      } else if (
        siteContext.siteType === "Succursale" &&
        siteContext.succursaleId
      ) {
        next.idSuccursale = `${siteContext.succursaleId}`;
        next.idFiliale = "";
      }
      return next;
    });
  }, [siteContext, editingVente]);

  const computePricing = useCallback(
    (state: VenteFormState): VenteFormState => {
      const nextState = { ...state };
      const versionId = Number(nextState.idVersion);
      const modeleId = Number(nextState.idModele);
      const marqueId = Number(nextState.idMarque);

      let unitPrice = 0;
      let unitTmDirect = 0;
      let unitTmInter = 0;

      if (versionId) {
        const sources = [versions, ...Object.values(versionCacheRef.current)];
        for (const list of sources) {
          const match = list.find((item) => item.id === versionId);
          if (match) {
            unitPrice = match.prixDeVente ?? 0;
            unitTmDirect = match.tmDirect ?? 0;
            unitTmInter = match.tmInterGroupe ?? 0;
            break;
          }
        }
      } else if (modeleId) {
        const sources = [modeles, ...Object.values(modeleCacheRef.current)];
        for (const list of sources) {
          const match = list.find((item) => item.id === modeleId);
          if (match) {
            unitPrice = match.averageSalePrice ?? 0;
            unitTmDirect = match.tmDirect ?? 0;
            unitTmInter = match.tmInterGroupe ?? 0;
            break;
          }
        }
      } else if (marqueId) {
        const match = marques.find((item) => item.id === marqueId);
        if (match) {
          unitPrice = match.averageSalePrice ?? 0;
          unitTmDirect = (match as any).tmDirect ?? 0;
          unitTmInter = (match as any).tmInterGroupe ?? 0;
        }
      }

      const formattedPrice = unitPrice > 0 ? unitPrice.toFixed(2) : "0";
      nextState.prixVente = formattedPrice;

      const numericVolume = Number(nextState.volume) || 0;
      const chiffreAffaires =
        unitPrice > 0 && numericVolume > 0 ? unitPrice * numericVolume : 0;
      nextState.chiffreAffaires =
        chiffreAffaires > 0 ? chiffreAffaires.toFixed(2) : "0";

      const selectedType = typeVentes.find(
        (type) => `${type.id}` === nextState.idTypeVente
      );
      const typeName = selectedType?.name?.trim().toLowerCase() ?? "";
      const useInter = typeName === "intergroupe";
      const tmRatio = useInter ? unitTmInter : unitTmDirect;

      const margeValue =
        unitPrice > 0 && tmRatio > 0 && numericVolume > 0
          ? unitPrice * tmRatio * numericVolume
          : 0;
      nextState.marge = margeValue > 0 ? margeValue.toFixed(2) : "0";
      nextState.margePercentage =
        tmRatio > 0 ? (tmRatio * 100).toFixed(2) : "0";

      return nextState;
    },
    [marques, modeles, versions, typeVentes]
  );
  const recomputeFormPricing = useCallback(() => {
    setFormState((prev) => computePricing(prev));
  }, [computePricing]);

  const siteFilterKey = useMemo(() => {
    return `${siteContext?.siteType ?? "none"}-${
      siteContext?.filialeId ?? "0"
    }-${siteContext?.succursaleId ?? "0"}`;
  }, [
    siteContext?.siteType,
    siteContext?.filialeId,
    siteContext?.succursaleId,
  ]);

  const fetchVentes = useCallback(async () => {
  if (!canRead) return;
  setLoading(true);
  setError(null);
  try {
    const query: Record<string, any> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    if (siteContext?.siteType === "Filiale" && siteContext.filialeId) {
      query.idFiliale = siteContext.filialeId;
    } else if (
      siteContext?.siteType === "Succursale" &&
      siteContext.succursaleId
    ) {
      query.idSuccursale = siteContext.succursaleId;
    }

    const resp = await ventesApi.listVentes({
      ...query,
    });

    const payload = resp?.data ?? null;
    
    console.log("=== DEBUG: Backend Response ===");
    console.log("Full payload:", payload);
    
    const extracted = extractVentes(payload);
    console.log("Extracted ventes:", extracted);
    
    const rows = extracted.map(normalizeVente);
    console.log("Normalized rows:", rows);
    console.log("First row sample:", rows[0]);

    setVentes(rows);
    const paginationPatch = extractPaginationState(payload, rows.length);
    setPagination((prev) => ({
      page: paginationPatch.page ?? prev.page,
      pageSize: paginationPatch.pageSize ?? prev.pageSize,
      totalRecords: paginationPatch.totalRecords ?? prev.totalRecords,
      totalPages: paginationPatch.totalPages ?? prev.totalPages,
    }));
  } catch (err: any) {
    const message =
      err?.response?.data?.message ??
      err?.message ??
      "Erreur lors du chargement des ventes";
    setError(message);
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
}, [canRead, pagination.page, pagination.pageSize, siteContext]);


  useEffect(() => {
    if (
      siteFilterKeyRef.current &&
      siteFilterKeyRef.current !== siteFilterKey
    ) {
      siteFilterKeyRef.current = siteFilterKey;
      setPagination((prev) => ({
        ...prev,
        page: 1,
      }));
      return;
    }
    siteFilterKeyRef.current = siteFilterKey;
    fetchVentes();
  }, [fetchVentes, siteFilterKey]);

  useEffect(() => {
    const fetchTypeVentes = async () => {
      try {
        const response = await typeventeApi.listActiveTypeVentes();
        const payload = response?.data;
        const items = Array.isArray(payload) ? payload : [];
        setTypeVentes(items);
      } catch (err) {
        console.error("Failed to load type ventes", err);
      }
    };
    fetchTypeVentes();
  }, []);

  const loadModelesForMarque = useCallback(
    async (marqueId: number) => {
      if (!marqueId) {
        setModeles([]);
        return [];
      }
      if (modeleCacheRef.current[marqueId]) {
        setModeles(modeleCacheRef.current[marqueId]);
        recomputeFormPricing();
        return modeleCacheRef.current[marqueId];
      }
      try {
        const response = await modeleApi.list({
          idMarque: marqueId,
          onlyActive: true,
          page: 1,
          pageSize: 500,
        });
        const items = response?.data ?? [];
        modeleCacheRef.current[marqueId] = items;
        setModeles(items);
        recomputeFormPricing();
        return items;
      } catch (err) {
        console.error("Failed to load modeles", err);
        setModeles([]);
        return [];
      }
    },
    [recomputeFormPricing]
  );

  const loadVersionsForModele = useCallback(
    async (modeleId: number) => {
      if (!modeleId) {
        setVersions([]);
        return [];
      }
      if (versionCacheRef.current[modeleId]) {
        setVersions(versionCacheRef.current[modeleId]);
        recomputeFormPricing();
        return versionCacheRef.current[modeleId];
      }
      try {
        const response = await versionApi.list({
          idModele: modeleId,
          onlyActive: true,
          page: 1,
          pageSize: 500,
        });
        const items = response?.data ?? [];
        versionCacheRef.current[modeleId] = items;
        setVersions(items);
        recomputeFormPricing();
        return items;
      } catch (err) {
        console.error("Failed to load versions", err);
        setVersions([]);
        return [];
      }
    },
    [recomputeFormPricing]
  );

  const prefetchOptionsForState = useCallback(
    (state: VenteFormState) => {
      const marqueId = Number(state.idMarque);
      if (!marqueId) {
        setModeles([]);
        setVersions([]);
        return;
      }
      void loadModelesForMarque(marqueId).then(() => {
        if (state.targetType === "version") {
          const modeleId = Number(state.idModele);
          if (modeleId) {
            void loadVersionsForModele(modeleId);
          } else {
            setVersions([]);
          }
        } else {
          setVersions([]);
        }
      });
    },
    [loadModelesForMarque, loadVersionsForModele]
  );

  const loadMarquesForSite = useCallback(
    async (context?: VenteSiteContext | null) => {
      try {
        if (!context) {
          const response = await marqueApi.list({
            onlyActive: true,
            page: 1,
            pageSize: 1000,
          });
          const items = response?.data ?? [];
          setMarques(items);
          return items;
        }

        if (context.siteType === "Filiale" && context.filialeId) {
          const response = await marqueApi.listByFiliale(context.filialeId, {
            onlyActive: true,
            page: 1,
            pageSize: 1000,
          });
          const items = response?.data ?? [];
          setMarques(items);
          return items;
        }

        if (context.siteType === "Succursale" && context.succursaleId) {
          const response = await marqueApi.list({
            onlyActive: true,
            page: 1,
            pageSize: 1000,
          });
          const items = response?.data ?? [];
          const filtered = items.filter((marque) => {
            const succMatch =
              Number((marque as any)?.idSuccursale ?? 0) === context.succursaleId;
            if (succMatch) return true;
            if (context.filialeId) {
              return Number((marque as any)?.idFiliale ?? 0) === context.filialeId;
            }
            return false;
          });
          setMarques(filtered);
          return filtered;
        }

        setMarques([]);
        return [];
      } catch (err) {
        console.error("Failed to load marques for ventes", err);
        setMarques([]);
        return [];
      }
    },
    []
  );

  useEffect(() => {
    if (!siteContext) return;
    if (editingVente) return;
    void loadMarquesForSite(siteContext);
  }, [siteContext, editingVente, loadMarquesForSite]);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    setPagination((prev) => ({
      ...prev,
      page: model.page + 1,
      pageSize: model.pageSize,
    }));
  }, []);

  const handleAddVente = useCallback(() => {
    setEditingVente(null);
    setFormState(() => {
      const base = { ...defaultVenteFormState };
      if (siteContext?.siteType === "Filiale" && siteContext.filialeId) {
        base.idFiliale = `${siteContext.filialeId}`;
      }
      if (siteContext?.siteType === "Succursale" && siteContext.succursaleId) {
        base.idSuccursale = `${siteContext.succursaleId}`;
      }
      return base;
    });
    setModeles([]);
    setVersions([]);
    setOpenDialog(true);
    setError(null);
    void loadMarquesForSite(siteContext);
  }, [loadMarquesForSite, siteContext]);

  const handleEditVente = useCallback(
    (vente: Vente) => {
      setEditingVente(vente);
      const nextState = venteToFormState(vente);
      setFormState(nextState);
      setOpenDialog(true);
      setError(null);
      const venteSiteContext: VenteSiteContext | null = vente.idSuccursale
        ? {
            siteType: "Succursale",
            filialeId: toNumberOrNull(vente.idFiliale),
            succursaleId: toNumberOrNull(vente.idSuccursale),
            siteName: vente.succursaleName ?? null,
          }
        : vente.idFiliale
        ? {
            siteType: "Filiale",
            filialeId: toNumberOrNull(vente.idFiliale),
            succursaleId: null,
            siteName: vente.filialeName ?? null,
          }
        : siteContext;

      void loadMarquesForSite(venteSiteContext).then(() => {
        prefetchOptionsForState(nextState);
      });
    },
    [loadMarquesForSite, prefetchOptionsForState, siteContext]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingVente(null);
    setFormState({ ...defaultVenteFormState });
    setModeles([]);
    setVersions([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSaveVente = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = buildVentePayload(formState);
      if (editingVente) {
        await ventesApi.updateVente(editingVente.id, payload);
      } else {
        await ventesApi.createVente(payload);
      }
      handleCloseDialog();
      await fetchVentes();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Erreur lors de l'enregistrement";
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [editingVente, fetchVentes, formState, handleCloseDialog]);

  const handleChangeField = useCallback(
    (key: keyof VenteFormState, value: string) => {
      setFormState((prev) => {
        const next: VenteFormState = { ...prev };
        switch (key) {
          case "targetType": {
            next.targetType = (value as VenteTargetType) ?? "marque";
            next.idMarque = "";
            next.idModele = "";
            next.idVersion = "";
            next.volume = "0";
            next.prixVente = "0";
            next.chiffreAffaires = "0";
            break;
          }
          case "idMarque": {
            next.idMarque = value;
            next.idModele = "";
            next.idVersion = "";
            next.volume = "0";
            next.prixVente = "0";
            next.chiffreAffaires = "0";
            break;
          }
          case "idModele": {
            next.idModele = value;
            if (next.targetType === "version") {
              next.idVersion = "";
            }
            next.volume = "0";
            next.prixVente = "0";
            next.chiffreAffaires = "0";
            break;
          }
          case "idVersion": {
            next.idVersion = value;
            next.volume = "0";
            next.prixVente = "0";
            next.chiffreAffaires = "0";
            break;
          }
          case "volume": {
            const numeric = Number(value);
            next.volume =
              Number.isFinite(numeric) && numeric >= 0 ? value : prev.volume;
            break;
          }
          default: {
            next[key] = value as any;
          }
        }
        return computePricing(next);
      });

      if (key === "idMarque") {
        const marqueId = Number(value);
        if (marqueId) {
          void loadModelesForMarque(marqueId);
        } else {
          setModeles([]);
          setVersions([]);
        }
      }

      const targetType: VenteTargetType =
        key === "targetType"
          ? ((value as VenteTargetType) ?? "marque")
          : formState.targetType;

      if (key === "idModele") {
        const modeleId = Number(value);
        if (targetType === "version" && modeleId) {
          void loadVersionsForModele(modeleId);
        } else {
          setVersions([]);
        }
      }

      if (key === "targetType" && value !== "version") {
        setVersions([]);
      }
    },
    [
      computePricing,
      formState.targetType,
      loadModelesForMarque,
      loadVersionsForModele,
    ]
  );

  useEffect(() => {
    if (!openDialog) return;
    setFormState((prev) => computePricing(prev));
  }, [openDialog, computePricing, marques, modeles, versions]);

  return {
    ventes,
    pagination,
    loading,
    error,
    typeVentes,
    marques,
    modeles,
    versions,
    siteContext,
    openDialog,
    editingVente,
    saving,
    formState,
    handlePaginationChange,
    handleAddVente,
    handleEditVente,
    handleCloseDialog,
    handleSaveVente,
    handleChangeField,
    clearError,
  };
};
