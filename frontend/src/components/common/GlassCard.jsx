import React from 'react';
import { Card, alpha, useTheme } from '@mui/material';

const GlassCard = React.forwardRef(({ children, sx = {}, hover = true, ...props }, ref) => {
  const theme = useTheme();

  return (
    <Card
      ref={ref}
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${alpha('#fff', 0.05)} 0%, ${alpha('#fff', 0.02)} 100%)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          opacity: 0.5,
          transition: 'opacity 0.3s ease',
        },
        ...(hover && {
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
            background: `linear-gradient(135deg, ${alpha('#fff', 0.08)} 0%, ${alpha('#fff', 0.04)} 100%)`,
            '&::before': {
              opacity: 1,
            },
          }
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
});

export default GlassCard;
