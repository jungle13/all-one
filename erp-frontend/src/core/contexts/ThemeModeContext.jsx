// PATH: erp-frontend/src/core/contexts/ThemeModeContext.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from '../../theme';

const ThemeModeContext = createContext({ mode: 'dark', toggleMode: () => {} });

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const toggleMode = () => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeModeContext);
export default ThemeModeContext;