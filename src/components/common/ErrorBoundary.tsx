import React, { ErrorInfo, ReactNode } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global error boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            background: 'linear-gradient(135deg, #eef4ff 0%, #f8fafc 100%)',
          }}
        >
          <Paper elevation={3} sx={{ maxWidth: 560, width: '100%', p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
            <Stack spacing={2.5} alignItems="center" textAlign="center">
              <ErrorOutlineRoundedIcon sx={{ fontSize: 56, color: 'error.main' }} />
              <Typography variant="h5" component="h1" fontWeight={700}>
                Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary">
                The app hit an unexpected error. You can safely reload the page to continue.
              </Typography>
              <Button variant="contained" size="large" onClick={this.handleReload}>
                Reload application
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
