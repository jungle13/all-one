
// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

// === TOKENS: change once, affect everywhere ===
const tokens = {
  palette: {
    mode: 'light',
    primary:   { main: '#0EA5E9', contrastText: '#FFFFFF' }, // brand color
    secondary: { main: '#6366F1' },
    success:   { main: '#10B981' },
    warning:   { main: '#F59E0B' },
    error:     { main: '#EF4444' },
    info:      { main: '#06B6D4' },
    background:{ default: '#F8FAFC', paper: '#FFFFFF' },
    text:      { primary: '#0F172A', secondary: '#475569' },
  },
  typography: {
    fontFamily: `'InterVariable', 'Inter var', Inter, Roboto, system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`,
    h1: { fontSize: 36, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 },
    h2: { fontSize: 30, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.25 },
    h3: { fontSize: 24, fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: 20, fontWeight: 700, lineHeight: 1.35 },
    h5: { fontSize: 18, fontWeight: 600 },
    h6: { fontSize: 16, fontWeight: 600 },
    subtitle1: { fontSize: 15, lineHeight: 1.5, color: '#334155' },
    body1:     { fontSize: 14, lineHeight: 1.6 },
    body2:     { fontSize: 13, lineHeight: 1.6, color: '#475569' },
    button:    { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    caption:   { fontSize: 12, color: '#64748B' },
    overline:  { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  },
  shape: { borderRadius: 14 },
  spacing: 8,
};

const theme = createTheme({
  ...tokens,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: 'smooth' },
        body: { backgroundColor: tokens.palette.background.default },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '*::-webkit-scrollbar-thumb': { background: '#CBD5E1', borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { borderBottom: '1px solid #E2E8F0', backgroundImage: 'none' },
      },
    },
    MuiToolbar: { styleOverrides: { root: { minHeight: 64 } } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: tokens.shape.borderRadius, border: '1px solid #E2E8F0' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { borderRadius: tokens.shape.borderRadius, overflow: 'hidden' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 16 },
        containedPrimary: { color: tokens.palette.primary.contrastText },
      },
    },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'medium' } },
    MuiTableHead: {
      styleOverrides: { root: { '& th': { fontWeight: 700, background: '#F1F5F9' } } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

export default theme;
