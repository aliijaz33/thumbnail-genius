import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Check localStorage or system preference
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode) {
      return savedMode;
    }
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1976d2',
        light: mode === 'dark' ? '#e3f2fd' : '#bbdefb',
        dark: mode === 'dark' ? '#42a5f5' : '#1565c0',
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#dc004e',
        light: mode === 'dark' ? '#fce4ec' : '#f8bbd9',
        dark: mode === 'dark' ? '#ec407a' : '#c51162',
      },
      success: {
        main: mode === 'dark' ? '#81c784' : '#4caf50',
      },
      warning: {
        main: mode === 'dark' ? '#ffb74d' : '#ff9800',
      },
      error: {
        main: mode === 'dark' ? '#e57373' : '#f44336',
      },
      info: {
        main: mode === 'dark' ? '#64b5f6' : '#2196f3',
      },
      background: {
        default:
          mode === 'dark'
            ? 'linear-gradient(135deg, #050505 0%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
        paper:
          mode === 'dark'
            ? 'rgba(20, 20, 20, 0.95)'
            : 'rgba(255, 255, 255, 0.98)',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#000000',
        secondary: mode === 'dark' ? '#aaaaaa' : '#555555',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.5px',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.3px',
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.5px',
      },
    },
    shape: {
      borderRadius: 16,
    },
    shadows:
      mode === 'dark'
        ? [
            'none',
            '0px 2px 10px rgba(0,0,0,0.3)',
            '0px 4px 20px rgba(0,0,0,0.4)',
            '0px 8px 30px rgba(0,0,0,0.5)',
            '0px 16px 40px rgba(0,0,0,0.6)',
            ...Array(20).fill('none'),
          ]
        : [
            'none',
            '0px 2px 10px rgba(0,0,0,0.05)',
            '0px 4px 20px rgba(0,0,0,0.08)',
            '0px 8px 30px rgba(0,0,0,0.1)',
            '0px 16px 40px rgba(0,0,0,0.12)',
            ...Array(20).fill('none'),
          ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow:
                mode === 'dark'
                  ? '0 6px 20px rgba(144, 202, 249, 0.3)'
                  : '0 6px 20px rgba(25, 118, 210, 0.2)',
            },
          },
          contained: {
            background:
              mode === 'dark'
                ? 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)'
                : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            boxShadow:
              mode === 'dark'
                ? '0 4px 15px rgba(25, 118, 210, 0.4)'
                : '0 4px 15px rgba(25, 118, 210, 0.3)',
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backdropFilter: 'blur(10px)',
            boxShadow:
              mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border:
              mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow:
                mode === 'dark'
                  ? '0 12px 40px rgba(0, 0, 0, 0.5)'
                  : '0 12px 40px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.3s ease',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#90caf9' : '#1976d2',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                  borderColor: mode === 'dark' ? '#90caf9' : '#1976d2',
                },
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
