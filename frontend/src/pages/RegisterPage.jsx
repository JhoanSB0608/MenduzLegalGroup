import React, { useContext, useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Divider, alpha, useTheme, Stack, Avatar, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../App';
import GoogleIcon from '@mui/icons-material/Google';
import { API_BASE_URL } from '../services/userService';
import { handleAxiosError } from '../utils/alert';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const theme = useTheme();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { register: registerUser } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const password = watch('password');

  const onSubmit = async (data) => {
    
    setIsSubmitting(true);
    try {
      const result = await registerUser(data.fullName, data.email, data.password);
      console.log('[RegisterPage] Registro exitoso. Respuesta:', result);
    } catch (error) {
      console.error('[RegisterPage] Error detectado en el bloque catch:', error);
      if (error.response) {
        console.error('[RegisterPage] Respuesta del servidor con error:', error.response.data);
        console.error('[RegisterPage] Status del error:', error.response.status);
      }
      handleAxiosError(error, 'Error al registrar usuario.');
    } finally {
      setIsSubmitting(false);
      console.log('[RegisterPage] Finalizado intento de registro.');
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
          maxWidth: 480,
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
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
              border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`
            }}
          >
            <PersonAddOutlinedIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Crear Cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Únete a nosotros y comienza tu experiencia
            </Typography>
          </Box>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              {...register('fullName', { required: 'Nombre completo es requerido' })}
              label="Nombre Completo"
              fullWidth
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />

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
                    required: 'Contraseña requerida',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                  })}
                  label="Contraseña"
                  type="password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
                <TextField
                  {...register('confirmPassword', { 
                    required: 'Confirma tu contraseña',
                    validate: value => value === password || 'No coinciden'
                  })}
                  label="Confirmar"
                  type="password"
                  fullWidth
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />

            <Button 
              type="submit" 
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ 
                mt: 2,
                py: 1.8, 
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                }
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Registrarme'}
            </Button>
          </Stack>
        </form>

        <Divider sx={{ my: 4 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>O REGÍSTRATE CON</Typography>
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
           color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              background: alpha(theme.palette.secondary.main, 0.05),
            }
          }}
        >
          Google Cloud Register
        </Button>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes una cuenta?{' '}
            <Button 
              component={Link} 
              to="/login" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.secondary.light,
                p: 0,
                minWidth: 'auto',
                ml: 0.5,
                textDecoration: 'none',
                '&:hover': { background: 'none', textDecoration: 'underline' }
              }}
            >
              Inicia Sesión
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
