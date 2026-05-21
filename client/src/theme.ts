import { createTheme } from '@mui/material/styles';

const NORD = {
  // Polar Night
  nord0: '#2e3440',
  nord1: '#3b4252',
  nord2: '#434c5e',
  nord3: '#4c566a',
  // Snow Storm
  nord4: '#d8dee9',
  nord5: '#e5e9f0',
  nord6: '#eceff4',
  // Frost
  nord7: '#8fbcbb', // turquoise/ice
  nord8: '#88c0d0', // sky blue
  nord9: '#81a1c1', // ocean blue
  nord10: '#5e81ac', // deep blue
  // Aurora
  nord11: '#bf616a', // red / error
  nord12: '#d08770', // orange / warning
  nord13: '#ebcb8b', // yellow / alert
  nord14: '#a3be8c', // green / success
  nord15: '#b48ead', // purple / info
};

export function getNordicTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: mode === 'light' 
        ? { main: NORD.nord10, light: NORD.nord8, dark: NORD.nord9, contrastText: '#ffffff' }
        : { main: NORD.nord8, light: NORD.nord7, dark: NORD.nord9, contrastText: NORD.nord0 },
      secondary: {
        main: NORD.nord7,
        contrastText: NORD.nord0,
      },
      background: mode === 'light'
        ? { default: '#f4f6f9', paper: '#ffffff' }
        : { default: NORD.nord0, paper: NORD.nord1 },
      text: mode === 'light'
        ? { primary: NORD.nord0, secondary: NORD.nord2, disabled: NORD.nord3 }
        : { primary: NORD.nord6, secondary: NORD.nord4, disabled: NORD.nord3 },
      divider: mode === 'light' ? '#eef1f6' : NORD.nord2,
      success: { main: NORD.nord14 },
      warning: { main: NORD.nord12 },
      error: { main: NORD.nord11 },
      info: { main: NORD.nord9 },
      action: {
        hover: mode === 'light' ? 'rgba(94, 129, 172, 0.04)' : 'rgba(136, 192, 208, 0.08)',
        selected: mode === 'light' ? 'rgba(94, 129, 172, 0.08)' : 'rgba(136, 192, 208, 0.16)',
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
      overline: { fontWeight: 700, letterSpacing: '0.1em' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'dark' ? `${NORD.nord3} ${NORD.nord0}` : `${NORD.nord4} #f4f6f9`,
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'dark' ? NORD.nord0 : '#f4f6f9',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'dark' ? NORD.nord3 : NORD.nord4,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: mode === 'dark' ? NORD.nord2 : NORD.nord3,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 18px',
            boxShadow: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0 4px 12px rgba(136, 192, 208, 0.25)' 
                : '0 4px 12px rgba(94, 129, 172, 0.15)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.MuiButton-containedPrimary': {
              backgroundColor: mode === 'dark' ? NORD.nord8 : NORD.nord10,
              color: mode === 'dark' ? NORD.nord0 : '#ffffff',
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#9ecfe0' : '#4e6d93',
              },
            },
            '&.MuiButton-outlined': {
              borderWidth: '1.5px',
              borderColor: mode === 'dark' ? NORD.nord3 : NORD.nord4,
              '&:hover': {
                borderWidth: '1.5px',
                borderColor: mode === 'dark' ? NORD.nord8 : NORD.nord10,
                backgroundColor: mode === 'dark' ? 'rgba(136, 192, 208, 0.04)' : 'rgba(94, 129, 172, 0.04)',
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: mode === 'dark' ? NORD.nord2 : '#eef1f6',
            boxShadow: mode === 'dark' 
              ? '0 4px 20px 0 rgba(0, 0, 0, 0.25)' 
              : '0 4px 20px 0 rgba(165, 180, 203, 0.08)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? NORD.nord0 : '#ffffff',
            borderBottom: '1px solid',
            borderBottomColor: mode === 'dark' ? NORD.nord2 : '#eef1f6',
            color: mode === 'dark' ? NORD.nord6 : NORD.nord0,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? NORD.nord0 : '#ffffff',
            borderRight: '1px solid',
            borderRightColor: mode === 'dark' ? NORD.nord2 : '#eef1f6',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              '& fieldset': {
                borderWidth: '1.5px',
                borderColor: mode === 'dark' ? NORD.nord3 : NORD.nord4,
              },
              '&:hover fieldset': {
                borderColor: mode === 'dark' ? NORD.nord8 : NORD.nord10,
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'dark' ? NORD.nord8 : NORD.nord10,
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '20px',
            padding: '8px',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: '1.25rem',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 600,
          },
        },
      },
    },
  });
}

// Keep a default theme export for backward compatibility or simple imports
const defaultTheme = getNordicTheme('light');
export default defaultTheme;
