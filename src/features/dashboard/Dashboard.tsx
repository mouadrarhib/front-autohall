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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        value: statsLoading ? '--' : formatNumber(stats.users.total),
        descriptor: statsLoading ? 'Calcul en cours...' : `${formatNumber(stats.users.active)} actifs`,
        caption: 'Comptes enregistres',
        icon: <PeopleAltOutlinedIcon />,
        gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)',
        avatarBg: 'rgba(59,130,246,0.18)',
      },
      {
        label: 'Sites',
        value: statsLoading ? '--' : formatNumber(stats.sites.total),
        descriptor: statsLoading
          ? 'Calcul en cours...'
          : `${formatNumber(stats.filiales.total)} filiales | ${formatNumber(
              stats.succursales.total
            )} succursales`,
        caption: 'Implantations suivies',
        icon: <StorefrontOutlinedIcon />,
        gradient: 'linear-gradient(135deg, #ccfbf1 0%, #a5f3fc 100%)',
        avatarBg: 'rgba(14,116,144,0.18)',
      },
      {
        label: 'Marques',
        value: statsLoading ? '--' : formatNumber(stats.marques.total),
        descriptor: statsLoading
          ? 'Calcul en cours...'
          : `${formatNumber(stats.marques.active)} actives`,
        caption: 'Catalogue vehicules',
        icon: <DirectionsCarFilledOutlinedIcon />,
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
        avatarBg: 'rgba(245,158,11,0.22)',
      },
      {
        label: 'Groupements',
        value: statsLoading ? '--' : formatNumber(stats.groupements.total),
        descriptor: statsLoading
          ? 'Calcul en cours...'
          : `${formatNumber(stats.groupements.active)} actifs`,
        caption: 'Entites operationnelles',
        icon: <BusinessOutlinedIcon />,
        gradient: 'linear-gradient(135deg, #ede9fe 0%, #c7d2fe 100%)',
        avatarBg: 'rgba(109,40,217,0.18)',
      },
    ],
    [formatNumber, stats, statsLoading]
  );

  const heroQuickStats = useMemo(
    () => [
      {
        label: statsLoading
          ? 'Actualisation...'
          : `${formatNumber(stats.users.active)} utilisateurs actifs`,
        icon: <TrendingUpIcon fontSize="small" />,
      },
      {
        label: statsLoading ? 'Chargement...' : `${formatNumber(stats.sites.total)} sites suivis`,
        icon: <TimelineIcon fontSize="small" />,
      },
    ],
    [formatNumber, stats.users.active, stats.sites.total, statsLoading]
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 3, md: 4 },
        width: '100%',
      }}
    >
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(130deg, #1e3a8a 0%, #2563eb 45%, #22d3ee 100%)',
          color: 'common.white',
          boxShadow: '0 32px 80px rgba(30, 64, 175, 0.35)',
        }}
      >
        {statsLoading && (
          <LinearProgress
            color="inherit"
            sx={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: 0.45 }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0, transparent 60%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.2) 0, transparent 55%)',
          }}
        />
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="overline" sx={{ letterSpacing: 4, opacity: 0.75 }}>
                Welcome back
              </Typography>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                fontWeight={700}
                sx={{ lineHeight: 1.1 }}
              >
                {welcomeName}
              </Typography>
              <Typography
                variant="body1"
                sx={{ maxWidth: 520, opacity: 0.92, lineHeight: 1.6 }}
              >
                Votre tableau de bord est pret. Visualisez vos indicateurs, suivez les sites et
                marques actifs, et gardez une longueur d&apos;avance sur l&apos;ecosysteme
                Autohall.
              </Typography>
              <Grid container spacing={1.2} sx={{ pt: 1 }}>
                {heroQuickStats.map((item) => (
                  <Grid item xs={12} sm="auto" key={item.label}>
                    <Chip
                      icon={item.icon}
                      label={item.label}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'inherit',
                        backdropFilter: 'blur(8px)',
                        fontWeight: 600,
                        px: 1.6,
                        height: 36,
                        borderRadius: 999,
                        width: { xs: '100%', sm: 'auto' },
                        '& .MuiChip-icon': {
                          color: 'inherit',
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)',
                color: 'inherit',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 18px 40px rgba(14, 23, 42, 0.35)',
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.78 }}>
                Couverture des sites actifs
              </Typography>
              <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight={700}>
                {statsLoading ? '--' : `${siteAvailabilityPercent.toFixed(1)}%`}
              </Typography>
              <Box mt={2}>
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  Sites actifs / total
                </Typography>
                <LinearProgress
                  variant={statsLoading ? 'indeterminate' : 'determinate'}
                  value={statsLoading ? undefined : Math.min(siteAvailabilityPercent, 100)}
                  sx={{
                    mt: 1.2,
                    height: 10,
                    borderRadius: 999,
                    bgcolor: 'rgba(255,255,255,0.28)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      bgcolor: '#fff',
                    },
                  }}
                />
                {!statsLoading && (
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.78, display: 'block', mt: 1.2, fontWeight: 600 }}
                  >
                    {formatNumber(stats.sites.active)} actifs sur {formatNumber(stats.sites.total)}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
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

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {statsCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                height: '100%',
                background: stat.gradient,
                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ pr: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: stat.avatarBg,
                    color: '#0f172a',
                    width: 44,
                    height: 44,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.7, fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ lineHeight: 1, fontSize: { xs: '1.9rem', md: '2.1rem' } }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              </Stack>
              <Typography
                variant="body2"
                sx={{ opacity: 0.72, lineHeight: 1.6, minHeight: 32 }}
              >
                {stat.descriptor}
              </Typography>
              <Chip
                label={stat.caption}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: 'rgba(15, 23, 42, 0.08)',
                  color: '#0f172a',
                  fontWeight: 600,
                  mt: 'auto',
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              height: '100%',
              background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
              boxShadow: '0 16px 36px rgba(15, 23, 42, 0.07)',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Indicateurs operationnels
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Evolution des 24 dernieres heures
                </Typography>
              </Box>
              <Chip
                icon={<NotificationsActiveOutlinedIcon />}
                label="Actualisation auto"
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
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              height: '100%',
              background: 'linear-gradient(135deg, #fdf4ff 0%, #f5f3ff 100%)',
              boxShadow: '0 16px 36px rgba(15, 23, 42, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#312e81' }}>
              Informations importantes
            </Typography>
            <Stack spacing={1.5}>
              {priorityUpdates.map((item) => (
                <Paper
                  key={item.title}
                  sx={{
                    p: 2.25,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1e1b4b' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.detail}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};




