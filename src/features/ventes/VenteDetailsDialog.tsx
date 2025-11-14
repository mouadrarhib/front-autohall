import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import type { Vente } from "../../api/endpoints/ventes.api";

interface VenteDetailsDialogProps {
  open: boolean;
  vente: Vente | null;
  onClose: () => void;
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
  const label = `${value}`.trim();
  return label.length ? label : EMPTY_PLACEHOLDER;
};

const asNumber = (value?: number | null): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatCurrency = (value?: number | null): string => {
  const numeric = asNumber(value);
  return numeric === null ? EMPTY_PLACEHOLDER : currencyFormatter.format(numeric);
};

const formatPercent = (value?: number | null): string => {
  const numeric = asNumber(value);
  return numeric === null ? EMPTY_PLACEHOLDER : `${percentFormatter.format(numeric)} %`;
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return EMPTY_PLACEHOLDER;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return EMPTY_PLACEHOLDER;
  }
  return parsed.toLocaleString("fr-MA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildPeriodLabel = (vente: Vente): string => {
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

export const VenteDetailsDialog: React.FC<VenteDetailsDialogProps> = ({
  open,
  vente,
  onClose,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  if (!vente) {
    return null;
  }
  const isActive = vente.active ?? true;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha("#0f172a", 0.9)
              : alpha("#f8fafc", 0.85),
          backdropFilter: "blur(10px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          pb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: "white",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha("#ffffff", 0.2) }}>
            <InfoOutlinedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Details de la vente
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Resume des informations principales
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Type de vente
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatText(vente.typeVenteName)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Période
                </Typography>
                <Typography variant="body1">
                  {buildPeriodLabel(vente)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Utilisateur
                </Typography>
                <Typography variant="body1">
                  {formatText(vente.userName)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Filiale
                </Typography>
                <Typography variant="body1">
                  {formatText(vente.filialeName)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Succursale
                </Typography>
                <Typography variant="body1">
                  {formatText(vente.succursaleName)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Marque
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatText(vente.marqueName)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Modele
                </Typography>
                <Typography variant="body1">
                  {formatText(vente.modeleName)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Version
                </Typography>
                <Typography variant="body1">
                  {formatText(vente.versionName)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Prix de vente
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  {formatCurrency(vente.prixVente)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Chiffre d'affaires
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {formatCurrency(vente.chiffreAffaires)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Volume
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {formatText(vente.volume)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Marge
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrency(vente.marge ?? null)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Marge (%)
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatPercent(vente.margePercentage ?? null)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider />

          <Stack spacing={1} alignItems="flex-start">
            <Chip
              label={isActive ? "Active" : "Inactive"}
              color={isActive ? "success" : "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="caption" color="text.secondary">
              Création : {formatDate(vente.createdAt)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mise à jour : {formatDate(vente.updatedAt)}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
