import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Button, Container, Grid, Stack, useTheme, alpha, Avatar, CardContent,
  Grow, Slide, IconButton, Tooltip, Collapse, Divider, Chip, Paper, Zoom, Fade
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  Login as LoginIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Gavel as GavelIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import GlassCard from '../components/common/GlassCard';

// Interactive Feature Card with Expanded Details (Restored Original Logic)
const FeatureCard = ({ icon: Icon, title, description, bullets = [], delay = 0, badge }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shouldAnimateIn, setShouldAnimateIn] = useState(false);

  useEffect(() => {
    const actualDelay = delay > 0 ? delay : 1;
    const timer = setTimeout(() => {
      setShouldAnimateIn(true);
    }, actualDelay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Grow in={shouldAnimateIn} timeout={700}>
      <div>
        <GlassCard
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{ 
            width: '100%',
            cursor: 'pointer',
            transform: hovered ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Main Content */}
            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                      color: theme.palette.primary.main,
                      width: 72,
                      height: 72,
                      transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: hovered ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                      border: `2px solid ${alpha('#fff', 0.1)}`,
                    }}
                  >
                    <Icon sx={{ fontSize: 36 }} />
                  </Avatar>
                  
                  {badge && (
                    <Chip
                      label={badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiked(!liked);
                      }}
                      sx={{
                        color: liked ? theme.palette.error.main : alpha(theme.palette.text.primary, 0.2),
                        '&:hover': { transform: 'scale(1.2)' }
                      }}
                    >
                      <StarIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  
                  <Typography variant="body1" color="text.secondary">
                    {description}
                  </Typography>
                  
                  {bullets.length > 0 && !expanded && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {bullets.slice(0, 2).map((bullet, i) => (
                        <Chip key={i} label={bullet} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                      ))}
                    </Stack>
                  )}
                </Box>

                <Stack alignItems="center">
                  <IconButton
                    sx={{
                      color: theme.palette.primary.light,
                      transform: hovered ? 'translateX(4px)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                  <ExpandMoreIcon 
                    fontSize="small" 
                    sx={{ 
                      transition: 'all 0.3s ease',
                      transform: expanded ? 'rotate(180deg)' : 'none',
                      color: alpha(theme.palette.text.primary, 0.3)
                    }} 
                  />
                </Stack>
              </Stack>
            </Box>

            <Collapse in={expanded}>
              <Divider sx={{ mx: 3, opacity: 0.1 }} />
              <Box sx={{ p: 3 }}>
                <Grid container spacing={1}>
                  {bullets.map((bullet, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <VerifiedIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                        <Typography variant="body2" color="text.secondary">{bullet}</Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Collapse>
          </CardContent>
        </GlassCard>
      </div>
    </Grow>
  );
};

const LandingPage = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: BusinessIcon,
      title: 'Gestión Centralizada',
      description: 'Administre todas las solicitudes desde una única plataforma con trazabilidad y permisos granulares.',
      bullets: ['Historial de cambios completo', 'Búsqueda avanzada', 'Dashboard en tiempo real'],
      badge: 'Core'
    },
    {
      icon: DescriptionIcon,
      title: 'Documentos Automatizados',
      description: 'Plantillas dinámicas que se adaptan al tipo de proceso y reducen tiempos administrativos.',
      bullets: ['Generador de plantillas', 'Formularios interactivos y dinámicos', 'Exportación múltiples formatos'],
      badge: 'Ahorro'
    },
    {
      icon: SecurityIcon,
      title: 'Seguridad Jurídica',
      description: 'Validaciones automáticas y cumplimiento normativo para minimizar riesgos legales.',
      bullets: ['Checks normativos integrados', 'Registro de evidencias'],
      badge: 'Seguro'
    }
  ];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Interactive Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, ${alpha(theme.palette.primary.main, 0.08)}, transparent 40%)`,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack spacing={12}>
          {/* Hero Section */}
          <Slide in={isVisible} direction="down" timeout={1000}>
            <Box>
              <GlassCard hover={false}>
                <CardContent sx={{ p: { xs: 4, md: 8 } }}>
                  <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={7}>
                      <Typography
                        variant="h1"
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: '2.5rem', md: '4rem' },
                          lineHeight: 1.1,
                          mb: 3,
                          background: `linear-gradient(135deg, #fff 0%, ${theme.palette.primary.light} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Plataforma Integral para Procesos Legales
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 6, fontWeight: 400 }}>
                        Centralice solicitudes, automatice documentos y reduzca el tiempo operacional con herramientas diseñadas para despachos y áreas jurídicas.
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                        <Button
                          component={Link}
                          to="/login"
                          variant="contained"
                          size="large"
                          sx={{ 
                            py: 2, px: 6, borderRadius: '16px', fontSize: '1.1rem',
                            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`
                          }}
                        >
                          Acceder Ahora
                        </Button>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 180, height: 180, mx: 'auto',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        <GavelIcon sx={{ fontSize: 90 }} />
                      </Avatar>
                    </Grid>
                  </Grid>
                </CardContent>
              </GlassCard>
            </Box>
          </Slide>

          {/* Features Section */}
          <Box>
            <Typography variant="h3" align="center" sx={{ fontWeight: 800, mb: 8 }}>
              Funcionalidades Avanzadas
            </Typography>
            <Stack spacing={4}>
              {features.map((feature, i) => (
                <FeatureCard key={i} {...feature} delay={i * 200} />
              ))}
            </Stack>
          </Box>

          {/* CTA Section */}
          <Grow in={isVisible} timeout={1500}>
            <Box>
              <GlassCard hover={false} sx={{ textAlign: 'center', p: { xs: 4, md: 8 } }}>
                <Avatar 
                  sx={{ 
                    width: 80, height: 80, mx: 'auto', mb: 4,
                    background: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
                  ¿Listo para transformar su práctica?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
                  Únase para optimizar sus procesos legales con nuestra plataforma.
                </Typography>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    py: 2, px: 8, borderRadius: '16px',
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.3)}`
                  }}
                >
                  Registrese
                </Button>
              </GlassCard>
            </Box>
          </Grow>

          {/* Footer */}
          <Box component="footer" sx={{ pt: 4, borderTop: `1px solid ${alpha('#fff', 0.05)}`, textAlign: 'center' }}>
            <img src="/logoPrincipal.png" alt="Logo" style={{ height: '60px', marginBottom: '24px' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              © {new Date().getFullYear()} Plataforma Corporativa Especializada
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Todos los derechos reservados. Plataforma diseñada para profesionales del derecho.
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* Floating Action Button (Restored Original Style) */}
      <Zoom in={isVisible}>
        <Button
          component={Link}
          to="/register"
          sx={{
            position: 'fixed', bottom: 32, right: 32,
            width: 64, height: 64, borderRadius: '50%', minWidth: 'auto',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: '#fff',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': { transform: 'scale(1.1) rotate(10deg)' },
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 1000,
          }}
        >
          <AutoAwesomeIcon />
        </Button>
      </Zoom>
    </Box>
  );
};

export default LandingPage;
