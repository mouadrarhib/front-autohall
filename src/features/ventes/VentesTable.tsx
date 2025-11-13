import React from "react";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { Paper, Alert } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Vente } from "../../api/endpoints/ventes.api";
import type { PaginationState } from "./VenteType";

interface VentesTableProps {
  rows: Vente[];
  columns: GridColDef[];
  loading: boolean;
  pagination: PaginationState;
  onPaginationChange: (model: GridPaginationModel) => void;
  error: string | null;
  onClearError: () => void;
}

export const VentesTable: React.FC<VentesTableProps> = ({
  rows,
  columns,
  loading,
  pagination,
  onPaginationChange,
  error,
  onClearError,
}) => (
  <>
    {error && <Alert severity="error" onClose={onClearError}>{error}</Alert>}
    <Paper sx={{
      mt: 2,
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      borderRadius: 3,
      background: (theme) =>
        theme.palette.mode === "dark"
          ? alpha("#1e293b", 0.4)
          : alpha("#ffffff", 0.9)
    }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        paginationMode="server"
        paginationModel={{
          page: Math.max(pagination.page - 1, 0),
          pageSize: pagination.pageSize,
        }}
        rowCount={pagination.totalRecords}
        onPaginationModelChange={onPaginationChange}
        pageSizeOptions={[10, 25, 50, 100]}
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
        rowHeight={60}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnSeparator": { display: "none" },
          "& .MuiDataGrid-row": {
            borderRadius: 3,
            transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 18px 30px rgba(15,23,42,0.10)",
              backgroundColor: alpha("#2563eb", 0.06),
            },
          },
        }}
      />
    </Paper>
  </>
);
