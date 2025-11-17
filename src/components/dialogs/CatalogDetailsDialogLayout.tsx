// Shared layout for catalog detail dialogs (marques, modèles, versions)
import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface CatalogDetailsDialogLayoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  chipLabel?: string;
  chipColor?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  maxWidth?: DialogProps['maxWidth'];
  children: React.ReactNode;
  actionLabel?: string;
}

export const CatalogDetailsDialogLayout: React.FC<CatalogDetailsDialogLayoutProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  chipLabel,
  chipColor = 'default',
  maxWidth = 'md',
  children,
  actionLabel = 'Close',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          backdropFilter: 'blur(10px)',
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha('#1e293b', 0.5)
              : alpha('#f8fafc', 0.85),
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {icon && (
            <Box
              sx={{
                bgcolor: alpha('#fff', 0.2),
                width: 45,
                height: 45,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: 'white',
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {chipLabel && (
            <Chip
              label={chipLabel}
              size="small"
              color={chipColor}
              sx={{ color: 'white', borderColor: alpha('#fff', 0.5), borderWidth: 1 }}
              variant="outlined"
            />
          )}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'white',
              '&:hover': { bgcolor: alpha('#fff', 0.15) },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>{children}</DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
            },
          }}
        >
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
