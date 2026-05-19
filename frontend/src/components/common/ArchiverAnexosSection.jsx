import React, { useState } from 'react';
import {
  Button, Typography, Box, Stack, Avatar, IconButton, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, useTheme, alpha, List, Paper
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Close as CloseIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { uploadFile, downloadFile } from '../../services/fileStorageService';
import { showSuccess, handleAxiosError } from '../../utils/alert';
import { toast } from 'react-toastify';
import { uploadArchiverAnexo } from '../../services/archiverService';

// Reusable Description Modal component
const DescriptionModal = ({ open, onClose, onConfirm, defaultValue = '' }) => {
  const theme = useTheme();
  const [description, setDescription] = useState(defaultValue);

  const primaryButtonStyles = {
    backgroundColor: 'var(--color-cta)',
    color: 'var(--color-text)',
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: 600,
    transition: 'all 200ms ease',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-md)',
    '&:hover': {
      backgroundColor: 'var(--color-secondary)',
      opacity: 0.9,
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-lg)',
    },
    '&:active': {
      transform: 'translateY(0px)',
    },
    '& .MuiButton-startIcon': {
      marginRight: 'var(--space-sm)',
    },
  };

  const secondaryButtonStyles = {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: `2px solid var(--color-primary)`,
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-md)',
    fontWeight: 600,
    transition: 'all 200ms ease',
    cursor: 'pointer',
    boxShadow: 'none',
    '&:hover': {
      color: 'var(--color-secondary)',
      border: `2px solid var(--color-secondary)`,
      opacity: 0.9,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0px)',
    },
    '& .MuiButton-startIcon': {
      marginRight: 'var(--space-sm)',
    },
  };

  const handleConfirm = () => {
    onConfirm(description);
    setDescription(''); // Reset description after confirming
  };

  const handleClose = () => {
    onClose();
    setDescription(''); // Reset description on close
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{
        sx: {
          // Update modal styling based on design system
          borderRadius: 'var(--border-radius-lg)', // Use design system token
          background: 'var(--color-background)', // Use design system background color
          backdropFilter: 'blur(10px)', // Adjusted for a more pronounced glass effect
          border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border
          boxShadow: 'var(--shadow-lg)', // Use design system shadow token
          padding: 'var(--space-lg)', // Use design system token for padding
        }
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(8px)', // Adjusted blur for backdrop
          backgroundColor: alpha(theme.palette.common.black, 0.5),
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`, // Subtle border
          background: `linear-gradient(135deg, ${alpha('#F59E0B', 0.08)} 0%, ${alpha('#FBBF24', 0.08)} 100%)`, // Use primary/secondary for gradient
          py: 3, // Vertical padding
          px: 3, // Horizontal padding
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 700 }}> {/* Use bold weight */}
            ¿Desea añadir una descripción al Anexo?
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ py: 3, px: 3 }}> {/* Adjust padding */}
        <TextField
          autoFocus
          margin="dense"
          label="Descripción (Opcional)"
          type="text"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
          sx={{ // Apply glass effect to TextField if needed, or rely on parent styling
            '& .MuiOutlinedInput-root': {
              borderRadius: 'var(--border-radius-md)', // Use design token
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.12)',
                '& fieldset': { border: '1px solid rgba(255, 255, 255, 0.3)' },
              },
              '&.Mui-focused': {
                background: 'rgba(255, 255, 255, 0.15)',
                '& fieldset': { border: `2px solid var(--color-primary) !important` }, // Use primary color for focus
              },
            },
            '& .MuiInputLabel-root': {
              color: 'var(--color-text-muted)', // Use muted text color
              '&.Mui-focused': {
                color: 'var(--color-primary)', // Use primary color when focused
              },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: `1px solid rgba(255, 255, 255, 0.1)` }}> {/* Adjust padding and border */}
        <Button onClick={handleClose} color="inherit" sx={{ ...secondaryButtonStyles, background: 'transparent', border: 'none', fontWeight: 500 }}> {/* Inherit color, but make less prominent */}
          Cancelar
        </Button>
        <Button onClick={() => onConfirm('')} color="primary"> {/* This button can use the standard secondary styles */}
          Omitir descripción
        </Button>
        <Button onClick={handleConfirm} variant="contained" sx={{ ...primaryButtonStyles }}> {/* Apply primary button styles */}
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Reusable GlassCard component adapted for the new design system
const GlassCard = ({ children, sx = {}, hover = true, ...props }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        // Updated styling to match the design system
        background: 'var(--color-background)', // Dark background
        backdropFilter: 'blur(10px)', // Adjusted blur for a more subtle glass effect
        border: '1px solid rgba(255, 255, 255, 0.1)', // Subtle border, adjust if design system specifies differently
        borderRadius: 'var(--border-radius-lg)', // Use design system token
        padding: 'var(--space-lg)', // Use design system token
        boxShadow: 'var(--shadow-md)', // Use design system shadow token
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 200ms ease', // Use design system transition speed
        cursor: 'pointer', // Add cursor pointer as per design system
        ...(hover && {
          '&:hover': {
            boxShadow: 'var(--shadow-lg)', // Use larger shadow on hover as per design system
            transform: 'translateY(-2px)', // Match design system hover effect
          }
        }),
        // The ::before element might need refinement based on the overall liquid glass effect or if it clashes with new styles.
        // For now, keeping it as a subtle accent, but it can be removed or modified.
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          // Using primary/secondary gold tones for the accent bar
          background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`, 
          opacity: 0.8,
          transition: 'opacity 0.3s ease',
        },
        // Remove hover effect from ::before if it's causing issues or not desired
        ...(hover && {
          '&:hover::before': {
            opacity: 1, // Full opacity on hover for the accent bar
          }
        }),
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

export const ArchiverAnexosSection = ({ anexos, archiverEntryId, onUploadSuccess }) => {
  const theme = useTheme();
  const fileInputRef = React.useRef(null);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [currentFileToUpload, setCurrentFileToUpload] = useState(null);
  const [uploadingAnexo, setUploadingAnexo] = useState(false);

  const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
          setCurrentFileToUpload(file);
          setIsDescriptionModalOpen(true);
      }
      // Reset the input value so the same file can be selected again
      event.target.value = null;
  };

  const handleDescriptionConfirm = async (description) => {
    setIsDescriptionModalOpen(false);
    if (!description && !currentFileToUpload) return;
    if (!archiverEntryId) return;

    setUploadingAnexo(true);
    try {
        let fileUrl = '';
        let uniqueFilename = '';
        let fileSize = 0;

        if (currentFileToUpload) {
            const uploadResult = await uploadFile(currentFileToUpload);
            fileUrl = uploadResult.fileUrl;
            uniqueFilename = uploadResult.uniqueFilename;
            fileSize = currentFileToUpload.size;
        }

        const payload = {
            name: uniqueFilename || ' ',
            url: fileUrl,
            descripcion: description,
            size: fileSize,
        };

        await uploadArchiverAnexo(archiverEntryId, payload);

        showSuccess("Información guardada con éxito");
        onUploadSuccess();
    } catch (error) {
        handleAxiosError(error, "Error al subir la información.");
    } finally {
        setUploadingAnexo(false);
        setCurrentFileToUpload(null);
    }
  };

  const handleDownload = async (anexo) => {
    if (!anexo.url) {
        toast.info("Este anexo es solo una nota de texto.");
        return;
    }
    if (!anexo.name) {
        toast.error("Nombre del archivo no encontrado.");
        return;
    }
    const toastId = toast.loading(`Descargando ${anexo.name}, por favor espere...`);
    try {
      await downloadFile(anexo.name);
      toast.update(toastId, { 
        render: "¡Descarga Completada!", 
        type: "success", 
        isLoading: false, 
        autoClose: 5000 
      });
    } catch (error) {
      toast.dismiss(toastId);
      handleAxiosError(error, `Error al descargar el archivo: ${error.message}`);
    }
  };

  // Button Styles based on Design System (defined here for ArchiverAnexosSection)
  const primaryButtonStyles = {
    backgroundColor: 'var(--color-cta)', // Using CTA color as primary for action
    color: 'var(--color-text)',
    padding: '12px 24px', // Matches design system button padding
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
    padding: '12px 24px', // Matches design system button padding
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
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={uploadingAnexo && currentFileToUpload ? <CircularProgress size={20} /> : <UploadFileIcon />}
          variant="contained"
          onClick={() => fileInputRef.current.click()}
          disabled={uploadingAnexo || !archiverEntryId}
          sx={{ 
            ...primaryButtonStyles, // Use defined primary button styles
            textTransform: 'none', // Ensure text is not all caps
            fontWeight: 600,
            py: 1.5, // Vertical padding
          }}
        >
          {uploadingAnexo && currentFileToUpload ? 'Subiendo...' : 'Subir Documento'}
        </Button>
        <Button
          startIcon={uploadingAnexo && !currentFileToUpload ? <CircularProgress size={20} /> : <DescriptionIcon />}
          variant="outlined"
          onClick={() => setIsDescriptionModalOpen(true)}
          disabled={uploadingAnexo || !archiverEntryId}
          sx={{ 
            ...secondaryButtonStyles, // Use defined secondary button styles
            textTransform: 'none', // Ensure text is not all caps
            fontWeight: 600,
            py: 1.5, // Vertical padding
          }}
        >
          {uploadingAnexo && !currentFileToUpload ? 'Guardando...' : 'Añadir Nota / Descripción'}
        </Button>
      </Stack>
      <Typography variant="caption" display="block" sx={{ mb: 2, color: 'var(--color-text-muted)' }}> {/* Use muted text color */}
        {archiverEntryId ? '' : 'Guarde el formulario para poder subir anexos.'}
      </Typography>
      
      <List>
        {anexos?.map((anexo, index) => (
          <GlassCard
            key={index}
            hover={false} // Disable hover effect for list items for a cleaner look
            sx={{
              p: 1.5,
              // Subdued glass effect for list items
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.2)} 0%, ${alpha(theme.palette.background.paper, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: alpha('#F59E0B', 0.1), color: 'var(--color-primary)', width: 36, height: 36 }}> {/* Use primary color for avatar */}
                  <DescriptionIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{anexo.name}</Typography>
                  <Typography variant="caption" color="var(--color-text-muted)">{anexo.descripcion} - {anexo.size ? `${(anexo.size / 1024).toFixed(2)} KB` : 'N/A KB'}</Typography>
                </Box>
              </Stack>
              <IconButton 
                edge="end" 
                onClick={() => handleDownload(anexo)}
                sx={{
                  // Apply subtle premium styling to download button
                  bgcolor: alpha('#FBBF24', 0.1),
                  color: 'var(--color-secondary)',
                  '&:hover': {
                    bgcolor: alpha('#FBBF24', 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                  borderRadius: 'var(--border-radius-md)', // Apply token
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Stack>
          </GlassCard>
        ))}
      </List>
      <DescriptionModal
        open={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        onConfirm={handleDescriptionConfirm}
        defaultValue={currentFileToUpload?.name || ''}
      />
    </Box>
  );
};
