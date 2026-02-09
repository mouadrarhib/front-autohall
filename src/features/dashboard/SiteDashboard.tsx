import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../api/endpoints/auth.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { filialeApi, type Filiale } from '../../api/endpoints/filiale.api';
import { succursaleApi, type Succursale } from '../../api/endpoints/succursale.api';
import { marqueApi, type Marque } from '../../api/endpoints/marque.api';
import { usersiteApi } from '../../api/endpoints/usersite.api';
import { objectifApi } from '../../api/endpoints/objectif.api';
import { periodeApi, type Periode } from '../../api/endpoints/periode.api';
import { ventesApi } from '../../api/endpoints/ventes.api';
import type { UsersListResponse } from '../../types/user.types';
import type { Groupement, UserSite } from '../../types/usersite.types';
import { useAuthStore } from '../../store/authStore';
import { DashboardContent } from './DashboardContent';
import { DashboardPeriodKpis, DashboardStats } from './dashboardTypes';

const emptyStats: DashboardStats = {
  users: { total: 0, active: 0 },
  groupements: { total: 0, active: 0 },
  filiales: { total: 0, active: 0 },
  succursales: { total: 0, active: 0 },
  marques: { total: 0, active: 0 },
  sites: { total: 0, active: 0 },
  userSites: { total: 0, active: 0 },
};

const emptyPeriodKpis: DashboardPeriodKpis = {
  periodLabel: 'Aucune periode active',
  objectifsCount: 0,
  ventesCount: 0,
};

const getLatestPeriode = (periodes: Periode[]): Periode | null => {
  if (!Array.isArray(periodes) || periodes.length === 0) {
    return null;
  }
  return [...periodes].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (b.month !== a.month) return b.month - a.month;
    if (b.week !== a.week) return b.week - a.week;
    return b.id - a.id;
  })[0];
};

const getPeriodMonthBounds = (periode: Periode): { yearFrom: number; yearTo: number; monthFrom: number; monthTo: number } => {
  const start = new Date(periode.startedDate);
  const end = new Date(periode.endDate);

  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    return {
      yearFrom: start.getFullYear(),
      yearTo: end.getFullYear(),
      monthFrom: start.getMonth() + 1,
      monthTo: end.getMonth() + 1,
    };
  }

  return {
    yearFrom: periode.year,
    yearTo: periode.year,
    monthFrom: periode.month,
    monthTo: periode.month,
  };
};

