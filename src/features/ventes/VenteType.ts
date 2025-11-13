// src/features/ventes/VenteType.ts
import type { CreateVenteRequest, Vente } from "../../api/endpoints/ventes.api";

export type VenteTargetType = "marque" | "modele" | "version";

export interface VenteSiteContext {
  siteType: "Filiale" | "Succursale";
  filialeId: number | null;
  succursaleId: number | null;
  siteName?: string | null;
}

export interface VenteFormState {
  targetType: VenteTargetType;
  idTypeVente: string;
  prixVente: string;
  chiffreAffaires: string;
  volume: string;
  venteYear: string;
  venteMonth: string;
  idFiliale: string;
  idSuccursale: string;
  idMarque: string;
  idModele: string;
  idVersion: string;
  marge: string;
  margePercentage: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

const now = new Date();

export const defaultVenteFormState: VenteFormState = {
  targetType: "marque",
  idTypeVente: "",
  prixVente: "0",
  chiffreAffaires: "0",
  volume: "0",
  venteYear: `${now.getFullYear()}`,
  venteMonth: `${now.getMonth() + 1}`,
  idFiliale: "",
  idSuccursale: "",
  idMarque: "",
  idModele: "",
  idVersion: "",
  marge: "",
  margePercentage: "",
};

export const defaultPaginationState: PaginationState = {
  page: 1,
  pageSize: 25,
  totalRecords: 0,
  totalPages: 1,
};

const asArrayCandidates = (payload: any): unknown[] => [
  payload?.data?.data,
  payload?.data?.items,
  payload?.data?.results,
  payload?.data,
  payload?.items,
  payload?.results,
  payload,
];

export const extractVentes = (payload: any): Vente[] => {
  for (const candidate of asArrayCandidates(payload)) {
    if (Array.isArray(candidate)) {
      return candidate as Vente[];
    }
  }
  return [];
};

export const extractPaginationState = (
  payload: any,
  rowCountHint = 0
): Partial<PaginationState> => {
  const paginationCandidates = [
    payload?.pagination,
    payload?.data?.pagination,
    payload?.data?.data?.pagination,
    payload?.data?.meta,
    payload?.meta,
  ];

  const source =
    paginationCandidates.find(
      (candidate) => candidate && typeof candidate === "object"
    ) ?? null;

  if (!source) {
    return rowCountHint
      ? {
          totalRecords: rowCountHint,
          totalPages: 1,
        }
      : {};
  }

  const totalRecords =
    Number(
      source.totalRecords ??
      source.totalCount ??
      source.itemsOnPage ??
      rowCountHint ??
      0
    ) || 0;

  const pageSize =
    Number((source.pageSize ?? source.limit ?? rowCountHint) || 25) || 25;

  return {
    page: Number(source.page ?? 1) || 1,
    pageSize,
    totalRecords,
    totalPages:
      Number(source.totalPages) ||
      (pageSize > 0 ? Math.max(1, Math.ceil(totalRecords / pageSize)) : 1),
  };
};

const formatNumberInput = (value?: number | null): string =>
  value === null || value === undefined ? "" : `${value}`;

const toNumberOr = (value: string, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value: string): number | null => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const toNumber = (value: any, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const stringOr = (...values: any[]): string | undefined => {
  for (const val of values) {
    if (typeof val === "string" && val.trim().length > 0) {
      return val;
    }
  }
  return undefined;
};

export const normalizeVente = (input: any): Vente => {
  if (!input || typeof input !== "object") {
    return {
      id: 0,
      idTypeVente: 0,
      idUser: 0,
      idFiliale: null,
      idSuccursale: null,
      idMarque: null,
      idModele: null,
      idVersion: null,
      prixVente: 0,
      chiffreAffaires: 0,
      volume: 0,
      venteYear: now.getFullYear(),
      venteMonth: now.getMonth() + 1,
    };
  }

  const id = toNumber(
    input.id ?? input.Id ?? input.venteId ?? input.VenteId ?? 0,
    0
  );
  const idTypeVente = toNumber(
    input.idTypeVente ?? input.typeVenteId ?? input.TypeVenteId ?? 0,
    0
  );
  const idUser = toNumber(input.idUser ?? input.userId ?? input.UserId ?? 0, 0);

  const idFiliale = toNumber(
    input.idFiliale ?? input.filialeId ?? input.IdFiliale ?? 0,
    0
  );
  const idSuccursale = toNumber(
    input.idSuccursale ?? input.succursaleId ?? input.IdSuccursale ?? 0,
    0
  );

  const idMarque = toNumber(
    input.idMarque ?? input.marqueId ?? input.IdMarque ?? 0,
    0
  );
  const idModele = toNumber(
    input.idModele ?? input.modeleId ?? input.IdModele ?? 0,
    0
  );
  const idVersion = toNumber(
    input.idVersion ?? input.versionId ?? input.IdVersion ?? 0,
    0
  );

  return {
    id,
    idTypeVente,
    typeVenteName: stringOr(
      input.typeVenteName,
      input.type_vente_name,
      input.TypeVenteName
    ),
    idUser,
    userName: stringOr(input.userName, input.UserName),
    idFiliale: idFiliale || null,
    filialeName: stringOr(input.filialeName, input.FilialeName),
    idSuccursale: idSuccursale || null,
    succursaleName: stringOr(input.succursaleName, input.SuccursaleName),
    idMarque: idMarque || null,
    marqueName: stringOr(input.marqueName, input.MarqueName, input.nom),
    idModele: idModele || null,
    modeleName: stringOr(input.modeleName, input.ModeleName),
    idVersion: idVersion || null,
    versionName: stringOr(input.versionName, input.VersionName),
    prixVente: toNumber(input.prixVente ?? input.price ?? 0, 0),
    chiffreAffaires: toNumber(
      input.chiffreAffaires ?? input.chiffreAffaire ?? input.revenue ?? 0,
      0
    ),
    marge: toNumber(input.marge ?? input.margin ?? 0, 0),
    margePercentage: toNumber(
      input.margePercentage ?? input.tmDirect ?? input.tmInterGroupe ?? 0,
      0
    ),
    volume: toNumber(input.volume ?? input.Volume ?? 0, 0),
    venteYear: toNumber(input.venteYear ?? input.year ?? now.getFullYear()),
    venteMonth: toNumber(input.venteMonth ?? input.month ?? now.getMonth() + 1),
    ventePeriod: stringOr(input.ventePeriod, input.period),
    venteMonthName: stringOr(input.venteMonthName, input.monthName),
    createdAt: input.createdAt ?? input.CreatedAt,
    updatedAt: input.updatedAt ?? input.UpdatedAt ?? null,
    active: Boolean(input.active ?? input.Active ?? true),
    totalRecords: toNumber(
      input.totalRecords ?? input.totalrecords ?? input.TotalRecords ?? 0,
      0
    ),
  };
};

export const venteToFormState = (vente?: Vente | null): VenteFormState => {
  if (!vente) {
    return { ...defaultVenteFormState };
  }
  const targetType: VenteTargetType = vente.idVersion
    ? "version"
    : vente.idModele
    ? "modele"
    : "marque";
  return {
    targetType,
    idTypeVente: `${vente.idTypeVente ?? ""}`,
    prixVente: formatNumberInput(vente.prixVente) || "0",
    chiffreAffaires: formatNumberInput(vente.chiffreAffaires) || "0",
    volume: formatNumberInput(vente.volume) || "0",
    venteYear: formatNumberInput(vente.venteYear),
    venteMonth: formatNumberInput(vente.venteMonth),
    idFiliale: formatNumberInput(vente.idFiliale),
    idSuccursale: formatNumberInput(vente.idSuccursale),
    idMarque: formatNumberInput(vente.idMarque),
    idModele: formatNumberInput(vente.idModele),
    idVersion: formatNumberInput(vente.idVersion),
    marge: formatNumberInput(vente.marge ?? null),
    margePercentage: formatNumberInput(vente.margePercentage ?? null),
  };
};

export const buildVentePayload = (state: VenteFormState): CreateVenteRequest => ({
  idTypeVente: toNumberOr(state.idTypeVente),
  prixVente: toNumberOr(state.prixVente),
  chiffreAffaires: toNumberOr(state.chiffreAffaires),
  volume: toNumberOr(state.volume),
  venteYear: toNumberOr(state.venteYear, new Date().getFullYear()),
  venteMonth: toNumberOr(state.venteMonth, 1),
  idFiliale: toNullableNumber(state.idFiliale),
  idSuccursale: toNullableNumber(state.idSuccursale),
  idMarque: toNullableNumber(state.idMarque),
  idModele:
    state.targetType === "modele" || state.targetType === "version"
      ? toNullableNumber(state.idModele)
      : null,
  idVersion:
    state.targetType === "version" ? toNullableNumber(state.idVersion) : null,
  marge: toNullableNumber(state.marge),
  margePercentage: toNullableNumber(state.margePercentage),
});
