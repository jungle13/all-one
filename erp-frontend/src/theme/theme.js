// PATH: erp-frontend/src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const baseTypography = {
  fontFamily: `'InterVariable', 'Inter var', Inter, Roboto, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`,
  h1: { fontSize: 36, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 },
  h2: { fontSize: 30, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.25 },
  h3: { fontSize: 24, fontWeight: 700, lineHeight: 1.3 },
  h4: { fontSize: 20, fontWeight: 700, lineHeight: 1.35 },
  h5: { fontSize: 18, fontWeight: 600 },
  h6: { fontSize: 16, fontWeight: 600 },
  subtitle1: { fontSize: 15, lineHeight: 1.5 },
  body1: { fontSize: 14, lineHeight: 1.6 },
  body2: { fontSize: 13, lineHeight: 1.6 },
  button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  caption: { fontSize: 12 },
  overline: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
};

const tokens = {
  dark: {
    palette: {
      mode: 'dark',
      primary:   { main: '#22C55E', contrastText: '#0B1110' },
      secondary: { main: '#10B981' },
      success:   { main: '#22C55E' },
      info:      { main: '#2DD4BF' },
      warning:   { main: '#F59E0B' },
      error:     { main: '#EF4444' },
      background: { default: '#0B1512', paper: '#0F1F1A' },
      text: { primary: '#E6FFF3', secondary: '#9BD3B0' },
      divider: 'rgba(226, 252, 239, 0.08)',
    },
    shape: { borderRadius: 14 },
    typography: {
      ...baseTypography,
      subtitle1: { ...baseTypography.subtitle1, color: '#9BD3B0' },
      body2: { ...baseTypography.body2, color: '#9BD3B0' },
      caption: { ...baseTypography.caption, color: '#8EBFA6' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollBehavior: 'smooth' },
          body: {
            backgroundColor: '#0B1512',
            backgroundImage:
              'radial-gradient(1200px 600px at -10% -10%, rgba(34,197,94,0.08), transparent 40%), radial-gradient(800px 400px at 110% -10%, rgba(16,185,129,0.08), transparent 40%)',
          },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': { background: '#274034', borderRadius: 8 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: 'none',
            backgroundColor: '#0F1F1A',
            color: '#E6FFF3', // fuerza color de texto/iconos en dark
            boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
            borderBottom: '1px solid rgba(226,252,239,0.06)',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: '1px solid rgba(226,252,239,0.06)',
            backgroundImage:
              'linear-gradient(180deg, rgba(34,197,94,0.06), rgba(34,197,94,0.01))',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 999, paddingInline: 16 },
          containedPrimary: { color: '#0B1110' },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: { '& th': { fontWeight: 700, background: 'rgba(34,197,94,0.08)' } },
        },
      },
    },
  },

  light: {
    palette: {
      mode: 'light',
      primary:   { main: '#16A34A', contrastText: '#ffffff' },
      secondary: { main: '#059669' },
      success:   { main: '#16A34A' },
      info:      { main: '#0EA5E9' },
      warning:   { main: '#F59E0B' },
      error:     { main: '#DC2626' },
      background: { default: '#F5FBF7', paper: '#FFFFFF' },
      text: { primary: '#0B1110', secondary: '#4B6B58' },
      divider: '#E2E8F0',
    },
    shape: { borderRadius: 14 },
    typography: {
      ...baseTypography,
      subtitle1: { ...baseTypography.subtitle1, color: '#4B6B58' },
      body2: { ...baseTypography.body2, color: '#4B6B58' },
      caption: { ...baseTypography.caption, color: '#6E9380' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollBehavior: 'smooth' },
          body: {
            backgroundColor: '#F5FBF7',
            backgroundImage:
              'radial-gradient(1200px 600px at -10% -10%, rgba(22,163,74,0.08), transparent 40%), radial-gradient(800px 400px at 110% -10%, rgba(5,150,105,0.08), transparent 40%)',
          },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': { background: '#CDE7D6', borderRadius: 8 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundImage: 'none',
            backgroundColor: '#FFFFFF',
            color: '#0B1110', // fuerza color de texto/iconos en light
            boxShadow: '0 8px 24px rgba(2, 42, 22, 0.08)',
            borderBottom: '1px solid #E2E8F0',
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            backgroundImage:
              'linear-gradient(180deg, rgba(22,163,74,0.03), rgba(22,163,74,0.01))',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 999, paddingInline: 16 },
          containedPrimary: { color: '#ffffff' },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: { '& th': { fontWeight: 700, background: '#ECFDF5' } },
        },
      },
    },
  },
};

export function getAppTheme(mode = 'dark') {
  const cfg = tokens[mode] ?? tokens.dark;
  return createTheme({
    palette: cfg.palette,
    shape: cfg.shape,
    typography: cfg.typography,
    components: cfg.components,
  });
}

