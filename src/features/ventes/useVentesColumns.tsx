import { useMemo } from "react";
import { Button } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import type { Vente } from "../../api/endpoints/ventes.api";

interface UseVentesColumnsOptions {
  canManage: boolean;
  onEdit: (vente: Vente) => void;
}

const formatCurrency = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "—";
  }

  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)} €`;
};

const formatPercent = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "—";
  }

  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)} %`;
};

export const useVentesColumns = ({
  canManage,
  onEdit,
}: UseVentesColumnsOptions): GridColDef[] => {
  return useMemo(() => {
    const columns: GridColDef[] = [
      {
        field: "typeVenteName",
        headerName: "Type de vente",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "userName",
        headerName: "Utilisateur",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "filialeName",
        headerName: "Filiale",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "succursaleName",
        headerName: "Succursale",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "marqueName",
        headerName: "Marque",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "modeleName",
        headerName: "Modele",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "versionName",
        headerName: "Version",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "prixVente",
        headerName: "Prix de vente",
        minWidth: 150,
        renderCell: (params) => formatCurrency(params.row.prixVente),
      },
      {
        field: "chiffreAffaires",
        headerName: "Chiffre d'affaires",
        minWidth: 170,
        renderCell: (params) => formatCurrency(params.row.chiffreAffaires),
      },
      {
        field: "marge",
        headerName: "Marge",
        minWidth: 140,
        renderCell: (params) => formatCurrency(params.row.marge),
      },
      {
        field: "margePercentage",
        headerName: "Marge (%)",
        minWidth: 140,
        renderCell: (params) => formatPercent(params.row.margePercentage),
      },
      {
        field: "volume",
        headerName: "Volume",
        minWidth: 110,
      },
      {
        field: "ventePeriod",
        headerName: "Periode",
        minWidth: 140,
      },
      {
        field: "actions",
        headerName: "",
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) =>
          canManage && params?.row ? (
            <Button onClick={() => onEdit(params.row as Vente)}>
              Modifier
            </Button>
          ) : null,
      },
    ];

    return columns;
  }, [canManage, onEdit]);
};
