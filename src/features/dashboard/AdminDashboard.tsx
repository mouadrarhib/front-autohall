import React, { useCallback, useEffect, useState } from 'react';
import { authApi } from '../../api/endpoints/auth.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { filialeApi, type Filiale } from '../../api/endpoints/filiale.api';
import { succursaleApi, type Succursale } from '../../api/endpoints/succursale.api';
import { marqueApi, type Marque } from '../../api/endpoints/marque.api';
import { usersiteApi } from '../../api/endpoints/usersite.api';
import type { UsersListResponse } from '../../types/user.types';
import type { Groupement, UserSite } from '../../types/usersite.types';
import { useAuthStore } from '../../store/authStore';
import { DashboardContent } from './DashboardContent';
import { DashboardStats } from './dashboardTypes';

const emptyStats: DashboardStats = {
  users: { total: 0, active: 0 },
  groupements: { total: 0, active: 0 },
  filiales: { total: 0, active: 0 },
  succursales: { total: 0, active: 0 },
  marques: { total: 0, active: 0 },
  sites: { total: 0, active: 0 },
  userSites: { total: 0, active: 0 },
};

export const AdminDashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const welcomeName = user?.full_name || user?.username || 'there';
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
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
      ] = await Promise.all([
        authApi.getAllUsers({ active_only: false }),
        authApi.getAllUsers({ active_only: true }),
        groupementApi.listGroupements(),
        filialeApi.listFiliales({ page: 1, pageSize: 1000 }),
        succursaleApi.listSuccursales({ page: 1, pageSize: 1000 }),
        marqueApi.list({ onlyActive: false, page: 1, pageSize: 1000 }),
        usersiteApi.listUserSites(),
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
      console.error('Failed to load admin dashboard stats:', err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Failed to load dashboard statistics'
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
      statsError={error}
      onClearError={() => setError(null)}
      mode="admin"
    />
  );
};
