// File: themes/appleTheme.ts
import { createTheme } from '@mui/material/styles';

export const appleTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // Apple's blue
      light: '#5AC8FA',
      dark: '#0056b3'
    },
    background: {
      default: '#F2F2F7', // iOS light background
      paper: '#FFFFFF'
    },
    text: {
      primary: '#000000',
      secondary: '#8E8E93'
    },
    success: {
      main: '#34C759', // Apple's green
    },
    warning: {
      main: '#FF9500', // Apple's orange
    },
    error: {
      main: '#FF3B30', // Apple's red
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.3px'
    }
  },
  components:  {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.12)'
          }
        }
      }
    }
  }
});
