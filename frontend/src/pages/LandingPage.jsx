import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Stack,
  useTheme,
  alpha,
  Avatar,
  CardContent,
  Grow,
  Slide,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  Chip,
  Zoom,
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

// Interactive Feature Card with Expanded Details
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
                {/* Animated Avatar */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                      color: theme.palette.primary.main,
                      width: 72,
                      height: 72,
                      transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: hovered ? 'rotate(10deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <Icon sx={{ fontSize: 36 }} />
                  </Avatar>
                  
                  {/* Badge */}
                  {badge && (
                    <Chip
                      label={badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: 'linear-gradient(135deg, #4caf50, #2196f3)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  )}
                </Box>

                {/* Content */}
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
                    <Tooltip title={liked ? "¡Te gusta!" : "Me gusta"}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLiked(!liked);
                        }}
                        sx={{
                          color: liked ? '#f44336' : alpha(theme.palette.text.primary, 0.3),
                          transition: 'all 0.3s ease',
                          '&:hover': { transform: 'scale(1.2)' }
                        }}
                      >
                        <StarIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      fontSize: '0.95rem'
                    }}
                  >
                    {description}
                  </Typography>
                  
                  {bullets.length > 0 && !expanded && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {bullets.slice(0, 2).map((bullet, i) => (
                        <Chip 
                          key={i} 
                          label={bullet} 
                          size="small" 
                          variant="outlined"
                          sx={{
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            color: theme.palette.primary.light,
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                      {bullets.length > 2 && (
                        <Chip 
                          label={`+${bullets.length - 2} más`}
                          size="small"
                          sx={{
                            background: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.light,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Stack>
                  )}
                </Box>

                {/* Action Button */}
                <Stack alignItems="center" spacing={1}>
                  <IconButton
                    sx={{
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.light,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: hovered ? 'translateX(4px) scale(1.1)' : 'translateX(0) scale(1)',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.2),
                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      transition: 'all 0.3s ease',
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            {/* Expanded Content */}
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <div>
                <Divider sx={{ mx: 3, borderColor: alpha(theme.palette.primary.main, 0.1) }} />
                <Box sx={{ p: 3, pt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
                    Características detalladas:
                  </Typography>
                  <Grid container spacing={1}>
                    {bullets.map((bullet, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Zoom in={expanded} style={{ transitionDelay: `${i * 100}ms` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                            <VerifiedIcon 
                              sx={{ 
                                fontSize: 16, 
                                color: theme.palette.success.main 
                              }} 
                            />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {bullet}
                            </Typography>
                          </Box>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </div>
            </Collapse>
          </CardContent>
        </GlassCard>
      </div>
    </Grow>
  );
};

// Floating Action Button Component
const FloatingActionButton = ({ children, ...props }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Zoom in={isVisible}>
      <Button
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          borderRadius: '50%',
          width: 64,
          height: 64,
          minWidth: 'auto',
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
          '&:hover': {
            transform: 'scale(1.1) rotate(10deg)',
            boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.6)}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
        }}
        {...props}
      >
        {children}
      </Button>
    </Zoom>
  );
};

// Main Component
const LandingPage = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
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
    <Box
      ref={containerRef}
      sx={{
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        pb: 6,
        position: 'relative',
      }}
    >
      {/* Interactive Background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${alpha(theme.palette.primary.main, 0.1)}, transparent 40%)`,
          pointerEvents: 'none',
          zIndex: -1,
          transition: 'background 0.3s ease',
        }}
      />

      {/* Hero Section */}
      <Box sx={{ width: '100%', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Slide in={isVisible} direction="down" timeout={1000}>
            <Box>
              <GlassCard hover={false}>
                <CardContent sx={{ p: { xs: 4, md: 8 } }}>
                  <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={6} 
                    alignItems="center" 
                    justifyContent="space-between"
                  >
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                      <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: '2.5rem', sm: '3.2rem', md: '4rem' },
                          lineHeight: 1.1,
                          background: `linear-gradient(135deg, #fff 0%, ${alpha('#fff', 0.6)} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          mb: 3
                        }}
                      >
                        Plataforma Integral para Procesos Legales
                      </Typography>

                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'text.secondary', 
                          mt: 3, 
                          mb: 4,
                          maxWidth: 720, 
                          mx: { xs: 'auto', md: 0 },
                          lineHeight: 1.6,
                        }}
                      >
                        Centralice solicitudes, automatice documentos y reduzca el tiempo operacional con herramientas diseñadas para despachos y áreas jurídicas.
                      </Typography>

                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={3} 
                        sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
                      >
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<LoginIcon />}
                          component={Link}
                          to="/login"
                          sx={{
                            py: 2,
                            px: 6,
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
                            }
                          }}
                        >
                          Acceder Ahora
                        </Button>
                      </Stack>
                    </Box>

                     {/* Hero Illustration */}
                  <Box sx={{ position: 'relative' }}>
                    <GlassCard hover={false} sx={{ p: 4, textAlign: 'center' }}>
                      <Stack spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            animation: 'float 3s ease-in-out infinite',
                            '@keyframes float': {
                              '0%, 100%': { transform: 'translateY(0px)' },
                              '50%': { transform: 'translateY(-10px)' },
                            },
                          }}
                        >
                          <GavelIcon sx={{ fontSize: 60 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Sistema Jurídico
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          {['Seguro', 'Rápido', 'Eficiente'].map((text, i) => (
                            <Chip 
                              key={text}
                              label={text} 
                              size="small"
                              sx={{
                                background: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                animation: `fadeInUp 0.8s ease-out ${i * 0.2}s both`,
                                '@keyframes fadeInUp': {
                                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                                  '100%': { opacity: 1, transform: 'translateY(0)' },
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Stack>
                    </GlassCard>
                  </Box>
                  </Stack>
                </CardContent>
              </GlassCard>
            </Box>
          </Slide>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ width: '100%', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Stack spacing={8}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 900, 
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Funcionalidades Avanzadas
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary', 
                  maxWidth: 900, 
                  mx: 'auto',
                  fontSize: '1.1rem',
                  lineHeight: 1.6
                }}
              >
                Herramientas diseñadas para cubrir todo el ciclo de los procesos jurídicos con claridad y control total.
              </Typography>
            </Box>

            <Stack spacing={4}>
              {features.map((feature, i) => (
                <FeatureCard {...feature} delay={i * 200} key={i} />
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ width: '100%', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Grow in={isVisible} timeout={1500}>
            <Box>
              <GlassCard hover={false}>
                <CardContent sx={{ p: { xs: 4, md: 8 }, textAlign: 'center' }}>
                  <Stack alignItems="center" spacing={3}>
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        background: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                      }}
                    >
                      <AnalyticsIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 900,
                        background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.info.light})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      ¿Listo para transformar su práctica?
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500 }}>
                      Únase para optimizar sus procesos legales con nuestra plataforma.
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      size="large" 
                      component={Link} 
                      to="/register"
                      sx={{
                        py: 2,
                        px: 8,
                        borderRadius: '16px',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.4)}`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 32px ${alpha(theme.palette.success.main, 0.5)}`,
                        }
                      }}
                    >
                      Registrese
                    </Button>
                  </Stack>
                </CardContent>
              </GlassCard>
            </Box>
          </Grow>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        width: '100%', 
        py: 6,
        borderTop: `1px solid ${alpha('#fff', 0.05)}`,
      }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={3}>
            <img src="/logoPrincipal.png" alt="Logo" style={{ height: '60px', width: 'auto' }} />
            
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © {new Date().getFullYear()} Plataforma Corporativa Especializada
            </Typography>
            
            <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
              Todos los derechos reservados. Plataforma diseñada para profesionales del derecho.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Floating Action Button */}
      <FloatingActionButton component={Link} to="/register">
        <AutoAwesomeIcon />
      </FloatingActionButton>
    </Box>
  );
};

export default LandingPage;