const extractArray = <T,>(payload: any): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const toNumberOrNull = (value: any): number | null => {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const SiteDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const userDetails = useAuthStore((state) => state.userDetails);
  const welcomeName = user?.full_name || user?.username || 'there';

  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [periodKpis, setPeriodKpis] = useState<DashboardPeriodKpis>(emptyPeriodKpis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignmentResolved, setAssignmentResolved] = useState(false);
  const [userSiteAssignment, setUserSiteAssignment] = useState<UserSite | null>(null);

  const fallbackAssignment = useMemo((): UserSite | null => {
    const siteId =
      toNumberOrNull(userDetails?.siteId) ??
      toNumberOrNull(userDetails?.raw?.SiteId) ??
      toNumberOrNull(userDetails?.raw?.siteId) ??
      toNumberOrNull((user as any)?.siteId) ??
      toNumberOrNull((user as any)?.SiteId);

    const groupementName =
      (userDetails?.groupementType ??
        userDetails?.raw?.GroupementType ??
        (user as any)?.groupement_type ??
        (user as any)?.GroupementType ??
        '') as string;

    if (!siteId || siteId <= 0 || !groupementName) {
      return null;
    }

    const normalizedGroupement = groupementName.trim().toLowerCase();
    const siteType: 'Filiale' | 'Succursale' =
      normalizedGroupement === 'succursale' ? 'Succursale' : 'Filiale';

    const assignmentId =
      toNumberOrNull(userDetails?.userSiteId) ??
      toNumberOrNull(userDetails?.raw?.UserSiteId) ??
      toNumberOrNull((user as any)?.idUserSite) ??
      0;

    const groupementId =
      toNumberOrNull(userDetails?.raw?.IdGroupement) ??
      toNumberOrNull(userDetails?.raw?.GroupementId) ??
      0;

    const siteName =
      (userDetails?.siteName ??
        userDetails?.raw?.SiteName ??
        (user as any)?.site_name ??
        (user as any)?.SiteName ??
        '') as string;

    const userSiteActive =
      (userDetails?.userSiteActive ??
        userDetails?.raw?.UserSiteActive ??
        (user as any)?.UserSiteActive ??
        (user as any)?.userSiteActive ??
        true) as boolean;

    return {
      id: assignmentId ?? 0,
      idGroupement: groupementId ?? 0,
      groupement_name: groupementName,
      idSite: siteId,
      site_name: siteName,
      site_type: siteType,
      active: Boolean(userSiteActive),
    };
  }, [user, userDetails]);

  const resolveAssignment = useCallback(async (): Promise<UserSite | null> => {
    if (!fallbackAssignment) return null;

    let resolved = fallbackAssignment;

    const needsHydration =
      !resolved.site_name ||
      !resolved.groupement_name ||
      !resolved.idGroupement ||
      resolved.idGroupement <= 0;

    if (needsHydration && resolved.id > 0) {
      try {
        const detailed = await usersiteApi.getUserSiteById(resolved.id);
        resolved = { ...resolved, ...detailed };
      } catch (err) {
        console.error('Echec lors du chargement de l affectation site par id', err);
      }
    }

    if (
      (!resolved.site_name || !resolved.groupement_name || !resolved.idGroupement) &&
      resolved.idSite > 0
    ) {
      try {
        const matches = await usersiteApi.searchUserSites({
          idSite: resolved.idSite,
          onlyActive: true,
        });
        const match =
          matches.find((item) => item.id === resolved.id) ||
          matches.find((item) => item.idGroupement === resolved.idGroupement) ||
          matches[0];
        if (match) {
          resolved = { ...resolved, ...match };
        }
      } catch (err) {
        console.error('Echec lors de la resolution de l affectation site par recherche', err);
      }
    }

    return resolved;
  }, [fallbackAssignment]);

  const loadStats = useCallback(async () => {
    if (!assignmentResolved) return;

    if (!userSiteAssignment) {
      setStats(emptyStats);
      setPeriodKpis(emptyPeriodKpis);
      setError("Aucune affectation de site active n'a ete trouvee pour cet utilisateur.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const [
        usersAll,
        usersActive,
        groupementsRes,
        filialesRes,
        succursalesRes,
        marquesRes,
        userSitesRes,
        periodesRes,
      ] = await Promise.all([
        authApi.getAllUsers({ active_only: false }),
        authApi.getAllUsers({ active_only: true }),
        groupementApi.listGroupements(),
        filialeApi.listFiliales({ page: 1, pageSize: 1000 }),
        succursaleApi.listSuccursales({ page: 1, pageSize: 1000 }),
        marqueApi.list({ onlyActive: false, page: 1, pageSize: 1000 }),
        usersiteApi.listUserSites(),
        periodeApi.listActivePeriodes({ page: 1, pageSize: 1000 }),
      ]);

      const siteId = Number(userSiteAssignment.idSite);
      const groupementId = Number(userSiteAssignment.idGroupement);
      const groupementName = userSiteAssignment.groupement_name?.trim().toLowerCase() ?? '';
      const siteType = userSiteAssignment.site_type;

      const usersAllList = (usersAll as UsersListResponse)?.data ?? [];
      const activeUsersList = (usersActive as UsersListResponse)?.data ?? [];

      const scopedUsersAllList = usersAllList.filter((item) => {
        const site = Number((item as any)?.SiteId ?? (item as any)?.siteId ?? 0);
        return site === siteId;
      });

      const scopedActiveUsersList = activeUsersList.filter((item) => {
        const site = Number((item as any)?.SiteId ?? (item as any)?.siteId ?? 0);
        return site === siteId;
      });

      const groupementList: Groupement[] = Array.isArray(groupementsRes) ? groupementsRes : [];
      const scopedGroupements = groupementList.filter((groupement) => {
        if (groupementId > 0) {
          return groupement.id === groupementId;
        }
        return groupement.name?.trim().toLowerCase() === groupementName;
      });

      const filiales: Filiale[] = filialesRes?.data ?? [];
      const scopedFiliales =
        siteType === 'Filiale'
          ? filiales.filter((filiale) => Number(filiale.id) === siteId)
          : [];

      const succursales: Succursale[] = succursalesRes?.data ?? [];
      const scopedSuccursales =
        siteType === 'Succursale'
          ? succursales.filter((succursale) => Number(succursale.id) === siteId)
          : [];

      const marques: Marque[] = marquesRes?.data ?? [];
      const scopedMarques =
        siteType === 'Filiale'
          ? marques.filter((marque) => Number((marque as any)?.idFiliale ?? 0) === siteId)
          : marques.filter((marque) => Number((marque as any)?.idSuccursale ?? 0) === siteId);

      const userSites: UserSite[] = Array.isArray(userSitesRes) ? userSitesRes : [];
      const scopedUserSites = userSites.filter((site) => Number(site.idSite) === siteId);

      const totalFiliales = scopedFiliales.length;
      const activeFiliales = scopedFiliales.filter((f) => f.active).length;
      const totalSuccursales = scopedSuccursales.length;
      const activeSuccursales = scopedSuccursales.filter((s) => s.active).length;

      const totalSites = totalFiliales + totalSuccursales;
      const activeSites = activeFiliales + activeSuccursales;

      const periodes = extractArray<Periode>(periodesRes?.data);
      const activePeriode = getLatestPeriode(periodes);

      if (!activePeriode) {
        setPeriodKpis(emptyPeriodKpis);
      } else {
        const periodBounds = getPeriodMonthBounds(activePeriode);
        const ventesScopeParams: Record<string, number> =
          siteType === 'Filiale'
            ? { idFiliale: siteId }
            : { idSuccursale: siteId };

        const [objectifsRes, ventesRes] = await Promise.all([
          objectifApi.listObjectifsView({
            periodeId: activePeriode.id,
            siteId,
          }),
          ventesApi.listVentes({
            page: 1,
            pageSize: 1,
            ...periodBounds,
            ...ventesScopeParams,
          }),
        ]);

        const objectifsCount = extractArray(objectifsRes?.data).length;
        const ventesCount =
          Number(
            (ventesRes as any)?.data?.pagination?.totalCount ??
              (ventesRes as any)?.data?.pagination?.totalRecords ??
              (ventesRes as any)?.data?.pagination?.itemsOnPage ??
              0
          ) || 0;

        setPeriodKpis({
          periodLabel:
            (activePeriode.name && activePeriode.name.trim().length > 0
              ? activePeriode.name
              : `${activePeriode.month}/${activePeriode.year}`) || 'Periode active',
          objectifsCount,
          ventesCount,
        });
      }

      setStats({
        users: { total: scopedUsersAllList.length, active: scopedActiveUsersList.length },
        groupements: {
          total: scopedGroupements.length,
          active: scopedGroupements.filter((g) => g.active).length,
        },
        filiales: { total: totalFiliales, active: activeFiliales },
        succursales: { total: totalSuccursales, active: activeSuccursales },
        marques: {
          total: scopedMarques.length,
          active: scopedMarques.filter((m) => m.active).length,
        },
        sites: { total: totalSites, active: activeSites },
        userSites: {
          total: scopedUserSites.length,
          active: scopedUserSites.filter((site) => site.active !== false).length,
        },
      });
    } catch (err: any) {
      console.error('Echec du chargement des statistiques du site:', err);
      setPeriodKpis(emptyPeriodKpis);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Impossible de charger les statistiques du tableau de bord.'
      );
    } finally {
      setLoading(false);
    }
  }, [assignmentResolved, userSiteAssignment]);

  useEffect(() => {
    let cancelled = false;

    const hydrateAssignment = async () => {
      setAssignmentResolved(false);
      setLoading(true);

      if (!user) {
        if (!cancelled) {
          setUserSiteAssignment(null);
          setAssignmentResolved(true);
          setLoading(false);
        }
        return;
      }

      const resolved = await resolveAssignment();

      if (!cancelled) {
        setUserSiteAssignment(resolved);
        setAssignmentResolved(true);
        setLoading(false);
      }
    };

    void hydrateAssignment();

    return () => {
      cancelled = true;
    };
  }, [resolveAssignment, user]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const siteDisplayName =
    (userSiteAssignment?.site_name?.trim() ||
      fallbackAssignment?.site_name?.trim() ||
      'Site non attribue') ?? 'Site non attribue';
  const groupementDisplayName =
    (userSiteAssignment?.groupement_name?.trim() ||
      fallbackAssignment?.groupement_name?.trim() ||
      'Groupement non attribue') ?? 'Groupement non attribue';
  const siteDisplayType =
    userSiteAssignment?.site_type ?? fallbackAssignment?.site_type ?? null;

  return (
    <DashboardContent
      welcomeName={welcomeName}
      stats={stats}
      statsLoading={loading}
      periodKpis={periodKpis}
      periodKpisLoading={loading}
      statsError={error}
      onClearError={() => setError(null)}
      mode="site"
      siteName={siteDisplayName}
      groupementName={groupementDisplayName}
      siteType={siteDisplayType}
    />
  );
};
