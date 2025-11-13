import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import type { TypeVente } from "../../api/endpoints/typevente.api";
import type { Marque } from "../../api/endpoints/marque.api";
import type { Modele } from "../../api/endpoints/modele.api";
import type { Version } from "../../api/endpoints/version.api";
import type { VenteFormState, VenteSiteContext } from "./VenteType";

interface VentesDialogProps {
  open: boolean;
  isEdit: boolean;
  formState: VenteFormState;
  saving: boolean;
  error: string | null;
  typeVentes: TypeVente[];
  marques: Marque[];
  modeles: Modele[];
  versions: Version[];
  siteContext: VenteSiteContext | null;
  onClose: () => void;
  onSave: () => void;
  onChangeField: (key: keyof VenteFormState, value: string) => void;
  onClearError: () => void;
}

const renderMenuItems = <T extends { id: number; name?: string; nom?: string }>(
  items: T[]
) =>
  items.map((item) => (
    <MenuItem key={item.id} value={`${item.id}`}>
      {"name" in item && item.name ? item.name : item.nom ?? `#${item.id}`}
    </MenuItem>
  ));

export const VentesDialog: React.FC<VentesDialogProps> = ({
  open,
  isEdit,
  formState,
  saving,
  error,
  typeVentes,
  marques,
  modeles,
  versions,
  siteContext,
  onClose,
  onSave,
  onChangeField,
  onClearError,
}) => {
  const showModeleSelect = formState.targetType !== "marque";
  const showVersionSelect = formState.targetType === "version";
  const filialeReadOnly =
    siteContext?.filialeId != null && siteContext.filialeId > 0;
  const succursaleReadOnly =
    siteContext?.succursaleId != null && siteContext.succursaleId > 0;
  const selectedType = typeVentes.find(
    (type) => `${type.id}` === formState.idTypeVente
  );
  const tmLabel = selectedType
    ? selectedType.name?.trim().toLowerCase() === "intergroupe"
      ? "TM intergroupe (%)"
      : "TM direct (%)"
    : "TM (%)";
  const tmHelper = selectedType?.name
    ? `Type de vente: ${selectedType.name}`
    : undefined;

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Modifier une vente" : "Creer une vente"}</DialogTitle>
      <DialogContent>
        {error && (
          <div style={{ color: "red", marginBottom: 8 }} onClick={onClearError}>
            {error}
          </div>
        )}
        <Stack spacing={3} mt={2}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Cibler la vente par
            </Typography>
            <ToggleButtonGroup
              exclusive
              color="primary"
              value={formState.targetType}
              onChange={(_, value) => {
                if (value) {
                  onChangeField("targetType", value);
                }
              }}
              size="small"
            >
              <ToggleButton value="marque">Marques</ToggleButton>
              <ToggleButton value="modele">Modeles</ToggleButton>
              <ToggleButton value="version">Versions</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Type de vente"
              select
              value={formState.idTypeVente}
              onChange={(e) => onChangeField("idTypeVente", e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="">Selectionner un type</MenuItem>
              {typeVentes.map((type) => (
                <MenuItem key={type.id} value={`${type.id}`}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {siteContext ? (
            siteContext.siteType === "Filiale" ? (
              <Stack spacing={0.5}>
                <TextField
                  label="Filiale"
                  type="number"
                  value={formState.idFiliale}
                  onChange={(e) => onChangeField("idFiliale", e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: filialeReadOnly }}
                  disabled={filialeReadOnly}
                />
                {siteContext.siteType === "Filiale" && siteContext.siteName && (
                  <Typography variant="caption" color="text.secondary">
                    Site: {siteContext.siteName}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Stack spacing={0.5} flex={1}>
                  <TextField
                    label="Filiale"
                    type="number"
                    value={formState.idFiliale}
                    onChange={(e) => onChangeField("idFiliale", e.target.value)}
                    fullWidth
                    InputProps={{ readOnly: filialeReadOnly }}
                    disabled={filialeReadOnly}
                  />
                  {siteContext.siteName && (
                    <Typography variant="caption" color="text.secondary">
                      Filiale: {siteContext.siteName}
                    </Typography>
                  )}
                </Stack>
                <Stack spacing={0.5} flex={1}>
                  <TextField
                    label="Succursale"
                    type="number"
                    value={formState.idSuccursale}
                    onChange={(e) => onChangeField("idSuccursale", e.target.value)}
                    fullWidth
                    InputProps={{ readOnly: succursaleReadOnly }}
                    disabled={succursaleReadOnly}
                  />
                  {siteContext.siteName && (
                    <Typography variant="caption" color="text.secondary">
                      Succursale: {siteContext.siteName}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            )
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Filiale"
                type="number"
                value={formState.idFiliale}
                onChange={(e) => onChangeField("idFiliale", e.target.value)}
                fullWidth
              />
              <TextField
                label="Succursale"
                type="number"
                value={formState.idSuccursale}
                onChange={(e) => onChangeField("idSuccursale", e.target.value)}
                fullWidth
              />
            </Stack>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Marque"
              select
              value={formState.idMarque}
              onChange={(e) => onChangeField("idMarque", e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="">Selectionner une marque</MenuItem>
              {renderMenuItems(marques)}
            </TextField>
            {showModeleSelect && (
              <TextField
                label="Modele"
                select
                value={formState.idModele}
                onChange={(e) => onChangeField("idModele", e.target.value)}
                fullWidth
                required
              >
                <MenuItem value="">Selectionner un modele</MenuItem>
                {renderMenuItems(modeles)}
              </TextField>
            )}
            {showVersionSelect && (
              <TextField
                label="Version"
                select
                value={formState.idVersion}
                onChange={(e) => onChangeField("idVersion", e.target.value)}
                fullWidth
                required
              >
                <MenuItem value="">Selectionner une version</MenuItem>
                {versions.map((version) => (
                  <MenuItem key={version.id} value={`${version.id}`}>
                    {version.nom}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Prix de vente (unitaire)"
              value={formState.prixVente}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <Stack direction="row" spacing={1} alignItems="stretch">
              <TextField
                label="Volume"
                type="number"
                value={formState.volume}
                onChange={(e) => onChangeField("volume", e.target.value)}
                fullWidth
                required
                disabled={saving}
                inputProps={{ min: 0, step: 1 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <Stack spacing={0.5}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    const next = (Number(formState.volume) || 0) + 1;
                    onChangeField("volume", `${next}`);
                  }}
                  disabled={saving}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    const current = Number(formState.volume) || 0;
                    const next = Math.max(0, current - 1);
                    onChangeField("volume", `${next}`);
                  }}
                  disabled={saving || (Number(formState.volume) || 0) <= 0}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
            <TextField
              label="Chiffre d'affaires"
              value={formState.chiffreAffaires}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Annee de vente"
              type="number"
              value={formState.venteYear}
              onChange={(e) => onChangeField("venteYear", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Mois de vente"
              type="number"
              value={formState.venteMonth}
              onChange={(e) => onChangeField("venteMonth", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label={tmLabel}
              type="number"
              value={formState.margePercentage}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText={tmHelper}
            />
            <TextField
              label="Marge calculee"
              type="number"
              value={formState.marge}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button onClick={onSave} disabled={saving} variant="contained">
          {saving ? (
            <CircularProgress size={24} />
          ) : isEdit ? (
            "Mettre a jour"
          ) : (
            "Creer"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
