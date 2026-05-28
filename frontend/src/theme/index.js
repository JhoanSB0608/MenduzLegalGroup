import { createTheme, alpha } from '@mui/material/styles';

const premiumPalette = {
  primary: {
    main: '#1E40AF', // Azul Rey Main
    dark: '#0F172A', // Azul Rey Profundo (Fondo/Dark)
    light: '#3B82F6', // Azul Rey Light
    contrastText: '#F8FAFC',
  },
  secondary: {
    main: '#d98e03', // Oro Noble Main
    dark: '#b67a0c', // Oro Noble Dark
    light: '#ffa600', // Oro Noble Light
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

const getTheme = (mode) => {
const isDark = mode === 'dark';

const currentBackground = isDark
  ? premiumPalette.background.paper
  : '#FFFFFF';

const currentTextPrimary = isDark
  ? premiumPalette.text.primary
  : '#1E293B';

const currentTextSecondary = isDark
  ? premiumPalette.text.secondary
  : '#64748B';

const currentDivider = isDark
  ? premiumPalette.divider
  : 'rgba(0, 0, 0, 0.12)';
  
  return createTheme({
    palette: {
      mode,
      ...(isDark ? premiumPalette : {
        primary: premiumPalette.primary,
        secondary: premiumPalette.secondary,
        background: { default: '#F1F5F9', paper: '#FFFFFF' },
        text: { primary: '#1E293B', secondary: '#64748B' },
        divider: 'rgba(0, 0, 0, 0.12)',
        success: premiumPalette.success,
        error: premiumPalette.error,
        warning: premiumPalette.warning,
        info: premiumPalette.info,
      }),
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
            backgroundColor: isDark ? premiumPalette.background.default : '#F8FAFC',
            color: isDark ? premiumPalette.text.primary : '#1E293B',
            backgroundImage: isDark
              ? `
                radial-gradient(circle at 20% 80%, ${alpha(premiumPalette.primary.main, 0.05)}, transparent 40%),
                radial-gradient(circle at 80% 20%, ${alpha(premiumPalette.secondary.main, 0.05)}, transparent 40%)
              `
              : `
                radial-gradient(circle at 20% 80%, ${alpha(premiumPalette.primary.light, 0.08)}, transparent 35%),
                radial-gradient(circle at 80% 20%, ${alpha(premiumPalette.secondary.light, 0.08)}, transparent 35%)
              `,
            backgroundAttachment: 'fixed',
            transition: 'background-color 0.3s ease, color 0.3s ease',
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
              boxShadow: isDark ? `0 8px 16px ${alpha('#000', 0.3)}` : '0 4px 12px rgba(0,0,0,0.1)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${premiumPalette.primary.main} 0%, ${premiumPalette.primary.dark} 100%)`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark
              ? alpha(premiumPalette.background.paper, 0.7)
              : alpha('#FFFFFF', 0.7),
            border: `1px solid ${
              isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.08)'
            }`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.25)'
            : '0 8px 32px rgba(15, 23, 42, 0.08)',
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
          color: alpha(currentTextPrimary, 0.6),
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
            backgroundColor: alpha(currentBackground, 0.9),
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
          backgroundColor: alpha(currentBackground, isDark ? 0.4 : 0.7),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha(currentBackground, isDark ? 0.6 : 0.9),
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(premiumPalette.primary.main, 0.4),
            },
          },
          '&.Mui-focused': {
            backgroundColor: alpha(currentBackground, isDark ? 0.8 : 1),
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1px',
              borderColor: premiumPalette.primary.main,
              boxShadow: `0 0 0 4px ${alpha(premiumPalette.primary.main, 0.1)}`,
            },
          },
        },
        notchedOutline: {
          borderColor: alpha(currentDivider, isDark ? 0.4 : 1),
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
          color: currentTextSecondary,
          borderBottom: `2px solid ${currentDivider}`,
        },
        root: {
          borderColor: currentDivider,
          },
        },
      },
    },
  });
};

export default getTheme;
