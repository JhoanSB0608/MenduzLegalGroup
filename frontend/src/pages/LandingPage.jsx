import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Button, Container, Stack, useTheme, alpha, Avatar, CardContent,
  Grow, Slide, IconButton, Tooltip, Chip, Paper, Zoom, Fade
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  Login as LoginIcon,
  AutoAwesome as AutoAwesomeIcon,
  Gavel as GavelIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const theme = useTheme();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Grow in={shouldAnimate} timeout={800}>
      <Box sx={{ width: '100%' }}>
        <GlassCard sx={{ p: 4, height: '100%' }}>
          <Stack spacing={2} alignItems="flex-start">
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Icon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          </Stack>
        </GlassCard>
      </Box>
    </Grow>
  );
};

const LandingPage = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={12}>
          {/* Hero Section */}
          <Fade in={isVisible} timeout={1000}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '3rem', md: '5rem' },
                  mb: 3,
                  background: `linear-gradient(135deg, #fff 0%, ${alpha('#fff', 0.5)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Justicia Digital <br />
                <Box component="span" sx={{ color: theme.palette.primary.light, WebkitTextFillColor: 'initial' }}>
                  Sin Fricciones
                </Box>
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 700, mx: 'auto', mb: 6, fontWeight: 400 }}
              >
                La plataforma SaaS enterprise para la automatización de procesos jurídicos, 
                insolvencia y conciliación con los más altos estándares de seguridad.
              </Typography>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    py: 2,
                    px: 6,
                    fontSize: '1.1rem',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  Empezar Ahora
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                  startIcon={<LoginIcon />}
                  sx={{ py: 2, px: 6, fontSize: '1.1rem' }}
                >
                  Iniciar Sesión
                </Button>
              </Stack>
            </Box>
          </Fade>

          {/* Features Grid */}
          <Stack spacing={4}>
            <Typography variant="h3" align="center" sx={{ fontWeight: 800 }}>
              Tecnología de Punta Legal
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
              <FeatureCard
                icon={BusinessIcon}
                title="Gestión Centralizada"
                description="Control total sobre tus expedientes y solicitudes en un dashboard unificado y potente."
                delay={200}
              />
              <FeatureCard
                icon={DescriptionIcon}
                title="Automatización"
                description="Generación instantánea de documentos legales PDF/Word basados en datos estructurados."
                delay={400}
              />
              <FeatureCard
                icon={SecurityIcon}
                title="Seguridad Nivel Banco"
                description="Tus datos protegidos con cifrado de grado militar y cumplimiento normativo estricto."
                delay={600}
              />
            </Box>
          </Stack>

          {/* Stats / Proof */}
          <GlassCard sx={{ p: 6 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={8} justifyContent="space-around" alignItems="center">
              <Box textAlign="center">
                <Typography variant="h2" color="primary.light" sx={{ fontWeight: 900 }}>+10k</Typography>
                <Typography variant="subtitle1" color="text.secondary">Solicitudes Procesadas</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h2" color="secondary.light" sx={{ fontWeight: 900 }}>99.9%</Typography>
                <Typography variant="subtitle1" color="text.secondary">Disponibilidad</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h2" color="success.light" sx={{ fontWeight: 900 }}>100%</Typography>
                <Typography variant="subtitle1" color="text.secondary">Cumplimiento Legal</Typography>
              </Box>
            </Stack>
          </GlassCard>
        </Stack>
      </Container>
    </Box>
  );
};

export default LandingPage;
