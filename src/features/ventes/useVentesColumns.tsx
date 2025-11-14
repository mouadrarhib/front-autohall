import { useMemo } from "react";
import { alpha } from "@mui/material/styles";
import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import type { GridColDef } from "@mui/x-data-grid";
import type { Vente } from "../../api/endpoints/ventes.api";

interface UseVentesColumnsOptions {
  canManage: boolean;
  onView: (vente: Vente) => void;
  onEdit: (vente: Vente) => void;
}

const EMPTY_PLACEHOLDER = "_";

const currencyFormatter = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("fr-MA", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return EMPTY_PLACEHOLDER;
  }
  const stringValue = `${value}`.trim();
  return stringValue.length ? stringValue : EMPTY_PLACEHOLDER;
};

const asNumber = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatCurrency = (value: unknown): string => {
  const numeric = asNumber(value);
  return numeric === null ? EMPTY_PLACEHOLDER : currencyFormatter.format(numeric);
};

const formatPercent = (value: unknown): string => {
  const numeric = asNumber(value);
  return numeric === null ? EMPTY_PLACEHOLDER : `${percentFormatter.format(numeric)} %`;
};

const formatPeriod = (vente: Vente): string => {
  if (vente.ventePeriod) {
    return formatText(vente.ventePeriod);
  }

  const month =
    vente.venteMonthName ??
    (vente.venteMonth
      ? new Date(2000, Math.max(0, vente.venteMonth - 1), 1).toLocaleString("fr-MA", { month: "long" })
      : "");
  const year = vente.venteYear ?? "";
  const label = `${month ?? ""} ${year ?? ""}`.trim();

  return label.length ? label : EMPTY_PLACEHOLDER;
};

export const useVentesColumns = ({
  canManage,
  onView,
  onEdit,
}: UseVentesColumnsOptions): GridColDef<Vente>[] => {
  return useMemo(() => {
    const alignLeft = {
      display: "flex",
      alignItems: "center",
      height: "100%",
      width: "100%",
    } as const;

    const alignCenter = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
    } as const;

    const alignRight = {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      height: "100%",
      width: "100%",
    } as const;

    const cellActions = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      gap: 1,
    } as const;

    return [
      {
        field: "typeVenteName",
        headerName: "Type de vente",
        flex: 1.2,
        minWidth: 200,
        align: "left",
        headerAlign: "left",
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignLeft}>
            <Typography variant="body2" fontWeight={600}>
              {formatText(row.typeVenteName)}
            </Typography>
          </Box>
        ),
      },
      {
        field: "ventePeriod",
        headerName: "Periode",
        flex: 0.9,
        minWidth: 160,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignCenter}>
            <Typography variant="body2">{formatPeriod(row)}</Typography>
          </Box>
        ),
      },
      {
        field: "prixVente",
        headerName: "Prix de vente",
        minWidth: 160,
        flex: 0.8,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignRight}>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {formatCurrency(row.prixVente)}
            </Typography>
          </Box>
        ),
      },
      {
        field: "chiffreAffaires",
        headerName: "Chiffre d'affaires",
        minWidth: 180,
        flex: 1,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignRight}>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {formatCurrency(row.chiffreAffaires)}
            </Typography>
          </Box>
        ),
      },
      {
        field: "marge",
        headerName: "Marge",
        minWidth: 140,
        flex: 0.8,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignRight}>
            <Typography variant="body2">{formatCurrency(row.marge)}</Typography>
          </Box>
        ),
      },
      {
        field: "margePercentage",
        headerName: "Marge (%)",
        minWidth: 140,
        flex: 0.8,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignCenter}>
            <Chip
              label={formatPercent(row.margePercentage)}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
                color: "success.dark",
                minWidth: 90,
              }}
            />
          </Box>
        ),
      },
      {
        field: "volume",
        headerName: "Volume",
        minWidth: 110,
        flex: 0.6,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: ({ row }) => (
          <Box sx={alignCenter}>
            <Typography variant="body2" fontWeight={600}>
              {formatText(row.volume)}
            </Typography>
          </Box>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 160,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => (
          <Box sx={cellActions}>
            <Tooltip title="Voir les details">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(row);
                }}
                sx={{
                  p: 0.5,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    color: "primary.main",
                    transform: "scale(1.08)",
                  },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canManage && (
              <Tooltip title="Modifier">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(row);
                  }}
                  sx={{
                    p: 0.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.12),
                      color: "warning.main",
                      transform: "scale(1.08)",
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ];
  }, [canManage, onEdit, onView]);
};
