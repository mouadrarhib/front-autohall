import React, { useCallback, useEffect, useState } from 'react';
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

export const AdminDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const welcomeName = user?.full_name || user?.username || 'la';
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [periodKpis, setPeriodKpis] = useState<DashboardPeriodKpis>(emptyPeriodKpis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
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

      const usersAllList = (usersAll as UsersListResponse)?.data ?? [];
      const totalUsers = (usersAll as UsersListResponse)?.total ?? usersAllList.length;
      const activeUsersList = (usersActive as UsersListResponse)?.data ?? [];
      const activeUsers = (usersActive as UsersListResponse)?.total ?? activeUsersList.length;

      const groupementList: Groupement[] = Array.isArray(groupementsRes) ? groupementsRes : [];
      const totalGroupements = groupementList.length;
      const activeGroupements = groupementList.filter((g) => g.active).length;

      const filiales: Filiale[] = filialesRes?.data ?? [];
      const totalFiliales =
        filialesRes?.pagination?.totalCount ??
        (filialesRes?.pagination as { totalRecords?: number } | undefined)?.totalRecords ??
        filiales.length;
      const activeFiliales = filiales.filter((f) => f.active).length;

      const succursales: Succursale[] = succursalesRes?.data ?? [];
      const totalSuccursales =
        succursalesRes?.pagination?.totalCount ??
        (succursalesRes?.pagination as { totalRecords?: number } | undefined)?.totalRecords ??
        succursales.length;
      const activeSuccursales = succursales.filter((s) => s.active).length;

      const marques: Marque[] = marquesRes?.data ?? [];
      const totalMarques = marquesRes?.pagination?.totalRecords ?? marques.length;
      const activeMarques = marques.filter((m) => m.active).length;

      const userSites: UserSite[] = Array.isArray(userSitesRes) ? userSitesRes : [];
      const totalUserSites = userSites.length;
      const activeUserSites = userSites.filter((site) => site.active !== false).length;

      const totalSites = totalFiliales + totalSuccursales;
      const activeSites = activeFiliales + activeSuccursales;

      const periodes = extractArray<Periode>(periodesRes?.data);
      const activePeriode = getLatestPeriode(periodes);

      if (!activePeriode) {
        setPeriodKpis(emptyPeriodKpis);
      } else {
        const periodBounds = getPeriodMonthBounds(activePeriode);
        const [objectifsRes, ventesRes] = await Promise.all([
          objectifApi.listObjectifsView({ periodeId: activePeriode.id }),
          ventesApi.listVentes({
            page: 1,
            pageSize: 1,
            ...periodBounds,
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
        users: { total: totalUsers, active: activeUsers },
        groupements: { total: totalGroupements, active: activeGroupements },
        filiales: { total: totalFiliales, active: activeFiliales },
        succursales: { total: totalSuccursales, active: activeSuccursales },
        marques: { total: totalMarques, active: activeMarques },
        sites: { total: totalSites, active: activeSites },
        userSites: { total: totalUserSites, active: activeUserSites },
      });
    } catch (err: any) {
      console.error('Echec du chargement des statistiques admin:', err);
      setPeriodKpis(emptyPeriodKpis);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Impossible de charger les statistiques du tableau de bord.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <DashboardContent
      welcomeName={welcomeName}
      stats={stats}
      statsLoading={loading}
      periodKpis={periodKpis}
      periodKpisLoading={loading}
      statsError={error}
      onClearError={() => setError(null)}
      mode="admin"
    />
  );
};
