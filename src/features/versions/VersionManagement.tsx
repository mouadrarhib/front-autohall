// src/features/versions/VersionManagement.tsx

import React, { useCallback, useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { marqueApi, type Marque } from "../../api/endpoints/marque.api";
import { modeleApi, type Modele } from "../../api/endpoints/modele.api";
import { versionApi, type Version } from "../../api/endpoints/version.api";
import { useAuthStore } from "../../store/authStore";
import { VersionFilters } from "./VersionFilters";
import { VersionTable } from "./VersionTable";
import { VersionDialog } from "./VersionDialog";
import { VersionDetailsDialog } from "./VersionDetailsDialog"; // NEW
import { useVersionColumns } from "./useVersionColumns";
import type {
  PaginationState,
  VersionFormState,
  DialogMode,
} from "./versionTypes";

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

export const VersionManagement: React.FC = () => {
  const hasCreate = useAuthStore((state) =>
    state.hasPermission("VERSION_CREATE")
  );
  const hasUpdate = useAuthStore((state) =>
    state.hasPermission("VERSION_UPDATE")
  );

  const [marques, setMarques] = useState<Marque[]>([]);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [marquesLoading, setMarquesLoading] = useState(false);
  const [modelesLoading, setModelesLoading] = useState(false);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  const [versions, setVersions] = useState<Version[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);

  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);
  const [pageState, setPageState] = useState({ page: 1, pageSize: 10 });
  const [filterMarqueId, setFilterMarqueId] = useState<number | "all">("all");
  const [filterModeleId, setFilterModeleId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [formState, setFormState] = useState<VersionFormState>({
    name: "",
    idMarque: null,
    idModele: null,
    volume: 1,
    price: 0,
    tmPercent: 0,
    marginPercent: 0,
    active: true,
  });
  const [saving, setSaving] = useState(false);

  // View Details Dialog State (NEW)
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewVersion, setViewVersion] = useState<Version | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPageState((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadMarques = useCallback(async () => {
    try {
      setMarquesLoading(true);
      setFiltersError(null);
      const response = await marqueApi.list({
        onlyActive: true,
        page: 1,
        pageSize: 1000,
      });
      setMarques(response.data ?? []);
    } catch (err: any) {
      console.error("Failed to load marques", err);
      setFiltersError(
        err?.response?.data?.error ?? "Impossible de charger les marques."
      );
    } finally {
      setMarquesLoading(false);
    }
  }, []);

  const loadModeles = useCallback(async (marqueId: number | "all") => {
    if (marqueId === "all") {
      setModeles([]);
      setFilterModeleId("all");
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
        setFilterModeleId("all");
      }
    } catch (err: any) {
      console.error("Failed to load modeles", err);
      setFiltersError(
        err?.response?.data?.error ?? "Impossible de charger les modeles."
      );
      setModeles([]);
      setFilterModeleId("all");
    } finally {
      setModelesLoading(false);
    }
  }, []);

  const loadVersions = useCallback(async () => {
    try {
      setVersionsLoading(true);
      setVersionsError(null);

      // Use search if query exists, otherwise use list
      if (debouncedSearch.trim()) {
        const response = await versionApi.search({
          q: debouncedSearch.trim(),
          idModele: filterModeleId === "all" ? undefined : filterModeleId,
          onlyActive: false,
          page: pageState.page,
          pageSize: pageState.pageSize,
        });
        setVersions(response.data ?? []);
        setPagination({
          page: response.pagination?.page ?? pageState.page,
          pageSize: response.pagination?.pageSize ?? pageState.pageSize,
          totalRecords: response.pagination?.totalRecords ?? 0,
          totalPages: response.pagination?.totalPages ?? 1,
        });
      } else {
        const response = await versionApi.list({
          idModele: filterModeleId === "all" ? undefined : filterModeleId,
          onlyActive: false,
          page: pageState.page,
          pageSize: pageState.pageSize,
        });
        setVersions(response.data ?? []);
        setPagination({
          page: response.pagination?.page ?? pageState.page,
          pageSize: response.pagination?.pageSize ?? pageState.pageSize,
          totalRecords: response.pagination?.totalRecords ?? 0,
          totalPages: response.pagination?.totalPages ?? 1,
        });
      }
    } catch (err: any) {
      console.error("Failed to load versions", err);
      setVersionsError(
        err?.response?.data?.error ?? "Impossible de charger les versions."
      );
      setVersions([]);
      setPagination((prev) => ({ ...prev, totalRecords: 0, totalPages: 0 }));
    } finally {
      setVersionsLoading(false);
    }
  }, [
    filterModeleId,
    debouncedSearch,
    pageState.page,
    pageState.pageSize,
    reloadToken,
  ]);

  useEffect(() => {
    loadMarques();
  }, [loadMarques]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  useEffect(() => {
    if (filterMarqueId !== "all") {
      loadModeles(filterMarqueId);
    } else {
      setModeles([]);
      setFilterModeleId("all");
      setReloadToken((value) => value + 1);
    }
  }, [filterMarqueId, loadModeles]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPageState({
      page: model.page + 1,
      pageSize: model.pageSize,
    });
  };

  // Handle View Details (NEW)
  const handleViewVersion = (version: Version) => {
    setViewVersion(version);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewVersion(null);
  };

  const openDialog = (mode: DialogMode, version?: Version) => {
    setDialogMode(mode);
    setCurrentVersion(version ?? null);

    if (mode === "edit" && version) {
      const associatedModele = modeles.find((m) => m.id === version.idModele);
      const marqueIdToUse =
        associatedModele?.idMarque ?? version.idMarque ?? null;

      setFormState({
        name: version.nom,
        idMarque: marqueIdToUse,
        idModele: version.idModele,
        volume: version.volume,
        price: version.prixDeVente,
        tmPercent: version.tmDirect,
        marginPercent: version.tmInterGroupe,
        active: version.active,
      });

      // Load modeles for this marque when editing
      if (marqueIdToUse) {
        loadModeles(marqueIdToUse);
      }
    } else {
      setFormState({
        name: "",
        idMarque: filterMarqueId === "all" ? null : filterMarqueId,
        idModele: filterModeleId === "all" ? null : filterModeleId,
        volume: 1,
        price: 0,
        tmPercent: 0,
        marginPercent: 0,
        active: true,
      });

      // Load modeles if creating with a pre-selected marque
      if (filterMarqueId !== "all") {
        loadModeles(filterMarqueId);
      } else {
        setModeles([]);
      }
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
      setVersionsError("Le nom de la version est requis.");
      return;
    }

    if (!formState.idModele) {
      setVersionsError("Veuillez sélectionner un modèle.");
      return;
    }

    if (formState.volume <= 0 || formState.price <= 0) {
      setVersionsError("Veuillez saisir un volume et un prix valides.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formState.name.trim(),
        idModele: formState.idModele,
        volume: formState.volume,
        salePrice: formState.price,
        tmDirect: formState.tmPercent,
        tmInterGroupe: formState.marginPercent,
      };

      if (dialogMode === "edit" && currentVersion) {
        await versionApi.update(currentVersion.id, payload);
      } else {
        await versionApi.create(payload);
        setPageState((prev) => ({ ...prev, page: 1 }));
      }

      setDialogOpen(false);
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error("Failed to save version", err);
      setVersionsError(
        err?.response?.data?.error ?? "Impossible de sauvegarder la version."
      );
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
      console.error("Failed to toggle version", err);
      setVersionsError(
        err?.response?.data?.error ??
          "Impossible de mettre à jour l'état de la version."
      );
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useVersionColumns({
    hasUpdate,
    togglingId,
    onView: handleViewVersion, // NEW
    onEdit: (version) => openDialog("edit", version),
    onToggleActive: handleToggleActive,
  });

  const isFormValid =
    formState.name.trim().length > 0 &&
    formState.idModele !== null &&
    formState.volume > 0 &&
    formState.price > 0;

  const handleSelectMarque = (value: number | null) => {
    handleFormChange("idMarque", value);
    handleFormChange("idModele", null); // Clear modele selection
    if (value !== null) {
      // Load modeles for the selected marque
      loadModeles(value);
    } else {
      setModeles([]);
    }
  };

  const handleFilterMarqueChange = (value: number | "all") => {
    setFilterMarqueId(value);
    setPageState((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterModeleChange = (value: number | "all") => {
    setFilterModeleId(value);
    setPageState((prev) => ({ ...prev, page: 1 }));
    setReloadToken((prev) => prev + 1);
  };

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
        <VersionFilters
          marques={marques}
          modeles={modeles}
          marquesLoading={marquesLoading}
          modelesLoading={modelesLoading}
          filterMarqueId={filterMarqueId}
          filterModeleId={filterModeleId}
          searchQuery={searchQuery}
          totalRecords={pagination.totalRecords}
          hasCreate={hasCreate}
          filtersError={filtersError} // Changed from error
          onClearFiltersError={() => setFiltersError(null)} // Changed from onClearError
          onChangeMarque={handleFilterMarqueChange}
          onChangeModele={handleFilterModeleChange}
          onSearchChange={setSearchQuery}
          onCreate={() => openDialog("create")}
        />

        <VersionTable
          rows={versions}
          columns={columns}
          loading={versionsLoading}
          error={versionsError}
          pagination={pagination}
          onPaginationChange={handlePaginationModelChange}
          onClearError={() => setVersionsError(null)}
        />

        {/* Edit Dialog */}
        <VersionDialog
          open={dialogOpen}
          dialogMode={dialogMode}
          formState={formState}
          marques={marques}
          modeles={modeles}
          saving={saving}
          isFormValid={isFormValid}
          onClose={closeDialog}
          onSave={handleSave}
          onChangeField={handleFormChange}
          onSelectMarque={handleSelectMarque}
        />

        {/* View Details Dialog */}
        <VersionDetailsDialog
          open={viewDialogOpen}
          version={viewVersion}
          onClose={handleCloseViewDialog}
        />
      </Stack>
    </Box>
  );
};
