import React, { useContext, useState } from 'react';
import { TextField, Button, Typography, Box, Paper, Divider, Link, alpha, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../App';
import GoogleIcon from '@mui/icons-material/Google';
import { API_BASE_URL } from '../services/userService';
import { handleAxiosError } from '../utils/alert';

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { register: registerUser } = useContext(AuthContext); // Assuming registerUser is the login function from context
  const [isSubmitting, setIsSubmitting] = useState(false);

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Assuming registerUser handles the registration logic
      await registerUser(data.email, data.password, data.fullName); 
    } catch (error) {
      handleAxiosError(error, 'Error al registrar usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Button Styles based on Design System
  const primaryButtonStyles = {
    backgroundColor: 'var(--color-cta)', // Using CTA color as primary for action
    color: 'var(--color-text)',
    padding: '12px 24px', // Matches design system button padding
    borderRadius: 'var(--border-radius-xl)', // Use design system token (was 16px)
    fontWeight: 600,
    transition: 'all 200ms ease',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-md)', // Add shadow for depth
    '&:hover': {
      backgroundColor: 'var(--color-secondary)', // Using secondary for hover effect
      opacity: 0.9,
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-lg)', // Enhance shadow on hover
    },
    '&:active': {
      transform: 'translateY(0px)', // Reset transform on active
    },
  };

  const secondaryButtonStyles = {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: `2px solid var(--color-primary)`,
    padding: '12px 24px', // Matches design system button padding
    borderRadius: 'var(--border-radius-xl)', // Use design system token (was 16px)
    fontWeight: 600,
    transition: 'all 200ms ease',
    cursor: 'pointer',
    boxShadow: 'none', // No shadow for secondary
    '&:hover': {
      color: 'var(--color-secondary)',
      border: `2px solid var(--color-secondary)`,
      opacity: 0.9,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0px)',
    },
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        // Background with glassmorphism effect using design system colors
        background: `
          linear-gradient(135deg, ${alpha('var(--color-background)', 0.2)} 0%, ${alpha('var(--color-primary)', 0.1)} 100%),
          radial-gradient(circle at 20% 80%, ${alpha('var(--color-cta)', 0.15)}, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha('var(--color-secondary)', 0.15)}, transparent 50%)
        `,
        // Add subtle animated background elements if desired, but keep it premium
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 3, sm: 4, md: 5 },
          maxWidth: 440,
          width: '100%',
          margin: 'auto',
          // Glassmorphism effect using design system tokens
          background: 'var(--color-background)', // Use dark background
          backdropFilter: 'blur(25px)', // Adjusted blur intensity
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.2)', // Subtle glass border
          borderRadius: 'var(--border-radius-xl)', // Use design system token
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.05)
          `,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: `
              0 12px 40px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1)
            `,
            transform: 'translateY(-2px)',
          },
        }}
      >
        {/* Logo/Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 'var(--border-radius-xl)', // Use design system token
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-cta) 100%)`, // Use primary and CTA colors
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(147, 51, 234, 0.4)', // Shadow related to CTA color
              mb: 2,
              '&::before': {
                content: '"🔐"', // Placeholder icon, could be SVG later
                fontSize: '28px',
              },
            }}
          />
        </Box>

        {/* Title */}
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 1,
            textAlign: 'center',
            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-cta) 100%)`, // Use primary and CTA colors
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Crear Cuenta
        </Typography>

        {/* Subtitle */}
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4,
            textAlign: 'center',
            color: 'var(--color-text-muted)', // Use muted text color
            fontSize: '0.95rem',
          }}
        >
          Únete a nosotros, es rápido y fácil
        </Typography>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('fullName', { required: 'Nombre completo es requerido' })}
            label="Nombre Completo"
            fullWidth
            margin="normal"
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--border-radius-xl)', // Use design system token
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '& fieldset': { border: '1px solid rgba(255, 255, 255, 0.3)' },
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  '& fieldset': { border: `2px solid var(--color-primary) !important` }, // Use primary color for focus
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--color-text-muted)', // Use muted text color
                '&.Mui-focused': {
                  color: 'var(--color-primary)', // Use primary color when focused
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'var(--color-text)', // Use primary text color
                '&::placeholder': {
                  color: 'var(--color-text-muted)', // Use muted text color for placeholder
                },
              },
            }}
          />
          <TextField
            {...register('email', { 
              required: 'Email es requerido',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Email no válido'
              }
            })}
            label="Email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--border-radius-xl)', // Use design system token
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '& fieldset': { border: '1px solid rgba(255, 255, 255, 0.3)' },
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  '& fieldset': { border: `2px solid var(--color-primary) !important` }, // Use primary color for focus
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--color-text-muted)', // Use muted text color
                '&.Mui-focused': {
                  color: 'var(--color-primary)', // Use primary color when focused
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'var(--color-text)', // Use primary text color
                '&::placeholder': {
                  color: 'var(--color-text-muted)', // Use muted text color for placeholder
                },
              },
            }}
          />

          <TextField
            {...register('password', { 
              required: 'Contraseña es requerida',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              }
            })}
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--border-radius-xl)', // Use design system token
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '& fieldset': { border: '1px solid rgba(255, 255, 255, 0.3)' },
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  '& fieldset': { border: `2px solid var(--color-primary) !important` }, // Use primary color for focus
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--color-text-muted)', // Use muted text color
                '&.Mui-focused': {
                  color: 'var(--color-primary)', // Use primary color when focused
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'var(--color-text)', // Use primary text color
                '&::placeholder': {
                  color: 'var(--color-text-muted)', // Use muted text color for placeholder
                },
              },
            }}
          />

          <TextField
            {...register('confirmPassword', { 
              required: 'Confirmar contraseña es requerido',
              validate: value => value === password || 'Las contraseñas no coinciden'
            })}
            label="Confirmar Contraseña"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--border-radius-xl)', // Use design system token
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '& fieldset': { border: '1px solid rgba(255, 255, 255, 0.3)' },
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  '& fieldset': { border: `2px solid var(--color-primary) !important` }, // Use primary color for focus
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--color-text-muted)', // Use muted text color
                '&.Mui-focused': {
                  color: 'var(--color-primary)', // Use primary color when focused
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'var(--color-text)', // Use primary text color
                '&::placeholder': {
                  color: 'var(--color-text-muted)', // Use muted text color for placeholder
                },
              },
            }}
          />

          <Button 
            type="submit" 
            fullWidth
            disabled={isSubmitting}
            sx={{
              ...primaryButtonStyles, // Apply primary button styles
              mt: 2,
              py: 1.5, // Vertical padding
              fontSize: '1rem',
              textTransform: 'none',
              // Background gradient updated to use primary and CTA colors
              background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-cta) 100%)`,
              boxShadow: '0 8px 24px rgba(147, 51, 234, 0.4)', // Shadow related to CTA color
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                Creando cuenta...
              </Box>
            ) : (
              'Crear Cuenta'
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(255, 255, 255, 0.2)' } }}>
          <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>O</Typography> {/* Use muted text color */}
        </Divider>

        <Button
          component="a"
          href={`${API_BASE_URL}/api/auth/google`}
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{
            ...secondaryButtonStyles, // Apply secondary button styles
            py: 1.5, // Vertical padding
            textTransform: 'none',
            borderColor: 'var(--color-text-muted)', // Use muted text for border
            color: 'var(--color-text)', // Use primary text color
            background: 'transparent', // Ensure transparent background
            '&:hover': {
              borderColor: 'var(--color-secondary)', // Use secondary for hover border
              backgroundColor: 'rgba(245, 191, 36, 0.08)', // Subtle hover background with secondary color
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          Registrarse con Google
        </Button>

        {/* Footer links */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'var(--color-text-muted)',
              '& a': {
                color: 'var(--color-primary)', // Use primary color for links
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: 'var(--color-secondary)', // Use secondary color on hover
                  textDecoration: 'underline',
                },
              },
            }}
          >
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login">Inicia Sesión</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
