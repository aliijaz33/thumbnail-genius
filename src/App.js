import React, { useState, useRef } from 'react';
import {
  Container,
  Box,
  CssBaseline,
  Snackbar,
  Alert,
  Typography,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Fab,
  MenuItem,
  Select,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  AddPhotoAlternate as AddPhotoIcon,
  YouTube as YouTubeIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  MusicNote as TikTokIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { generateAIImage, isRealAIConfigured, AVAILABLE_MODELS } from './services/aiImageService';
import './App.css';

function AppContent() {
  const { mode: themeMode, toggleTheme } = useTheme();
  const [mode, setMode] = useState('thumbnail');
  const [prompt, setPrompt] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: <YouTubeIcon />, color: '#FF0000' },
    { id: 'instagram', name: 'Instagram', icon: <InstagramIcon />, color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2' },
    { id: 'twitter', name: 'Twitter', icon: <TwitterIcon />, color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon />, color: '#0A66C2' },
    { id: 'pinterest', name: 'Pinterest', icon: <PinterestIcon />, color: '#BD081C' },
    { id: 'tiktok', name: 'TikTok', icon: <TikTokIcon />, color: '#000000' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showSnackbar('Please enter a prompt', 'warning');
      return;
    }

    setIsGenerating(true);
    showSnackbar('Generating image...', 'info');

    try {
      const result = await generateAIImage(prompt, selectedModel, uploadedImage);
      setGeneratedImage(result);
      showSnackbar('Image generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneratedImage(null);
      showSnackbar(error.message || 'Failed to generate image', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) {
      showSnackbar('Please generate an image first', 'warning');
      return;
    }

    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
      showSnackbar('Image uploaded', 'success');
    }
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleEdit = () => {
    setEditPrompt(prompt);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    setPrompt(editPrompt);
    setEditDialogOpen(false);

    setIsGenerating(true);
    try {
      const result = await generateAIImage(editPrompt, selectedModel, uploadedImage);
      setGeneratedImage(result);
      showSnackbar('Image updated successfully!', 'success');
    } catch (error) {
      console.error('Error regenerating image:', error);
      setGeneratedImage(null);
      showSnackbar(error.message || 'Failed to regenerate image', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  isRealAIConfigured();

  return (
    <Box
      sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      className={`App ${themeMode === 'dark' ? 'dark-mode' : 'light-mode'}`}
    >
      <AppBar
        position='static'
        elevation={3}
        sx={{
          background:
            themeMode === 'dark'
              ? 'linear-gradient(135deg, #0a1449 0%, #1a0a49 100%)'
              : 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
          py: 0,
          minHeight: 80,
          borderBottom:
            themeMode === 'dark'
              ? '1px solid rgba(255,255,255,0.15)'
              : '1px solid rgba(0,0,0,0.15)',
        }}
      >
        <Toolbar sx={{ minHeight: 80, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src={require('./assets/logo.png')}
              alt='Logo'
              style={{
                height: 60,
                width: 60,
                marginRight: 16,
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border:
                  themeMode === 'dark'
                    ? '2px solid rgba(255,255,255,0.2)'
                    : '2px solid rgba(255,255,255,0.3)',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <Box>
              <Typography
                variant='h4'
                component='div'
                sx={{
                  flexGrow: 1,
                  fontWeight: 800,
                  background:
                    themeMode === 'dark'
                      ? 'linear-gradient(45deg, #90caf9, #f48fb1)'
                      : 'linear-gradient(45deg, #1976d2, #dc004e)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Thumbnail Genius
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                AI-Powered Image Generator
              </Typography>
            </Box>
          </Box>

          <Stack direction='row' spacing={1.5} sx={{ mr: 2, alignItems: 'center' }}>
            <Button
              variant={mode === 'thumbnail' ? 'contained' : 'outlined'}
              size='small'
              onClick={() => setMode('thumbnail')}
              sx={{
                borderRadius: '16px',
                fontWeight: 700,
                px: 2,
                backgroundColor:
                  mode === 'thumbnail'
                    ? 'rgba(255,255,255,0.95)'
                    : 'transparent',
                color:
                  mode === 'thumbnail'
                    ? themeMode === 'dark'
                      ? '#000'
                      : '#0d47a1'
                    : 'rgba(255,255,255,0.9)',
                border:
                  mode === 'thumbnail'
                    ? 'none'
                    : '2px solid rgba(255,255,255,0.7)',
                '&:hover': {
                  backgroundColor:
                    mode === 'thumbnail'
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.2)',
                },
              }}
            >
              Thumbnail
            </Button>
            <Button
              variant={mode === 'meme' ? 'contained' : 'outlined'}
              size='small'
              onClick={() => setMode('meme')}
              sx={{
                borderRadius: '16px',
                fontWeight: 700,
                px: 2,
                backgroundColor:
                  mode === 'meme'
                    ? 'rgba(255,255,255,0.95)'
                    : 'transparent',
                color:
                  mode === 'meme'
                    ? themeMode === 'dark'
                      ? '#000'
                      : '#0d47a1'
                    : 'rgba(255,255,255,0.9)',
                border:
                  mode === 'meme'
                    ? 'none'
                    : '2px solid rgba(255,255,255,0.7)',
                '&:hover': {
                  backgroundColor:
                    mode === 'meme'
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.2)',
                },
              }}
            >
              Meme
            </Button>
            <Button
              variant={mode === 'simple' ? 'contained' : 'outlined'}
              size='small'
              onClick={() => setMode('simple')}
              sx={{
                borderRadius: '16px',
                fontWeight: 700,
                px: 2,
                backgroundColor:
                  mode === 'simple'
                    ? 'rgba(255,255,255,0.95)'
                    : 'transparent',
                color:
                  mode === 'simple'
                    ? themeMode === 'dark'
                      ? '#000'
                      : '#0d47a1'
                    : 'rgba(255,255,255,0.9)',
                border:
                  mode === 'simple'
                    ? 'none'
                    : '2px solid rgba(255,255,255,0.7)',
                '&:hover': {
                  backgroundColor:
                    mode === 'simple'
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.2)',
                },
              }}
            >
              Simple
            </Button>
          </Stack>

          <IconButton
            onClick={toggleTheme}
            color='inherit'
            sx={{
              backgroundColor:
                themeMode === 'dark'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor:
                  themeMode === 'dark'
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.1)',
              },
              width: 40,
              height: 40,
            }}
          >
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth='md' sx={{ flexGrow: 1, py: 2 }}>
        <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minWidth: 250,
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <InputBase
                    inputRef={textareaRef}
                    multiline
                    rows={1}
                    placeholder='Describe your image...'
                    value={prompt}
                    onChange={handlePromptChange}
                    disabled={isGenerating}
                    sx={{
                      flexGrow: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      fontSize: 15,
                      maxHeight: 120,
                      overflow: 'auto',
                      backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'background.paper',
                    }}
                  />
                  <Button
                    variant='contained'
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    sx={{ minWidth: 100, height: 44, mt: 0 }}
                  >
                    {isGenerating ? (
                      <>
                        <CircularProgress size={18} sx={{ mr: 1 }} />
                        Gen
                      </>
                    ) : (
                      'Generate'
                    )}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant='caption' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
                    Model:
                  </Typography>
                  <Select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    size='small'
                    sx={{
                      minWidth: 180,
                      fontSize: 13,
                      height: 32,
                      '& .MuiSelect-select': {
                        py: 0.5,
                      },
                    }}
                  >
                    {AVAILABLE_MODELS.map((model) => (
                      <MenuItem key={model.id} value={model.id} sx={{ fontSize: 13 }}>
                        {model.name}
                      </MenuItem>
                    ))}
                  </Select>

                  <input
                    accept='image/*'
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    type='file'
                    onChange={handleImageUpload}
                  />
                  <Fab
                    component='span'
                    size='small'
                    color={uploadedImage ? 'success' : 'secondary'}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ width: 32, height: 32 }}
                  >
                    <AddPhotoIcon sx={{ fontSize: 18 }} />
                  </Fab>
                  {uploadedImage && (
                    <Chip
                      label='Image uploaded'
                      size='small'
                      variant='outlined'
                      onDelete={() => setUploadedImage(null)}
                      sx={{ fontSize: 12, height: 24 }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {mode === 'thumbnail' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant='caption' color='text.secondary'>
                  Platform:
                </Typography>
                {platforms.map((platform) => {
                  const isSelected = selectedPlatform === platform.id;
                  return (
                    <Chip
                      key={platform.id}
                      icon={platform.icon}
                      label={platform.name}
                      size='small'
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => setSelectedPlatform(platform.id)}
                      sx={{
                        borderRadius: 1,
                        backgroundColor: isSelected ? platform.color : 'transparent',
                        color: isSelected ? '#fff' : themeMode === 'dark' ? 'rgba(255,255,255,0.87)' : 'inherit',
                        borderColor: isSelected ? platform.color : themeMode === 'dark' ? 'rgba(255,255,255,0.23)' : 'rgba(0,0,0,0.23)',
                        '&:hover': {
                          backgroundColor: isSelected ? platform.color : themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                          borderColor: platform.color,
                        },
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant='subtitle1' fontWeight={600}>
              {mode === 'thumbnail' ? 'Thumbnail Preview' : mode === 'meme' ? 'Meme Preview' : 'Image Preview'}
            </Typography>

            {generatedImage && (
              <Stack direction='row' spacing={1}>
                <Button
                  variant='outlined'
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  size='small'
                >
                  Edit
                </Button>
                <Button
                  variant='contained'
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  size='small'
                  color='success'
                >
                  Download
                </Button>
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 250,
              bgcolor: 'background.default',
              borderRadius: 2,
              p: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {isGenerating ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={40} />
                <Typography variant='body2' sx={{ mt: 1.5 }}>
                  Creating your image...
                </Typography>
              </Box>
            ) : generatedImage ? (
              <Box sx={{ textAlign: 'center', maxWidth: '100%' }}>
                <img
                  src={generatedImage.imageUrl}
                  alt='Generated'
                  style={{
                    maxWidth: '100%',
                    maxHeight: 350,
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block', fontSize: 11 }}>
                  {new Date(generatedImage.generatedAt).toLocaleTimeString()}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <ImageIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                <Typography variant='body2' color='text.secondary'>
                  No image generated yet
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      <Box
        sx={{
          p: 1.5,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant='caption' color='text.secondary'>
          Thumbnail Genius © 2026
        </Typography>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Prompt</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Prompt'
            type='text'
            fullWidth
            variant='outlined'
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant='contained' disabled={isGenerating}>
            {isGenerating ? 'Regenerating...' : 'Save & Regenerate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
