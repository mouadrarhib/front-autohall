// src/features/dashboard/Dashboard.tsx
import React from 'react';
import {
  Avatar,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useAuthStore } from '../../store/authStore';

const statsCards = [
  {
    label: 'Active Users',
    value: '128',
    change: '+12.4%',
    icon: <PeopleAltOutlinedIcon />,
    trend: 'vs last month',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(56,189,248,0.28) 100%)',
    iconBg: 'rgba(59,130,246,0.2)',
  },
  {
    label: 'Vehicle Fleet',
    value: '342',
    change: '+5.1%',
    icon: <DirectionsCarFilledOutlinedIcon />,
    trend: 'fleet availability',
    gradient: 'linear-gradient(135deg, rgba(14,116,144,0.2) 0%, rgba(45,212,191,0.32) 100%)',
    iconBg: 'rgba(45,212,191,0.25)',
  },
  {
    label: 'Security Events',
    value: '3',
    change: '-18%',
    icon: <ShieldOutlinedIcon />,
    trend: 'alerts this week',
    gradient: 'linear-gradient(135deg, rgba(79,70,229,0.16) 0%, rgba(129,140,248,0.28) 100%)',
    iconBg: 'rgba(99,102,241,0.25)',
  },
  {
    label: 'Monthly Revenue',
    value: '$120K',
    change: '+9.8%',
    icon: <MonetizationOnOutlinedIcon />,
    trend: 'projection accuracy',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(249,115,22,0.24) 100%)',
    iconBg: 'rgba(245,158,11,0.25)',
  },
];

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const welcomeName = user?.full_name || user?.username || 'there';

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
                label="Performance steady"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                  backdropFilter: 'blur(6px)',
                }}
              />
              <Chip
                icon={<TimelineIcon sx={{ color: 'inherit !important' }} />}
                label="Live metrics updated"
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
                Current uptime
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                99.98%
              </Typography>
              <Box mt={2}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Infrastructure health
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={98}
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
              </Box>
            </Paper>
          </Box>
        </Stack>
      </Paper>

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
                label={`${stat.change} ${stat.trend}`}
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
              {[
                {
                  label: 'Response time',
                  value: '1.2s',
                  progress: 82,
                  tone: 'primary',
                },
                {
                  label: 'Compliance score',
                  value: '97%',
                  progress: 97,
                  tone: 'success',
                },
                {
                  label: 'Pending approvals',
                  value: '4',
                  progress: 40,
                  tone: 'warning',
                },
              ].map((metric) => (
                <Box key={metric.label}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2">{metric.label}</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {metric.value}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
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
              {[
                {
                  title: 'Vehicle maintenance window',
                  detail: 'Scheduled fleet downtimes this Friday between 09:00 - 11:00.',
                },
                {
                  title: 'Security policy rollout',
                  detail: 'New authentication policies applied to all admin accounts.',
                },
                {
                  title: 'User onboarding',
                  detail: '5 pending user site assignments require review.',
                },
              ].map((item) => (
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
