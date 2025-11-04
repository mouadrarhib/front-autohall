import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { DashboardStats } from './dashboardTypes';

interface DashboardContentProps {
  welcomeName: string;
  stats: DashboardStats;
  statsLoading: boolean;
  statsError: string | null;
  onClearError: () => void;
  mode: 'admin' | 'site';
  siteName?: string;
  groupementName?: string;
  siteType?: string | null;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  welcomeName,
  stats,
  statsLoading,
  statsError,
  onClearError,
  mode,
  siteName,
  groupementName,
  siteType,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatNumber = useCallback((value: number) => value.toLocaleString('fr-MA'), []);

  const statsCards = useMemo(
    () => {
      const baseCards = [
        {
          label: 'Utilisateurs',
          value: statsLoading ? '--' : formatNumber(stats.users.total),
          descriptor: statsLoading
            ? 'Calcul en cours...'
            : `${formatNumber(stats.users.active)} actifs`,
          caption: 'Comptes enregistres',
          icon: <PeopleAltOutlinedIcon />,
          gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)',
          avatarBg: 'rgba(59,130,246,0.18)',
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
      ];

      if (mode === 'admin') {
        return [
          baseCards[0],
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
          baseCards[1],
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
        ];
      }

      const siteLabel = (siteName ?? '').trim() || 'Site non attribue';
      const groupementLabel = (groupementName ?? '').trim() || 'Groupement non attribue';
      const siteDescriptor =
        siteType && siteType.length > 0
          ? `Type: ${siteType}`
          : stats.sites.active > 0
          ? 'Affectation active'
          : 'Affectation inactive';
      const groupementDescriptor =
        stats.groupements.active > 0 ? 'Groupement actif' : 'Groupement inactif';

      return [
        baseCards[0],
        {
          label: 'Site',
          value: siteLabel,
          descriptor: siteDescriptor,
          caption: stats.sites.active > 0 ? 'Affectation du collaborateur' : 'Affectation inactif',
          icon: <StorefrontOutlinedIcon />,
          gradient: 'linear-gradient(135deg, #ccfbf1 0%, #a5f3fc 100%)',
          avatarBg: 'rgba(14,116,144,0.18)',
        },
        baseCards[1],
        {
          label: 'Groupement',
          value: groupementLabel,
          descriptor: groupementDescriptor,
          caption: 'Structure de rattachement',
          icon: <BusinessOutlinedIcon />,
          gradient: 'linear-gradient(135deg, #ede9fe 0%, #c7d2fe 100%)',
          avatarBg: 'rgba(109,40,217,0.18)',
        },
      ];
    },
    [
      formatNumber,
      groupementName,
      mode,
      siteName,
      siteType,
      stats.filiales.total,
      stats.groupements.active,
      stats.groupements.total,
      stats.marques.active,
      stats.marques.total,
      stats.sites.active,
      stats.sites.total,
      stats.succursales.total,
      stats.users.active,
      stats.users.total,
      statsLoading,
    ]
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
                marques actifs, et gardez une longueur d'avance sur l'ecosysteme Autohall.
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
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)',
                color: 'inherit',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 18px 40px rgba(14, 23, 42, 0.35)',
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
                  Alertes en temps reel
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'inherit',
                        width: 36,
                        height: 36,
                      }}
                    >
                      <NotificationsActiveOutlinedIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Activite recente
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Aucun incident critique signale. Tous les systemes sont operationnels.
                      </Typography>
                    </Box>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Math.max(siteAvailabilityPercent, 0), 100)}
                    sx={{
                      borderRadius: 999,
                      height: 6,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        background:
                          siteAvailabilityPercent >= 80
                            ? '#34d399'
                            : siteAvailabilityPercent >= 50
                            ? '#fbbf24'
                            : '#f87171',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    Disponibilite des sites: {siteAvailabilityPercent.toFixed(1)}%
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {statsCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                background: card.gradient,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Stack spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: card.avatarBg,
                    width: 48,
                    height: 48,
                  }}
                >
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {card.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.descriptor}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {card.caption}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Apercu operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Synthese des indicateurs clefs
              </Typography>
            </Box>

            <Stack spacing={2}>
              {operationsMetrics.map((metric) => (
                <Box key={metric.label}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {metric.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.value}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      bgcolor: 'rgba(148,163,184,0.12)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        background:
                          metric.tone === 'primary'
                            ? '#3b82f6'
                            : metric.tone === 'success'
                            ? '#10b981'
                            : '#facc15',
                      },
                    }}
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
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Priorites du moment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suivi des points stratégiques
              </Typography>
            </Box>

            <Stack spacing={2}>
              {priorityUpdates.map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(148,163,184,0.08)',
                    border: '1px solid rgba(148,163,184,0.16)',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
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

      {statsError && (
        <Alert severity="error" onClose={onClearError} sx={{ borderRadius: 2 }}>
          {statsError}
        </Alert>
      )}
    </Box>
  );
};
