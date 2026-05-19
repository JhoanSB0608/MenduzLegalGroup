import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, useTheme, alpha } from '@mui/material';
import { Warning } from '@mui/icons-material';

const SessionTimeoutModal = ({ open, onLogout, onStay }) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!open) {
      setCountdown(30);
      return;
    }

    if (countdown === 0) {
      onLogout();
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [open, countdown, onLogout]);

  // Button Styles based on Design System
  const primaryButtonStyles = {
    backgroundColor: 'var(--color-cta)', // Using CTA color as primary for action
    color: 'var(--color-text)',
    padding: '12px 24px', // Matches design system button padding
    borderRadius: 'var(--border-radius-md)', // Use design system token (was 2)
    fontWeight: 600,
    transition: 'all 200ms ease',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-md)', // Add shadow for depth
    '&:hover': {
      backgroundColor: 'var(--color-secondary)', // Using secondary for hover effect
      opacity: 0.9,
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-lg)', // Enhance shadow on hover
    },
    '&:active': {
      transform: 'translateY(0px)', // Reset transform on active
    },
    '& .MuiButton-startIcon': { // Style for the icon
      marginRight: 'var(--space-sm)',
    },
  };

  const secondaryButtonStyles = {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: `2px solid var(--color-primary)`,
    padding: '12px 24px', // Matches design system button padding
    borderRadius: 'var(--border-radius-md)', // Use design system token (was 2)
    fontWeight: 600,
    transition: 'all 200ms ease',
    cursor: 'pointer',
    boxShadow: 'none', // No shadow for secondary
    '&:hover': {
      color: 'var(--color-secondary)',
      border: `2px solid var(--color-secondary)`,
      opacity: 0.9,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0px)',
    },
     '& .MuiButton-startIcon': { // Style for the icon
      marginRight: 'var(--space-sm)',
    },
  };


  return (
    <Dialog 
      open={open} 
      onClose={onStay}
      PaperProps={{
        sx: {
          // Update modal styling based on design system
          borderRadius: 'var(--border-radius-xl)', // Use design system token (was 16px)
          background: 'var(--color-background)', // Use design system background color
          // backdropFilter: 'blur(4px)', // Use design system blur value
          backdropFilter: 'blur(10px)', // Adjusted for a more pronounced glass effect
          border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border, adjust if design system specifies differently
          boxShadow: 'var(--shadow-xl)', // Use design system shadow token
          padding: 'var(--space-xl)', // Use design system token for padding (was 32px)
        }
      }}
    >
      <DialogTitle sx={{ p: 0, mb: 2 }}> {/* Adjust padding for title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Warning sx={{ color: 'var(--color-primary)', fontSize: 32 }} /> {/* Use primary color for warning icon */}
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}> {/* Use bold weight */}
            ¿Sigues ahí?
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, mb: 3 }}> {/* Adjust padding for content */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2, my: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="var(--color-text-muted)"> {/* Use body1 variant and muted text color */}
            Tu sesión está a punto de expirar por inactividad.
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
            <CircularProgress 
              variant="determinate" 
              value={(countdown / 30) * 100} 
              size={80}
              thickness={4}
              sx={{ color: 'var(--color-primary)' }} // Use primary color for progress circle
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}> {/* Use bold weight */}
                {countdown}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            segundos restantes
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 0, justifyContent: 'space-between' }}> {/* Adjust padding for actions */}
        <Button onClick={onLogout} sx={{ ...secondaryButtonStyles }}> {/* Apply secondary button styles */}
          Cerrar Sesión
        </Button>
        <Button onClick={onStay} variant="contained" autoFocus sx={{ ...primaryButtonStyles }}> {/* Apply primary button styles */}
          Permanecer Conectado
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutModal;
