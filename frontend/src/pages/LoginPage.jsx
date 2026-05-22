import React, { useContext, useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Divider, alpha, useTheme, Stack, Avatar } from '@mui/material';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../App';
import GoogleIcon from '@mui/icons-material/Google';
import { API_BASE_URL } from '../services/userService';
import { handleAxiosError } from '../utils/alert';
import { Link } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const LoginPage = () => {
  const theme = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      handleAxiosError(error, 'Email o contraseña incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 4, sm: 6 },
          maxWidth: 450,
          width: '100%',
          background: `linear-gradient(135deg, ${alpha('#fff', 0.05)} 0%, ${alpha('#fff', 0.02)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Stack spacing={3} alignItems="center" sx={{ mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Bienvenido
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Ingresa tus credenciales para acceder al sistema jurídico
            </Typography>
          </Box>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <TextField
              {...register('email', { 
                required: 'Email es requerido',
                pattern: { value: /^\S+@\S+$/i, message: 'Email no válido' }
              })}
              label="Correo electrónico"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              {...register('password', { 
                required: 'Contraseña es requerida',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })}
              label="Contraseña"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button 
              type="submit" 
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ 
                py: 1.8, 
                fontSize: '1rem',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>O CONTINUAR CON</Typography>
        </Divider>

        <Button
          component="a"
          href={`${API_BASE_URL}/api/auth/google`}
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            borderColor: 'rgba(255,255,255,0.1)',
            color: '#fff',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              background: alpha(theme.palette.primary.main, 0.05),
            }
          }}
        >
          Google Cloud Login
        </Button>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            ¿Aún no tienes cuenta?{' '}
            <Button 
              component={Link} 
              to="/register" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.light,
                p: 0,
                minWidth: 'auto',
                ml: 0.5,
                textDecoration: 'none',
                '&:hover': { background: 'none', textDecoration: 'underline' }
              }}
            >
              Regístrate
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
