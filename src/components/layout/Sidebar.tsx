// src/components/layout/Sidebar.tsx

import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Collapse,
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
import SecurityIcon from '@mui/icons-material/Security';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import logo from '../../assets/logo.png';
import { useAuthStore } from '../../store/authStore';
import { useRoles, ROLES, RoleName } from '../../hooks/useRoles';

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  path?: string;
  children?: Array<{
    title: string;
    icon: React.ReactElement;
    path: string;
    roles?: RoleName[];
  }>;
  roles?: RoleName[];
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
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const { hasAnyRole, isAdminFonctionnel, isIntegrateurObjectifs } = useRoles();

  const allMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      title: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
      roles: [ROLES.ADMIN_FONCTIONNEL],
    },
    {
      title: 'Sites',
      icon: <SecurityIcon />,
      path: '/sites',
      roles: [ROLES.ADMIN_FONCTIONNEL],
    },
    {
      title: 'Véhicules',
      icon: <DirectionsCarIcon />,
      roles: [ROLES.ADMIN_FONCTIONNEL],
      children: [
        {
          title: 'Marques',
          icon: <CategoryIcon />,
          path: '/marques',
        },
        {
          title: 'Modèles',
          icon: <LayersIcon />,
          path: '/modeles',
        },
        {
          title: 'Versions',
          icon: <TimeToLeaveIcon />,
          path: '/versions',
        },
      ],
    },
    {
      title: 'Périodes',
      icon: <CalendarTodayIcon />,
      path: '/periodes',
      roles: [ROLES.ADMIN_FONCTIONNEL],
    },
    {
      title: 'Objectifs',
      icon: <TrackChangesIcon />,
      path: '/objectifs',
      roles: [ROLES.ADMIN_FONCTIONNEL, ROLES.INTEGRATEUR_OBJECTIFS],
    },
  ];

  const menuItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      return hasAnyRole(item.roles);
    });
  }, [hasAnyRole]);

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path && isPathActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => isPathActive(child.path));
    }
    return false;
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
        width: isCompact ? 100 : '100%',
        maxWidth: isCompact ? 100 : '100%',
        height: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto', // keep horizontal hidden while enabling vertical scroll
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid rgba(148, 163, 184, 0.15)',
        boxShadow: '0 10px 40px rgba(15, 23, 42, 0.4)',
        // Custom scrollbar styling for webkit browsers
        '&::-webkit-scrollbar': {
          width: 6,
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'var(--scrollbar-thumb)',
          borderRadius: 9999,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(148, 163, 184, 0.45) transparent',
      }}
    >
      {/* Header/Toolbar */}
      <Toolbar
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          flexShrink: 0,
        }}
      >
        {!isCompact ? (
          <Box
            component="img"
            src={logo}
            alt="AutoHall"
            sx={{
              height: 48,
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
            }}
          />
        ) : (
          isCompact &&
          onItemClick && (
            <IconButton
              onClick={onItemClick}
              sx={{
                color: '#f1f5f9',
                '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
              }}
            >
              <CloseIcon />
            </IconButton>
          )
        )}
      </Toolbar>

      {/* Menu items */}
      <List
        sx={{
          flex: 1,
          width: '100%',
          px: 2,
          py: 2.5,
          overflowX: 'hidden',
          overflowY: 'visible',
          boxSizing: 'border-box',
        }}
      >
        {menuItems.map((item) => {
          const active = isMenuActive(item);
          const isExpanded = openMenus[item.title] ?? active;
          const hasChildren = Boolean(item.children && item.children.length > 0);

          const handleItemClick = () => {
            if (hasChildren) {
              toggleMenu(item.title);
              if (item.path) {
                handleNavigation(item.path);
              }
            } else if (item.path) {
              handleNavigation(item.path);
            }
          };

          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.75 }}>
              <Box sx={{ width: '100%' }}>
                <ListItemButton
                  onClick={handleItemClick}
                  selected={active && !hasChildren}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      '& .MuiListItemIcon-root': { color: '#3b82f6' },
                      '& .MuiListItemText-primary': {
                        color: '#f1f5f9',
                        fontWeight: 700,
                      },
                    },
                    '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
                  }}
                >
                  <ListItemIcon sx={{ color: '#94a3b8', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: 15,
                      fontWeight: active ? 600 : 500,
                      color: active ? '#f1f5f9' : '#cbd5e1',
                    }}
                  />
                  {!isCompact && hasChildren && (
                    <Box sx={{ color: '#94a3b8' }}>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                  )}
                </ListItemButton>

                {hasChildren && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ mt: 0.5 }}>
                      {item.children!.map((child) => {
                        const childActive = isPathActive(child.path);
                        return (
                          <ListItemButton
                            key={child.path}
                            onClick={() => handleNavigation(child.path)}
                            selected={childActive}
                            sx={{
                              pl: 7,
                              borderRadius: 2,
                              py: 0.75,
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                '& .MuiListItemIcon-root': { color: '#3b82f6' },
                                '& .MuiListItemText-primary': {
                                  color: '#f1f5f9',
                                  fontWeight: 600,
                                },
                              },
                              '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.08)' },
                            }}
                          >
                            <ListItemIcon sx={{ color: '#94a3b8', minWidth: 36 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.title}
                              primaryTypographyProps={{
                                fontSize: 14,
                                fontWeight: childActive ? 600 : 500,
                                color: childActive ? '#f1f5f9' : '#cbd5e1',
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>

      {/* Footer section */}
      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.15)', flexShrink: 0 }} />
      <Box sx={{ p: 2.5, width: '100%', boxSizing: 'border-box', flexShrink: 0 }}>
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
            width: '100%',
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
              bgcolor: '#3b82f6',
              width: 42,
              height: 42,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {userInitials}
          </Avatar>
          {!isCompact && (
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#f1f5f9',
                  fontWeight: 600,
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.full_name || user?.username || 'Utilisateur'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                }}
              >
                {user?.email || 'email@autohall.ma'}
              </Typography>
            </Box>
          )}
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={async () => {
            try {
              await logout();
            } finally {
              navigate('/login', { replace: true });
            }
          }}
          sx={{
            mt: 2,
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
          Se déconnecter
        </Button>

        {!isCompact && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#64748b',
              mt: 2,
              fontSize: 11,
            }}
          >
            Version 1.0.0
          </Typography>
        )}
      </Box>
    </Box>
  );
};
