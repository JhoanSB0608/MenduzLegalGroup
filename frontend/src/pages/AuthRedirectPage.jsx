import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, alpha } from '@mui/material';

const AuthRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        localStorage.setItem('userInfo', JSON.stringify({ token: token }));
        // Instead of window.location.href, use navigate for React Router's client-side routing
        // This prevents a full page reload and maintains the SPA experience.
        // Force reload might be necessary if AuthProvider doesn't pick up localStorage change immediately.
        // For now, let's try navigate first. If issues arise, consider window.location.href.
        navigate('/admin'); 
      } catch (error) {
        console.error('Failed to store token from URL', error);
        navigate('/login?error=store_failed');
      }
    } else {
      navigate('/login?error=missing_token');
    }
  }, [searchParams, navigate]);

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
          linear-gradient(135deg, ${alpha('#0F172A', 0.2)} 0%, ${alpha('#F59E0B', 0.1)} 100%),
          radial-gradient(circle at 20% 80%, ${alpha('#8B5CF6', 0.15)}, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha('#FBBF24', 0.15)}, transparent 50%)
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
        Finalizando autenticación...
      </Typography>
    </Box>
  );
};

export default AuthRedirectPage;
