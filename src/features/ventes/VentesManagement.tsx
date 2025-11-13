import React from "react";
import { Box, Stack, Button } from "@mui/material";
import { useRoles } from "../../hooks/useRoles";
import { VentesTable } from "./VentesTable";
import { VentesDialog } from "./VentesDialog";
import { useVentesColumns } from "./useVentesColumns";
import { useVentesCrud } from "./useVentesCrud";

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

  const columns = useVentesColumns({
    canManage,
    onEdit: handleEditVente,
  });

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
        <Stack direction="row" alignItems="center" spacing={2}>
          <h2 style={{ margin: 0, fontWeight: 600 }}>Gestion des ventes</h2>
          {canManage && (
            <Button variant="contained" onClick={handleAddVente}>
              Nouvelle vente
            </Button>
          )}
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
      </Stack>
    </Box>
  );
};
