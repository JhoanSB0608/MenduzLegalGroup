import { createTheme, alpha } from '@mui/material/styles';

const premiumPalette = {
  primary: {
    main: '#1E40AF', // Azul Rey Main
    dark: '#0F172A', // Azul Rey Profundo (Fondo/Dark)
    light: '#3B82F6', // Azul Rey Light
    contrastText: '#F8FAFC',
  },
  secondary: {
    main: '#D97706', // Oro Noble Main
    dark: '#92400E', // Oro Noble Dark
    light: '#F59E0B', // Oro Noble Light
    contrastText: '#F8FAFC',
  },
  accent: {
    main: '#94A3B8', // Plata Líquido Main
    dark: '#475569', // Plata Líquido Dark
    light: '#E2E8F0', // Plata Líquido Light
  },
  background: {
    default: '#0B0F1A', // Fondo base ultra-dark
    paper: '#161B22',   // Cards/Modals surface
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    disabled: 'rgba(248, 250, 252, 0.38)',
  },
  divider: 'rgba(255, 255, 255, 0.08)',
  success: {
    main: '#10B981',
    dark: '#065F46',
    light: '#34D399',
  },
  error: {
    main: '#EF4444',
    dark: '#991B1B',
    light: '#F87171',
  },
  warning: {
    main: '#F59E0B',
    dark: '#B45309',
    light: '#FBBF24',
  },
  info: {
    main: '#0EA5E9',
    dark: '#0369A1',
    light: '#38BDF8',
  },
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    ...premiumPalette,
  },
  typography: {
    fontFamily: '"Inter", "Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.015em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.005em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: premiumPalette.background.default,
          color: premiumPalette.text.primary,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, ${alpha(premiumPalette.primary.main, 0.05)}, transparent 40%),
            radial-gradient(circle at 80% 20%, ${alpha(premiumPalette.secondary.main, 0.05)}, transparent 40%)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 16px ${alpha('#000', 0.3)}`,
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${premiumPalette.primary.main} 0%, ${premiumPalette.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${premiumPalette.primary.light} 0%, ${premiumPalette.primary.main} 100%)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: premiumPalette.background.paper,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            // Se movió la lógica base a MuiOutlinedInput
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: alpha(premiumPalette.text.primary, 0.6),
          '&.Mui-focused': {
            color: premiumPalette.primary.light,
            fontWeight: 600,
          },
        },
        outlined: {
          // Ajuste de posición inicial
          transform: 'translate(14px, 16px) scale(1)',
          '&.MuiInputLabel-shrink': {
            // Fondo sólido/semi-transparente para ocultar el borde detrás del label
            // y asegurar legibilidad en diseño glassmorphism
            transform: 'translate(14px, -9px) scale(0.75)',
            padding: '0 8px',
            backgroundColor: premiumPalette.background.paper,
            backdropFilter: 'blur(10px)',
            borderRadius: '4px',
            color: premiumPalette.primary.light,
            zIndex: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: alpha(premiumPalette.background.paper, 0.4),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha(premiumPalette.background.paper, 0.6),
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(premiumPalette.primary.main, 0.4),
            },
          },
          '&.Mui-focused': {
            backgroundColor: alpha(premiumPalette.background.paper, 0.8),
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1px',
              borderColor: premiumPalette.primary.main,
              boxShadow: `0 0 0 4px ${alpha(premiumPalette.primary.main, 0.1)}`,
            },
          },
        },
        notchedOutline: {
          borderColor: alpha('#fff', 0.1),
          transition: 'all 0.2s ease-in-out',
          '& legend': {
            // Asegurar que el legend (el espacio en el borde) sea visible
            fontSize: '0.75em',
          }
        },
        input: {
          padding: '16.5px 14px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: alpha(premiumPalette.primary.main, 0.05),
          fontWeight: 700,
          color: premiumPalette.text.secondary,
          borderBottom: `2px solid ${premiumPalette.divider}`,
        },
        root: {
          borderColor: premiumPalette.divider,
        },
      },
    },
  },
});

export default theme;
