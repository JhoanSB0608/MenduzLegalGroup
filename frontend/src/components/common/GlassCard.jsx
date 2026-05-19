import React from 'react';
import { Card, useTheme, alpha } from '@mui/material';

const GlassCard = React.forwardRef(({ children, sx = {}, hover = true }, ref) => {
  const theme = useTheme();
  return (
    <Card
      ref={ref}
      sx={{
        // Use design system variables for background, radius, padding, and shadows
        background: 'var(--color-background)', // Dark background specified in design system
        // background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`, // Current gradient - will replace with static dark background for now, or a more premium gradient
        backdropFilter: 'blur(10px)', // Adjusted blur for a more subtle glass effect
        border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border, can adjust as per design system if specified differently
        borderRadius: 'var(--border-radius-lg)', // Use design system token (was 12px)
        padding: 'var(--space-lg)', // Use design system token (was 24px)
        boxShadow: 'var(--shadow-md)', // Use design system shadow token
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 200ms ease', // Use design system transition speed
        cursor: 'pointer', // Add cursor pointer as per design system
        ...(hover && {
          '&:hover': {
            boxShadow: 'var(--shadow-lg)', // Use larger shadow on hover as per design system
            transform: 'translateY(-2px)', // Match design system hover effect
          }
        }),
        // The ::before element might need refinement based on the overall liquid glass effect or if it clashes with new styles.
        // For now, keeping it as a subtle accent, but it can be removed or modified.
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          // This gradient might be too colorful. Consider a more subtle gold/silver or remove if not fitting.
          // background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
          background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`, // Using primary/secondary gold tones
          opacity: 0.8, // Make it slightly visible
          transition: 'opacity 0.3s ease',
        },
        // Remove hover effect from ::before if it's causing issues or not desired
        ...(hover && {
          '&:hover::before': {
            opacity: 1, // Full opacity on hover for the accent bar
          }
        }),
        ...sx,
      }}
    >
      {children}
    </Card>
  );
});

export default GlassCard;
