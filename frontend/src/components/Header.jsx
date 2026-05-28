import React, { useContext } from 'react';
import { AppBar, Toolbar, Button, Box, alpha, useTheme, Stack, Avatar, Typography, IconButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext, ThemeContext } from '../App';
import { 
  Logout as LogoutIcon, 
  AdminPanelSettings as AdminIcon, 
  AccountBalanceWallet as WalletIcon, 
  AddCircleOutline as AddIcon,
  Archive as ArchiveIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { mode, toggleTheme } = useContext(ThemeContext);
  const theme = useTheme();
  const location = useLocation();
  const homePath = user ? '/admin' : '/';

  const navItems = [
    { label: 'Acreedores', path: '/acreedores', icon: WalletIcon, color: theme.palette.info.main },
    { label: 'Nueva Solicitud', path: '/nueva-solicitud', icon: AddIcon, color: theme.palette.success.main },
    { label: 'Archivador', path: '/archiver', icon: ArchiveIcon, color: theme.palette.warning.main },
  ];

  if (user?.isAdmin) {
    navItems.push({ label: 'Admin', path: '/admin', icon: AdminIcon, color: theme.palette.primary.light });
  }

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        top: 0, 
        zIndex: 1100,
        background: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: { xs: '70px', sm: '80px' },
          px: { xs: 2, sm: 4 },
          justifyContent: 'space-between'
        }}
      >
        <Box
          component={Link}
          to={homePath}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
        >
          <img src="/logoPrincipal.png" alt="MenduzLegalGroup Logo" style={{ height: '80px', width: 'auto' }} />
        </Box>
        
        <Stack direction="row" spacing={1} alignItems="center">
          {user ? (
            <>
              <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Button 
                      key={item.path}
                      component={Link} 
                      to={item.path}
                      startIcon={<item.icon />}
                      sx={{
                        borderRadius: '12px',
                        px: 2,
                        py: 1,
                        color: isActive ? '#fff' : alpha(theme.palette.text.primary, 0.6),
                        background: isActive ? alpha(item.color, 0.15) : 'transparent',
                        border: `1px solid ${isActive ? alpha(item.color, 0.3) : 'transparent'}`,
                        fontWeight: isActive ? 700 : 500,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: alpha(item.color, 0.2),
                          color: theme.palette.text.primary,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ 
                  display: { xs: 'none', sm: 'flex' }, 
                  alignItems: 'center', 
                  gap: 1.5,
                  p: '6px 16px',
                  borderRadius: '100px',
                  background: alpha(theme.palette.text.primary, 0.05),
                  border: `1px solid ${alpha('#fff', 0.1)}`,
                }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main, fontSize: '0.875rem' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: alpha(theme.palette.text.primary, 0.9) }}>
                    {user.name}
                  </Typography>
                </Box>

                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    color: mode === 'dark'
                      ? theme.palette.warning.light
                      : theme.palette.primary.main,
                    background:
                      mode === 'dark'
                        ? alpha(theme.palette.warning.main, 0.12)
                        : alpha(theme.palette.primary.main, 0.12),
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(15deg)',
                      background:
                        mode === 'dark'
                          ? alpha(theme.palette.warning.main, 0.2)
                          : alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>

                <IconButton 
                  onClick={logout}
                  sx={{ 
                    color: theme.palette.error.light,
                    background: alpha(theme.palette.error.main, 0.1),
                    borderRadius: '12px',
                    '&:hover': {
                      background: alpha(theme.palette.error.main, 0.2),
                      transform: 'rotate(15deg)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Stack>
            </>
          ) : (
            <Stack direction="row" spacing={2}>

              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: mode === 'dark'
                    ? theme.palette.warning.light
                    : theme.palette.primary.main,
                  background:
                    mode === 'dark'
                      ? alpha(theme.palette.warning.main, 0.12)
                      : alpha(theme.palette.primary.main, 0.12),
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(15deg)',
                    background:
                      mode === 'dark'
                        ? alpha(theme.palette.warning.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              <Button 
                component={Link} 
                to="/login"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  '&:hover': { background: alpha(theme.palette.text.primary, 0.05) }
                }}
              >
                Iniciar Sesión
              </Button>

              <Button 
                variant="contained"
                component={Link} 
                to="/register"
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  px: 3,
                  boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
                }}
              >
                Empezar
              </Button>
            </Stack>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
