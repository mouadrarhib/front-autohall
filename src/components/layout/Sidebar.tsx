// src/components/layout/Sidebar.tsx

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/authStore';

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  path: string;
}

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { title: 'Users', icon: <PeopleIcon />, path: '/users' },
    { title: 'Permissions', icon: <SecurityIcon />, path: '/permissions' },
    { title: 'Groupements', icon: <BusinessIcon />, path: '/groupement' },
    { title: 'Marques', icon: <DirectionsCarIcon />, path: '/groupement' },
    { title: 'Objectifs', icon: <TrackChangesIcon />, path: '/objectifs' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const userInitials = useMemo(() => {
    if (!user) return 'AU';
    const source = user.full_name || user.username || 'AutoHall';
    return source
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        color: '#cbd5f5',
      }}
    >
      <Toolbar
      sx={{
          backgroundColor: 'transparent',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          px: 2.5,
          minHeight: 72,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} width="100%">
          <Box
            component="img"
            src={logo}
            alt="AutoHall"
            sx={{
              width: isCompact ? 36 : 44,
              height: isCompact ? 36 : 44,
              borderRadius: '12px',
              objectFit: 'contain',
              bgcolor: 'common.white',
              p: 0.6,
              boxShadow: '0 6px 18px rgba(15, 23, 42, 0.35)',
            }}
          />
          {!isCompact && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.6px',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AutoHall
            </Typography>
          )}
          {isCompact && onItemClick && (
            <IconButton
              onClick={onItemClick}
              sx={{ ml: 'auto', color: '#cbd5e1' }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      <List sx={{ pt: 2, px: 1.5, flexGrow: 1, overflowY: 'auto' }} dense={isCompact}>
        {menuItems.map((item) => (
          <ListItem key={`${item.path}-${item.title}`} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s ease',
                py: isCompact ? 0.75 : 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  borderLeft: '3px solid #3b82f6',
                  '& .MuiListItemIcon-root': { color: '#3b82f6' },
                  '& .MuiListItemText-primary': {
                    color: '#f1f5f9',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  '& .MuiListItemIcon-root': { color: '#94a3b8' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? '#3b82f6' : '#64748b',
                  minWidth: isCompact ? 32 : 40,
                  transition: 'color 0.2s ease',
                  '& svg': {
                    fontSize: isCompact ? '1.15rem' : '1.25rem',
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                sx={{
                  display: isCompact ? 'none' : 'block',
                }}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  color: isActive(item.path) ? '#f1f5f9' : '#cbd5e1',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.15)', mx: 2.5 }} />

      <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!user) return;
            handleNavigation(`/users/${user.id}`);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              if (!user) return;
              handleNavigation(`/users/${user.id}`);
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.35)',
            cursor: user ? 'pointer' : 'default',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': user
              ? {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 16px 36px rgba(37, 99, 235, 0.35)',
                }
              : undefined,
            outline: 'none',
          }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              fontWeight: 600,
              bgcolor: 'rgba(59,130,246,0.25)',
              color: '#f8fafc',
              textTransform: 'uppercase',
            }}
          >
            {userInitials}
          </Avatar>
          {!isCompact && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 600 }}>
                {user?.full_name || user?.username || 'Utilisateur'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(226, 232, 240, 0.75)' }}>
                {user?.email || 'email@autohall.ma'}
              </Typography>
            </Box>
          )}
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<LogoutIcon fontSize="small" />}
          onClick={async () => {
            try {
              await logout();
            } finally {
              navigate('/login', { replace: true });
            }
          }}
          sx={{
            color: '#f1f5f9',
            borderColor: 'rgba(148, 163, 184, 0.35)',
            textTransform: 'none',
            fontWeight: 600,
            justifyContent: 'flex-start',
            '&:hover': {
              borderColor: 'rgba(248, 113, 113, 0.8)',
              backgroundColor: 'rgba(248, 113, 113, 0.15)',
            },
          }}
        >
          Se deconnecter
        </Button>

        {!isCompact && (
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 600,
            }}
          >
            Version 1.0.0
          </Typography>
        )}
      </Box>
    </Box>
  );
};
