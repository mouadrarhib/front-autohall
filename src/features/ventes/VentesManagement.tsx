import React, { useCallback, useState } from "react";
import { Box, Stack, Button } from "@mui/material";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { toast } from 'react-toastify';
import { useRoles } from "../../hooks/useRoles";
import { VentesTable } from "./VentesTable";
import { VentesDialog } from "./VentesDialog";
import { useVentesColumns } from "./useVentesColumns";
import { useVentesCrud } from "./useVentesCrud";
import type { Vente } from "../../api/endpoints/ventes.api";
import { VenteDetailsDialog } from "./VenteDetailsDialog";
import { exportRowsToCsv } from '../../utils/csvExport';

export const VentesManagement: React.FC = () => {
  const { isIntegrateurVentes, isAdminFonctionnel } = useRoles();
  const canManage = isIntegrateurVentes;
  const canRead = isIntegrateurVentes || isAdminFonctionnel;

  const {
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
  } = useVentesCrud(canRead);

  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewVente = useCallback((vente: Vente) => {
    setSelectedVente(vente);
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedVente(null);
  }, []);

  const columns = useVentesColumns({
    canManage,
    onView: handleViewVente,
    onEdit: handleEditVente,
  });

  const handleExportCsv = useCallback(() => {
    if (ventes.length === 0) {
      toast.info('No ventes to export.');
      return;
    }

    exportRowsToCsv({
      fileName: `ventes-${new Date().toISOString().slice(0, 10)}.csv`,
      rows: ventes,
      columns: [
        { header: 'ID', accessor: (row) => row.id },
        { header: 'Type Vente', accessor: (row) => row.typeVenteName ?? '' },
        { header: 'Utilisateur', accessor: (row) => row.userName ?? '' },
        { header: 'Filiale', accessor: (row) => row.filialeName ?? '' },
        { header: 'Succursale', accessor: (row) => row.succursaleName ?? '' },
        { header: 'Marque', accessor: (row) => row.marqueName ?? '' },
        { header: 'Modele', accessor: (row) => row.modeleName ?? '' },
        { header: 'Version', accessor: (row) => row.versionName ?? '' },
        { header: 'Volume', accessor: (row) => row.volume },
        { header: 'Prix Vente', accessor: (row) => row.prixVente },
        { header: 'Chiffre Affaires', accessor: (row) => row.chiffreAffaires },
        { header: 'Marge', accessor: (row) => row.marge ?? '' },
        { header: 'Marge %', accessor: (row) => row.margePercentage ?? '' },
        { header: 'Periode', accessor: (row) => row.ventePeriod ?? `${row.venteMonth}/${row.venteYear}` },
        { header: 'Active', accessor: (row) => (row.active ? 'Yes' : 'No') },
      ],
    });

    toast.success('Ventes CSV exported successfully.');
  }, [ventes]);

  if (!canRead) {
    return (
      <Box mt={4}>
        <h2>Acces refuse</h2>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(15,23,42,0.6))"
            : "linear-gradient(135deg, rgba(248,250,252,0.9), rgba(226,232,240,0.7))",
        borderRadius: 4,
        minHeight: "100%",
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          justifyContent="space-between"
        >
          <h2 style={{ margin: 0, fontWeight: 600 }}>Gestion des ventes</h2>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleExportCsv}
              disabled={ventes.length === 0}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Exporter CSV
            </Button>
            {canManage && (
              <Button variant="contained" onClick={handleAddVente} sx={{ width: { xs: "100%", sm: "auto" } }}>
                Nouvelle vente
              </Button>
            )}
          </Stack>
        </Stack>

        <VentesTable
          rows={ventes}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          error={error}
          onClearError={clearError}
        />

        <VentesDialog
          open={openDialog}
          isEdit={!!editingVente}
          formState={formState}
          saving={saving}
          error={error}
          typeVentes={typeVentes}
          marques={marques}
          modeles={modeles}
          versions={versions}
          siteContext={siteContext}
          onClose={handleCloseDialog}
          onSave={handleSaveVente}
          onChangeField={handleChangeField}
          onClearError={clearError}
        />

        <VenteDetailsDialog
          open={detailsOpen}
          vente={selectedVente}
          onClose={handleCloseDetails}
          marques={marques}
          modeles={modeles}
        />
      </Stack>
    </Box>
  );
};
