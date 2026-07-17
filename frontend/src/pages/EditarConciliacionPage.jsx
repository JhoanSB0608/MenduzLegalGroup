import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConciliacionById } from '../services/conciliacionService';
import ConciliacionUnificadaForm from '../components/forms/ConciliacionUnificadaForm';
import { Container, CircularProgress, Alert, Typography, Box } from '@mui/material';

const EditarConciliacionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: solicitud, isLoading, isError, error } = useQuery({
    queryKey: ['conciliacion', id],
    queryFn: async () => {
      console.log(`[EditarConciliacionPage] Fetching conciliacion with ID: ${id}`);
      const data = await getConciliacionById(id);
      console.log('[EditarConciliacionPage] Received conciliacion data:', data);
      return data;
    },
    enabled: !!id,
  });

  const handleSubmit = (result) => {
    if (result && result._id) {
      console.log('[EditarConciliacionPage] Conciliacion actualizada correctamente.');
      queryClient.invalidateQueries(['solicitudes']);
      queryClient.invalidateQueries(['conciliacion', id]);
      navigate('/admin');
    } else {
      console.error('[EditarConciliacionPage] Error actualizando la solicitud de conciliación');
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography>Error al cargar la solicitud: {error.message}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Editar Solicitud de Conciliación
      </Typography>
      {solicitud && (
        <ConciliacionUnificadaForm
          onSubmit={handleSubmit}
          initialData={solicitud}
        />
      )}
    </Container>
  );
};

export default EditarConciliacionPage;
