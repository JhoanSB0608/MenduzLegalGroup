import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSolicitudById, updateSolicitud } from '../services/solicitudService';
import InsolvenciaForm from '../components/forms/InsolvenciaForm';
import { Container, CircularProgress, Alert, Typography, Box, useTheme, alpha } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material'; // Added missing import

const EditarInsolvenciaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme(); // Import added

  const { data: solicitud, isLoading, isError, error } = useQuery({
    queryKey: ['solicitud', id],
    queryFn: async () => {
      console.log(`[EditarInsolvenciaPage] Fetching solicitud with ID: ${id}`);
      const data = await getSolicitudById(id);
      return data;
    },
    enabled: !!id,
  });

  const { mutate: update, isLoading: isUpdating } = useMutation({
    mutationFn: (solicitudData) => {
      console.log('[EditarInsolvenciaPage] Updating solicitud with data:', solicitudData);
      return updateSolicitud(id, solicitudData);
    },
    onSuccess: () => {
      console.log('[EditarInsolvenciaPage] Solicitud updated successfully.');
      queryClient.invalidateQueries(['solicitudes']);
      queryClient.invalidateQueries(['solicitud', id]);
      navigate('/admin');
    },
    onError: (error) => {
      console.error('[EditarInsolvenciaPage] Error actualizando la solicitud:', error);
    },
  });

  const handleSubmit = (data) => {
    console.log("[EditarInsolvenciaPage] Data received from form:", data);
    update(data);
  };

  if (isLoading) {
    return (
      <Container sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={60} sx={{ color: 'var(--color-primary)' }} />
          <Typography variant="h6" sx={{ color: 'var(--color-text-muted)' }}>Cargando solicitud...</Typography>
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon fontSize="large" />} // ErrorIcon imported
          sx={{ 
            p: 3,
            borderRadius: 'var(--border-radius-xl)', // Use design token
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            boxShadow: 'var(--shadow-lg)' // Use design token
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Error al cargar la solicitud</Typography>
            <Typography variant="body1">{error.message || 'No se pudo obtener la información de la solicitud.'}</Typography>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{
          mb: 4,
          fontWeight: 700,
          background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`, // Use design tokens
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Editar Solicitud de Insolvencia
      </Typography>
      {solicitud && (
        <InsolvenciaForm
          onSubmit={handleSubmit}
          initialData={solicitud}
          isUpdating={isUpdating}
        />
      )}
    </Container>
  );
};

export default EditarInsolvenciaPage;
