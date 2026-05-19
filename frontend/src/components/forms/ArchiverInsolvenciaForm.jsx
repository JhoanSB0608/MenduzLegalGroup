import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  TextField, Button, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, useTheme, alpha, Stack, Avatar,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import LocationSelector from './LocationSelector';
import GlassCard from '../common/GlassCard'; // Importing from common location
import { ArchiverAnexosSection } from '../common/ArchiverAnexosSection'; // Importing from common location

const GlassTextField = React.forwardRef(({ error, ...props }, ref) => {
  const theme = useTheme();
  
  return (
    <TextField
      {...props}
      inputRef={ref}
      error={error}
      sx={{
        '& .MuiOutlinedInput-root': {
          // Use design system border radius
          borderRadius: 'var(--border-radius-md)', // Was 12px
          background: 'rgba(255, 255, 255, 0.08)', // This might need adjustment based on design system palette/opacity
          backdropFilter: 'blur(10px)', // Keep blur effect
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& fieldset': {
            // Use a more premium border, maybe slightly darker or colored
            border: '1px solid rgba(255, 255, 255, 0.2)', // Adjust border opacity/color
          },
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.12)',
            transform: 'translateY(-1px)',
            '& fieldset': {
              border: '1px solid rgba(255, 255, 255, 0.3)',
            },
          },
          '&.Mui-focused': {
            background: 'rgba(255, 255, 255, 0.15)',
            '& fieldset': {
              // Use theme primary color for focus, but ensure it aligns with design system
              border: `2px solid ${error ? theme.palette.error.main : 'var(--color-primary)'} !important`,
            },
          },
          '&.Mui-error': {
            '& fieldset': {
              border: `1px solid ${alpha(theme.palette.error.main, 0.5)}`,
            },
          },
        },
        '& .MuiInputLabel-root': {
          // Label color might need adjustment for dark background
          color: 'var(--color-text-muted)',
          '&.Mui-focused': {
            color: error ? theme.palette.error.main : 'var(--color-primary)',
          },
        },
        ...props.sx
      }}
    />
  );
});

const GlassSelect = ({ control, name, label, options, rules, error, ...props }) => {
  const theme = useTheme();
  const selectSx = {
    minWidth: 250,
    width: '100%',
    // Use design system border radius
    borderRadius: 'var(--border-radius-md)', // Was 12px
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid rgba(255, 255, 255, 0.2)', // Adjust border opacity/color
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      // Use theme primary color for focus, but ensure it aligns with design system
      border: `2px solid ${error ? theme.palette.error.main : 'var(--color-primary)'} !important`,
    },
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.12)',
    },
    '&.Mui-focused': {
        background: 'rgba(255, 255, 255, 0.15)',
    },
    // Style for the dropdown menu itself
    '& .MuiDropdown-paper': { // Note: MuiDropdown-paper might not be a standard class, usually it's '.MuiPaper-root' inside the MenuList/Popover
        borderRadius: 'var(--border-radius-lg)', // Use larger radius for menu
        boxShadow: 'var(--shadow-lg)',
        background: 'var(--color-background)', // Dark background for menu
        color: 'var(--color-text)',
        '& .MuiMenuItem-root': {
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle hover for menu items
            },
            '&.Mui-selected': {
                backgroundColor: 'rgba(245, 158, 11, 0.1)', // Example: Using a transparent primary color for selected item
            }
        }
    }
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

