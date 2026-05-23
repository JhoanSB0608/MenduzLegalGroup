import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField, Button, Typography, Box, Grid, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, useTheme, alpha, Stack, Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import LocationSelector from './LocationSelector';
import GlassCard from '../common/GlassCard'; // Importing from common location
import { ArchiverAnexosSection } from '../common/ArchiverAnexosSection'; // Importing from common location

const GlassTextField = React.forwardRef(({ error, ...props }, ref) => {
  return (
    <TextField
      {...props}
      inputRef={ref}
      error={error}
      variant="outlined"
      sx={{
        ...props.sx
      }}
    />
  );
});

const GlassSelect = ({ control, name, label, options, rules, error, ...props }) => {
  const selectSx = {
    minWidth: 250,
    width: '100%',
    ...props.sx
  };
  return (
      <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Controller
              name={name}
              control={control}
              rules={rules}
              defaultValue=""
              render={({ field }) => (
                  <Select
                      {...field}
                      label={label}
                      sx={selectSx}
                      {...props}
                  >
                      {options.map(option => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                  </Select>
              )}
          />
          {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
  );
};
const ArchiverConciliacionForm = ({ onSubmit, archiverEntryId, initialData, onUploadSuccess }) => {
  const theme = useTheme();
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      convocante: {
        nombreCompleto: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        email: '',
        pais: '',
        departamento: '',
        ciudad: '',
        domicilio: '',
      },
      convocado: {
        nombreCompleto: '',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        telefono: '',
        email: '',
        pais: '',
        departamento: '',
        ciudad: '',
        domicilio: '',
      },
      anexos: [],
    }
  });

  React.useEffect(() => {
    if (initialData) {
      if (initialData.convocante) {
        setValue('convocante.nombreCompleto', initialData.convocante.nombreCompleto);
        setValue('convocante.tipoIdentificacion', initialData.convocante.tipoIdentificacion);
        setValue('convocante.numeroIdentificacion', initialData.convocante.numeroIdentificacion);
        setValue('convocante.telefono', initialData.convocante.telefono);
        setValue('convocante.email', initialData.convocante.email);
        setValue('convocante.pais', initialData.convocante.pais);
        setValue('convocante.departamento', initialData.convocante.departamento);
        setValue('convocante.ciudad', initialData.convocante.ciudad);
        setValue('convocante.domicilio', initialData.convocante.domicilio);
      }
      if (initialData.convocado) {
        setValue('convocado.nombreCompleto', initialData.convocado.nombreCompleto);
        setValue('convocado.tipoIdentificacion', initialData.convocado.tipoIdentificacion);
        setValue('convocado.numeroIdentificacion', initialData.convocado.numeroIdentificacion);
        setValue('convocado.telefono', initialData.convocado.telefono);
        setValue('convocado.email', initialData.convocado.email);
        setValue('convocado.pais', initialData.convocado.pais);
        setValue('convocado.departamento', initialData.convocado.departamento);
        setValue('convocado.ciudad', initialData.convocado.ciudad);
        setValue('convocado.domicilio', initialData.convocado.domicilio);
      }
      // Annexes are handled by ArchiverAnexosSection directly, no need to set them here
      // setValue('anexos', initialData.anexos);
    }
  }, [initialData, setValue]);

  const onSubmitForm = (data) => {
    onSubmit({
      tipoSolicitud: 'Solicitud de Conciliación Unificada',
      conciliacionData: {
        convocante: data.convocante,
        convocado: data.convocado,
        // Annexes are submitted separately via ArchiverAnexosSection's upload logic
        anexos: [],
      },
    });
  };

  // Button Styles based on Design System
  const primaryButtonStyles = {
    backgroundColor: 'var(--color-cta)', // Using CTA color as primary for action, can change to gold if preferred
    color: 'var(--color-text)',
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-md)', // Was 8px, using design system token
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
    '& .MuiButton-startIcon': { // Style for the icon
      marginRight: 'var(--space-sm)',
    },
  };

  return (
    <GlassCard sx={{ p: 3 }}>
      <Stack spacing={4}>
        {/* Convocante Section */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
              <PersonIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Datos del Convocante
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12}><GlassTextField {...register('convocante.nombreCompleto', { required: 'Nombre completo del convocante es requerido' })} label="Nombre Completo del Convocante" fullWidth error={!!errors.convocante?.nombreCompleto} helperText={errors.convocante?.nombreCompleto?.message} /></Grid>
            <Grid item xs={12} sm={6}>
              <GlassSelect
                control={control}
                name="convocante.tipoIdentificacion"
                label="Tipo de Identificación"
                options={[
                  { value: 'CÉDULA DE CIUDADANÍA', label: 'CÉDULA DE CIUDADANÍA' },
                  { value: 'CÉDULA DE EXTRANJERÍA', label: 'CÉDULA DE EXTRANJERÍA' },
                  { value: 'NIT', label: 'NIT' },
                  { value: 'PASAPORTE', label: 'PASAPORTE' }
                ]}
                rules={{ required: 'Campo requerido' }}
                error={errors.convocante?.tipoIdentificacion}
              />
            </Grid>
            <Grid item xs={12} sm={6}><GlassTextField {...register('convocante.numeroIdentificacion', { required: 'Número de identificación es requerido' })} label="Número de Identificación" fullWidth error={!!errors.convocante?.numeroIdentificacion} helperText={errors.convocante?.numeroIdentificacion?.message} /></Grid>
            <Grid item xs={12} sm={6}><GlassTextField {...register('convocante.telefono', { required: 'Teléfono es requerido' })} label="Teléfono" fullWidth error={!!errors.convocante?.telefono} helperText={errors.convocante?.telefono?.message} /></Grid>
            <Grid item xs={12} sm={6}><GlassTextField {...register('convocante.email', { required: 'Email es requerido', pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })} label="Email" type="email" fullWidth error={!!errors.convocante?.email} helperText={errors.convocante?.email?.message} /></Grid>
            <LocationSelector
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              showCountry={true}
              countryFieldName="convocante.pais"
              countryLabel="País"
              countryGridProps={{ xs: 12, sm: 4 }}
              countryRules={{ required: 'Campo requerido' }}
              showDepartment={true}
              departmentFieldName="convocante.departamento"
              departmentLabel="Departamento"
              departmentGridProps={{ xs: 12, sm: 4 }}
              departmentRules={{ required: 'Campo requerido' }}
              showCity={true}
              cityFieldName="convocante.ciudad"
              cityLabel="Ciudad"
              cityGridProps={{ xs: 12, sm: 4 }}
              cityRules={{ required: 'Campo requerido' }}
            />
            <Grid item xs={12}><GlassTextField {...register('convocante.domicilio', { required: 'Dirección es requerida' })} label="Dirección" fullWidth error={!!errors.convocante?.domicilio} helperText={errors.convocante?.domicilio?.message} /></Grid>
          </Grid>
        </Box>

        {/* Convocado Section */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
              <BusinessIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Datos del Convocado
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12}><GlassTextField {...register('convocado.nombreCompleto', { required: 'Nombre completo del convocado es requerido' })} label="Nombre Completo del Convocado" fullWidth error={!!errors.convocado?.nombreCompleto} helperText={errors.convocado?.nombreCompleto?.message} /></Grid>
            <Grid item xs={12} sm={6}>
              <GlassSelect
                control={control}
                name="convocado.tipoIdentificacion"
                label="Tipo de Identificación"
                options={[
                  { value: 'CÉDULA DE CIUDADANÍA', label: 'CÉDULA DE CIUDADANÍA' },
                  { value: 'CÉDULA DE EXTRANJERÍA', label: 'CÉDULA DE EXTRANJERÍA' },
                  { value: 'NIT', label: 'NIT' },
                  { value: 'PASAPORTE', label: 'PASAPORTE' }
                ]}
                rules={{ required: 'Campo requerido' }}
                error={errors.convocado?.tipoIdentificacion}
              />
            </Grid>
            <Grid item xs={12} sm={6}><GlassTextField {...register('convocado.numeroIdentificacion', { required: 'Número de identificación es requerido' })} label="Número de Identificación" fullWidth error={!!errors.convocado?.numeroIdentificacion} helperText={errors.convocado?.numeroIdentificacion?.message} /></Grid>
            <Grid item xs={12} sm={6}><GlassTextField {...register('convocado.telefono', { required: 'Teléfono es requerido' })} label="Teléfono" fullWidth error={!!errors.convocado?.telefono} helperText={errors.convocado?.telefono?.message} /></Grid>
            <Grid item xs={12} sm={6}><GlassTextField {...register('convocado.email', { required: 'Email es requerido', pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })} label="Email" type="email" fullWidth error={!!errors.convocado?.email} helperText={errors.convocado?.email?.message} /></Grid>
            <LocationSelector
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              showCountry={true}
              countryFieldName="convocado.pais"
              countryLabel="País"
              countryGridProps={{ xs: 12, sm: 4 }}
              countryRules={{ required: 'Campo requerido' }}
              showDepartment={true}
              departmentFieldName="convocado.departamento"
              departmentLabel="Departamento"
              departmentGridProps={{ xs: 12, sm: 4 }}
              departmentRules={{ required: 'Campo requerido' }}
              showCity={true}
              cityFieldName="convocado.ciudad"
              cityLabel="Ciudad"
              cityGridProps={{ xs: 12, sm: 4 }}
              cityRules={{ required: 'Campo requerido' }}
            />
            <Grid item xs={12}><GlassTextField {...register('convocado.domicilio', { required: 'Dirección es requerida' })} label="Dirección" fullWidth error={!!errors.convocado?.domicilio} helperText={errors.convocado?.domicilio?.message} /></Grid>
          </Grid>
        </Box>

        <Button
          variant="contained"
          onClick={handleSubmit(onSubmitForm)}
          startIcon={<SaveIcon />}
          sx={{ 
            mt: 2, // Margin top
            ...primaryButtonStyles, // Apply primary button styles
          }}
        >
          Guardar Solicitud
        </Button>

        <Typography variant="h6" sx={{ fontWeight: 700, mt: 4 }}>Anexos/Documentos</Typography>
        <ArchiverAnexosSection anexos={initialData?.anexos || []} archiverEntryId={archiverEntryId} onUploadSuccess={onUploadSuccess} />
      </Stack>
    </GlassCard>
  );
};

export default ArchiverConciliacionForm;
