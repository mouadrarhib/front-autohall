// src/features/sites/SitesManagement.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Stack,
  Tab,
  Tabs,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
} from "@mui/material";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { filialeApi, type Filiale } from "../../api/endpoints/filiale.api";
import {
  succursaleApi,
  type Succursale,
} from "../../api/endpoints/succursale.api";
import { marqueApi, type Marque } from "../../api/endpoints/marque.api";
import { useAuthStore } from "../../store/authStore";
import { SiteFilters } from "./SiteFilters";
import { SiteTable } from "./SiteTable";
import { SiteDialog } from "./SiteDialog";
import { useSiteColumns } from "./useSiteColumns";
import type {
  DialogMode,
  SiteFormState,
  PaginationState,
  SiteType,
} from "./siteTypes";

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,
};

export const SitesManagement: React.FC = () => {
  const hasCreateFiliale = useAuthStore((state) =>
    state.hasPermission("FILIALE_CREATE")
  );
  const hasUpdateFiliale = useAuthStore((state) =>
    state.hasPermission("FILIALE_UPDATE")
  );
  const hasCreateSuccursale = useAuthStore((state) =>
    state.hasPermission("SUCCURSALE_CREATE")
  );
  const hasUpdateSuccursale = useAuthStore((state) =>
    state.hasPermission("SUCCURSALE_UPDATE")
  );

  const [activeTab, setActiveTab] = useState<SiteType>("filiale");
  const [sites, setSites] = useState<(Filiale | Succursale)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);
  const [pageState, setPageState] = useState({ page: 1, pageSize: 10 });
  const [reloadToken, setReloadToken] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [currentSite, setCurrentSite] = useState<Filiale | Succursale | null>(
    null
  );
  const [formState, setFormState] = useState<SiteFormState>({
    name: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  // Marques dialog state
  const [marquesDialogOpen, setMarquesDialogOpen] = useState(false);
  const [selectedFiliale, setSelectedFiliale] = useState<Filiale | null>(null);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [loadingMarques, setLoadingMarques] = useState(false);

  const loadSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        activeTab === "filiale"
          ? await filialeApi.listFiliales({
              page: pageState.page,
              pageSize: pageState.pageSize,
            })
          : await succursaleApi.listSuccursales({
              page: pageState.page,
              pageSize: pageState.pageSize,
            });

      setSites(response.data ?? []);
      setPagination({
        page: response.pagination?.page ?? pageState.page,
        pageSize: response.pagination?.pageSize ?? pageState.pageSize,
        totalRecords:
          response.pagination?.totalCount ?? response.data?.length ?? 0,
        totalPages: response.pagination?.totalPages ?? 1,
      });
    } catch (err: any) {
      console.error("Failed to load sites", err);
      setError(
        err?.response?.data?.error ??
          `Impossible de charger les ${
            activeTab === "filiale" ? "filiales" : "succursales"
          }.`
      );
      setSites([]);
      setPagination((prev) => ({ ...prev, totalRecords: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  }, [activeTab, pageState.page, pageState.pageSize, reloadToken]);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPageState({
      page: model.page + 1,
      pageSize: model.pageSize,
    });
  };

  const handleOpenDialog = (mode: DialogMode, site?: Filiale | Succursale) => {
    setDialogMode(mode);
    setCurrentSite(site ?? null);
    if (mode === "edit" && site) {
      setFormState({
        name: site.name,
        active: site.active,
      });
    } else {
      setFormState({
        name: "",
        active: true,
      });
    }
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setCurrentSite(null);
  };

  const handleFormChange = <K extends keyof SiteFormState>(
    key: K,
    value: SiteFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      setError("Le nom est requis.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formState.name.trim(),
        active: formState.active,
      };

      if (activeTab === "filiale") {
        if (dialogMode === "edit" && currentSite) {
          await filialeApi.updateFiliale(currentSite.id, payload);
        } else {
          await filialeApi.createFiliale(payload);
          setPageState((prev) => ({ ...prev, page: 1 }));
        }
      } else {
        if (dialogMode === "edit" && currentSite) {
          await succursaleApi.updateSuccursale(currentSite.id, payload);
        } else {
          await succursaleApi.createSuccursale(payload);
          setPageState((prev) => ({ ...prev, page: 1 }));
        }
      }

      setDialogOpen(false);
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error("Failed to save site", err);
      setError(
        err?.response?.data?.error ??
          "Impossible de sauvegarder les changements."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (site: Filiale | Succursale) => {
    try {
      setTogglingId(site.id);
      if (activeTab === "filiale") {
        if (site.active) {
          await filialeApi.deactivateFiliale(site.id);
        } else {
          await filialeApi.activateFiliale(site.id);
        }
      } else {
        if (site.active) {
          await succursaleApi.deactivateSuccursale(site.id);
        } else {
          await succursaleApi.activateSuccursale(site.id);
        }
      }
      setReloadToken((value) => value + 1);
    } catch (err: any) {
      console.error("Failed to toggle site", err);
      setError(
        err?.response?.data?.error ??
          "Impossible de mettre a jour l'etat du site."
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleViewMarques = async (filiale: Filiale) => {
    setSelectedFiliale(filiale);
    setMarquesDialogOpen(true);
    setLoadingMarques(true);

    try {
      const response = await marqueApi.listByFiliale(filiale.id, {
        pageSize: 1000,
        onlyActive: false,
      });
      setMarques(response.data ?? []);
    } catch (err: any) {
      console.error("Failed to load marques", err);
      setMarques([]);
    } finally {
      setLoadingMarques(false);
    }
  };

  const handleCloseMarquesDialog = () => {
    setMarquesDialogOpen(false);
    setSelectedFiliale(null);
    setMarques([]);
  };

  const hasCreate =
    activeTab === "filiale" ? hasCreateFiliale : hasCreateSuccursale;
  const hasUpdate =
    activeTab === "filiale" ? hasUpdateFiliale : hasUpdateSuccursale;

  const columns = useSiteColumns({
    siteType: activeTab,
    hasUpdate,
    togglingId,
    onEdit: (site) => handleOpenDialog("edit", site),
    onToggleActive: handleToggleActive,
    onViewMarques: activeTab === "filiale" ? handleViewMarques : undefined,
  });

  const isFormValid = formState.name.trim().length > 0;

  const handleTabChange = (_: React.SyntheticEvent, newValue: SiteType) => {
    setActiveTab(newValue);
    setPageState({ page: 1, pageSize: 10 });
    setReloadToken((prev) => prev + 1);
  };

  return (
    <Box
      sx={{
        p: 4,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))"
            : "linear-gradient(135deg, rgba(248,250,252,0.9), rgba(226,232,240,0.7))",
        borderRadius: 4,
        minHeight: "100%",
      }}
    >
      <Stack spacing={3}>
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
              },
            }}
          >
            <Tab label="Filiales" value="filiale" />
            <Tab label="Succursales" value="succursale" />
          </Tabs>
        </Paper>

        <SiteFilters
          siteType={activeTab}
          totalRecords={pagination.totalRecords}
          hasCreate={hasCreate}
          error={error}
          onClearError={() => setError(null)}
          onCreate={() => handleOpenDialog("create")}
        />

        <SiteTable
          rows={sites}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationModelChange}
          error={error}
          onClearError={() => setError(null)}
        />

        <SiteDialog
          open={dialogOpen}
          dialogMode={dialogMode}
          siteType={activeTab}
          formState={formState}
          saving={saving}
          isFormValid={isFormValid}
          onClose={handleCloseDialog}
          onSave={handleSave}
          onChangeField={handleFormChange}
        />

        {/* Marques Dialog */}
        <Dialog
          open={marquesDialogOpen}
          onClose={handleCloseMarquesDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Marques de {selectedFiliale?.name}</DialogTitle>
          <DialogContent dividers>
            {loadingMarques ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : marques.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", py: 4 }}
              >
                Aucune marque trouvée pour cette filiale.
              </Typography>
            ) : (
              <List>
                {marques.map((marque) => (
                  <ListItem key={marque.id} divider>
                    <Box
                      component="img"
                      src={marque.imageUrl || "/placeholder-car.png"}
                      alt={marque.name}
                      sx={{
                        width: 48,
                        height: 48,
                        objectFit: "contain",
                        marginRight: 2,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        padding: 0.5,
                      }}
                      onError={(e: any) => {
                        e.target.src = "/placeholder-car.png";
                      }}
                    />
                    <ListItemText
                      primary={marque.name}
                      secondary={marque.active ? "Active" : "Inactive"}
                      secondaryTypographyProps={{
                        color: marque.active
                          ? "success.main"
                          : "text.secondary",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMarquesDialog}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
};
