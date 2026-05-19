import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { CircularProgress, Box, Typography, useTheme, alpha } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const theme = useTheme();

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          padding: 2,
          // Apply glassmorphism background using design system colors
          background: `
            linear-gradient(135deg, ${alpha('var(--color-background)', 0.2)} 0%, ${alpha('var(--color-primary)', 0.1)} 100%),
            radial-gradient(circle at 20% 80%, ${alpha('var(--color-cta)', 0.15)}, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha('var(--color-secondary)', 0.15)}, transparent 50%)
          `,
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-cta) 100%)`,
            opacity: 0.03,
            zIndex: -2,
          },
        }}
      >
        <CircularProgress size={60} sx={{ color: 'var(--color-primary)' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'var(--color-text-muted)' }}>
          Verificando credenciales...
        </Typography>
      </Box>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