const ArchiverInsolvenciaForm = ({ onSubmit, archiverEntryId, initialData, onUploadSuccess }) => {
  const theme = useTheme();
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      deudor: {
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
      setValue('deudor.nombreCompleto', initialData.deudor.nombreCompleto);
      setValue('deudor.tipoIdentificacion', initialData.deudor.tipoIdentificacion);
      setValue('deudor.numeroIdentificacion', initialData.deudor.numeroIdentificacion);
      setValue('deudor.telefono', initialData.deudor.telefono);
      setValue('deudor.email', initialData.deudor.email);
      setValue('deudor.pais', initialData.deudor.pais);
      setValue('deudor.departamento', initialData.deudor.departamento);
      setValue('deudor.ciudad', initialData.deudor.ciudad);
      setValue('deudor.domicilio', initialData.deudor.domicilio);
    }
  }, [initialData, setValue]);

  const onSubmitForm = (data) => {
    onSubmit({
      tipoSolicitud: 'Solicitud de Insolvencia Económica',
      insolvenciaData: {
        deudor: data.deudor,
        // Annexes are handled by ArchiverAnexosSection directly, not passed here initially
        anexos: [], 
      },
    });
  };

  // Button Styles based on Design System
  const primaryButtonStyles = {
    backgroundColor: 'var(--color-cta)', // Using CTA color as primary for action
    color: 'var(--color-text)',
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-md)', // Use design system token
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

  const secondaryButtonStyles = {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: `2px solid var(--color-primary)`,
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-md)', // Use design system token
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
     '& .MuiButton-startIcon': { // Style for the icon
      marginRight: 'var(--space-sm)',
    },
  };

  return (
    <GlassCard sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
            <GavelIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Datos del Deudor (Insolvencia)
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12}><GlassTextField {...register('deudor.nombreCompleto', { required: 'Nombre completo del deudor es requerido' })} label="Nombre Completo del Deudor" fullWidth error={!!errors.deudor?.nombreCompleto} helperText={errors.deudor?.nombreCompleto?.message} /></Grid>
          <Grid item xs={12} sm={6}>
            <GlassSelect
              control={control}
              name="deudor.tipoIdentificacion"
              label="Tipo de Identificación"
              options={[
                { value: 'CÉDULA DE CIUDADANÍA', label: 'CÉDULA DE CIUDADANÍA' },
                { value: 'CÉDULA DE EXTRANJERÍA', label: 'CÉDULA DE EXTRANJERÍA' },
                { value: 'NIT', label: 'NIT' },
                { value: 'PASAPORTE', label: 'PASAPORTE' }
              ]}
              rules={{ required: 'Campo requerido' }}
              error={errors.deudor?.tipoIdentificacion}
            />
          </Grid>
          <Grid item xs={12} sm={6}><GlassTextField {...register('deudor.numeroIdentificacion', { required: 'Número de identificación es requerido' })} label="Número de Identificación" fullWidth error={!!errors.deudor?.numeroIdentificacion} helperText={errors.deudor?.numeroIdentificacion?.message} /></Grid>
          <Grid item xs={12} sm={6}><GlassTextField {...register('deudor.telefono', { required: 'Teléfono es requerido' })} label="Teléfono" fullWidth error={!!errors.deudor?.telefono} helperText={errors.deudor?.telefono?.message} /></Grid>
          <Grid item xs={12} sm={6}><GlassTextField {...register('deudor.email', { required: 'Email es requerido', pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } })} label="Email" type="email" fullWidth error={!!errors.deudor?.email} helperText={errors.deudor?.email?.message} /></Grid>
          <LocationSelector
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            showCountry={true}
            countryFieldName="deudor.pais"
            countryLabel="País"
            countryGridProps={{ xs: 12, sm: 4 }}
            countryRules={{ required: 'Campo requerido' }}
            showDepartment={true}
            departmentFieldName="deudor.departamento"
            departmentLabel="Departamento"
            departmentGridProps={{ xs: 12, sm: 4 }}
            departmentRules={{ required: 'Campo requerido' }}
            showCity={true}
            cityFieldName="deudor.ciudad"
            cityLabel="Ciudad"
            cityGridProps={{ xs: 12, sm: 4 }}
            cityRules={{ required: 'Campo requerido' }}
          />
          <Grid item xs={12}><GlassTextField {...register('deudor.domicilio', { required: 'Dirección es requerida' })} label="Dirección" fullWidth error={!!errors.deudor?.domicilio} helperText={errors.deudor?.domicilio?.message} /></Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={handleSubmit(onSubmitForm)}
          startIcon={<SaveIcon />}
          sx={{ mt: 2 }}
        >
          Guardar Solicitud
        </Button>

        <Typography variant="h6" sx={{ fontWeight: 700, mt: 4 }}>Anexos/Documentos</Typography>
        <ArchiverAnexosSection anexos={initialData?.anexos || []} archiverEntryId={archiverEntryId} onUploadSuccess={onUploadSuccess} />
      </Stack>
    </GlassCard>
  );
};

export default ArchiverInsolvenciaForm;
