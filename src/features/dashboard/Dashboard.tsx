// src/features/dashboard/Dashboard.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Alert,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/endpoints/auth.api';
import { groupementApi } from '../../api/endpoints/groupement.api';
import { filialeApi, type Filiale } from '../../api/endpoints/filiale.api';
import { succursaleApi, type Succursale } from '../../api/endpoints/succursale.api';
import { marqueApi, type Marque } from '../../api/endpoints/marque.api';
import { usersiteApi } from '../../api/endpoints/usersite.api';
import type { UsersListResponse } from '../../types/user.types';
import type { Groupement, UserSite } from '../../types/usersite.types';

type CountStat = {
  total: number;
  active: number;
};

interface DashboardStats {
  users: CountStat;
  groupements: CountStat;
  filiales: CountStat;
  succursales: CountStat;
  marques: CountStat;
  sites: CountStat;
  userSites: CountStat;
}

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, active: 0 },
    groupements: { total: 0, active: 0 },
    filiales: { total: 0, active: 0 },
    succursales: { total: 0, active: 0 },
    marques: { total: 0, active: 0 },
    sites: { total: 0, active: 0 },
    userSites: { total: 0, active: 0 },
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const welcomeName = user?.full_name || user?.username || 'there';

  const formatNumber = useCallback((value: number) => value.toLocaleString('fr-MA'), []);

  const loadStats = useCallback(async () => {
    try {
      setStatsError(null);
      setStatsLoading(true);

      const [
        usersAll,
        usersActive,
        groupements,
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

      const groupementList: Groupement[] = Array.isArray(groupements) ? groupements : [];
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
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
      setStatsError(
        error?.response?.data?.error ||
          error?.message ||
          'Failed to load dashboard statistics'
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statsCards = useMemo(
    () => [
      {
        label: 'Utilisateurs',
        value: statsLoading ? '...' : formatNumber(stats.users.total),
        change: statsLoading ? '' : `${formatNumber(stats.users.active)} actifs`,
        icon: <PeopleAltOutlinedIcon />,
        trend: 'Comptes enregistres',
        gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(56,189,248,0.28) 100%)',
        iconBg: 'rgba(59,130,246,0.2)',
      },
      {
        label: 'Sites',
        value: statsLoading ? '...' : formatNumber(stats.sites.total),
        change: statsLoading
          ? ''
          : `${formatNumber(stats.filiales.total)} filiales | ${formatNumber(
              stats.succursales.total
            )} succursales`,
        icon: <StorefrontOutlinedIcon />,
        trend: 'Implantations suivies',
        gradient: 'linear-gradient(135deg, rgba(14,116,144,0.2) 0%, rgba(45,212,191,0.32) 100%)',
        iconBg: 'rgba(45,212,191,0.25)',
      },
      {
        label: 'Marques',
        value: statsLoading ? '...' : formatNumber(stats.marques.total),
        change: statsLoading ? '' : `${formatNumber(stats.marques.active)} actives`,
        icon: <DirectionsCarFilledOutlinedIcon />,
        trend: 'Catalogue vehicules',
        gradient: 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(249,115,22,0.24) 100%)',
        iconBg: 'rgba(245,158,11,0.25)',
      },
      {
        label: 'Groupements',
        value: statsLoading ? '...' : formatNumber(stats.groupements.total),
        change: statsLoading ? '' : `${formatNumber(stats.groupements.active)} actifs`,
        icon: <BusinessOutlinedIcon />,
        trend: 'Entites operationnelles',
        gradient: 'linear-gradient(135deg, rgba(79,70,229,0.16) 0%, rgba(129,140,248,0.28) 100%)',
        iconBg: 'rgba(99,102,241,0.25)',
      },
    ],
    [formatNumber, stats, statsLoading]
  );

  const operationsMetrics = useMemo(() => {
    if (statsLoading) {
      return [
        {
          label: 'Utilisateurs actifs',
          value: 'Chargement...',
          progress: 0,
          tone: 'primary',
        },
        {
          label: 'Sites operationnels',
          value: 'Chargement...',
          progress: 0,
          tone: 'success',
        },
        {
          label: 'Marques actives',
          value: 'Chargement...',
          progress: 0,
          tone: 'warning',
        },
      ];
    }

    const userProgress =
      stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0;
    const siteProgress =
      stats.sites.total > 0 ? Math.round((stats.sites.active / stats.sites.total) * 100) : 0;
    const marqueProgress =
      stats.marques.total > 0 ? Math.round((stats.marques.active / stats.marques.total) * 100) : 0;

    return [
      {
        label: 'Utilisateurs actifs',
        value: `${formatNumber(stats.users.active)} / ${formatNumber(stats.users.total)}`,
        progress: userProgress,
        tone: 'primary',
      },
      {
        label: 'Sites operationnels',
        value: `${formatNumber(stats.sites.active)} / ${formatNumber(stats.sites.total)}`,
        progress: siteProgress,
        tone: 'success',
      },
      {
        label: 'Marques actives',
        value: `${formatNumber(stats.marques.active)} / ${formatNumber(stats.marques.total)}`,
        progress: marqueProgress,
        tone: 'warning',
      },
    ];
  }, [formatNumber, stats, statsLoading]);

  const priorityUpdates = useMemo(
    () => [
      {
        title: 'Groupements',
        detail: statsLoading
          ? 'Calcul en cours...'
          : `${formatNumber(stats.groupements.active)} sur ${formatNumber(
              stats.groupements.total
            )} groupements sont actifs.`,
      },
      {
        title: 'Filiales & Succursales',
        detail: statsLoading
          ? 'Calcul en cours...'
          : `${formatNumber(stats.filiales.active)} / ${formatNumber(
              stats.filiales.total
            )} filiales actives | ${formatNumber(stats.succursales.active)} / ${formatNumber(
              stats.succursales.total
            )} succursales actives.`,
      },
      {
        title: 'Affectations utilisateurs-sites',
        detail: statsLoading
          ? 'Calcul en cours...'
          : `${formatNumber(stats.userSites.active)} affectations actives sur ${formatNumber(
              stats.userSites.total
            )} au total.`,
      },
    ],
    [formatNumber, stats, statsLoading]
  );

  const siteAvailabilityPercent = useMemo(
    () =>
      stats.sites.total > 0 ? (stats.sites.active / stats.sites.total) * 100 : 0,
    [stats.sites.active, stats.sites.total]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #38bdf8 100%)',
          color: 'common.white',
          boxShadow: '0 32px 80px rgba(30, 64, 175, 0.35)',
        }}
      >
        {statsLoading && (
          <LinearProgress
            color="inherit"
            sx={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: 0.5 }}
          />
        )}
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' viewBox=\'0 0 300 300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23ffffff\' stroke-opacity=\'0.35\' stroke-width=\'0.5\'%3E%3Cpath d=\'M150 0L0 75l150 75 150-75z\'/%3E%3Cpath d=\'M150 150L0 225l150 75 150-75z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={4}>
          <Box sx={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.8 }}>
              Welcome back
            </Typography>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {welcomeName}
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 420, opacity: 0.9 }}>
              Your operations overview is ready. Track performance, monitor security, and stay ahead with real-time insights across your Autohall ecosystem.
            </Typography>
            <Stack direction="row" spacing={2} mt={3}>
              <Chip
                icon={<TrendingUpIcon sx={{ color: 'inherit !important' }} />}
                label={
                  statsLoading
                    ? 'Mise a jour des utilisateurs...'
                    : `${formatNumber(stats.users.active)} utilisateurs actifs`
                }
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                  backdropFilter: 'blur(6px)',
                }}
              />
              <Chip
                icon={<TimelineIcon sx={{ color: 'inherit !important' }} />}
                label={
                  statsLoading
                    ? 'Chargement des sites...'
                    : `${formatNumber(stats.sites.total)} sites suivis`
                }
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                  backdropFilter: 'blur(6px)',
                }}
              />
            </Stack>
          </Box>
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: { xs: '100%', md: 'auto' },
              minWidth: { md: 260 },
            }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.16)',
                color: 'inherit',
                  minWidth: 240,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  Couverture des sites actifs
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {statsLoading ? '--' : `${siteAvailabilityPercent.toFixed(1)}%`}
                </Typography>
                <Box mt={2}>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Sites actifs / total
                  </Typography>
                  <LinearProgress
                    variant={statsLoading ? 'indeterminate' : 'determinate'}
                    value={statsLoading ? undefined : Math.min(siteAvailabilityPercent, 100)}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 999,
                      bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                        bgcolor: 'common.white',
                      },
                    }}
                  />
                  {!statsLoading && (
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                      {formatNumber(stats.sites.active)} actifs sur {formatNumber(stats.sites.total)}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
        </Stack>
      </Paper>

      {statsError && (
        <Alert
          severity="error"
          onClose={() => setStatsError(null)}
          sx={{ borderRadius: 2 }}
        >
          {statsError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {statsCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                background: stat.gradient,
                boxShadow: '0 24px 50px rgba(15, 23, 42, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: stat.iconBg,
                    color: '#0f172a',
                    width: 44,
                    height: 44,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.75 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={stat.change ? `${stat.change} ${stat.trend}` : stat.trend}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: 'rgba(15, 23, 42, 0.08)',
                  color: '#0f172a',
                  fontWeight: 600,
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6">Operations Pulse</Typography>
                <Typography variant="body2" color="text.secondary">
                  Key metrics from the past 24 hours
                </Typography>
              </Box>
              <Chip
                icon={<NotificationsActiveOutlinedIcon />}
                label="Auto-refresh"
                size="small"
                sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: 'primary.main' }}
              />
            </Stack>

            <Stack spacing={2.5} mt={3}>
              {operationsMetrics.map((metric) => (
                <Box key={metric.label}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2">{metric.label}</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {metric.value}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant={statsLoading ? 'indeterminate' : 'determinate'}
                    value={statsLoading ? undefined : metric.progress}
                    color={metric.tone as 'primary' | 'success' | 'warning'}
                    sx={{ height: 8, borderRadius: 999 }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Typography variant="h6">Priority Updates</Typography>
            <Stack spacing={2}>
              {priorityUpdates.map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(15, 23, 42, 0.04)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.detail}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};


