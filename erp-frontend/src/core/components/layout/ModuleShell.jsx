// PATH: erp-frontend/src/core/components/layout/ModuleShell.jsx
import * as React from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'; // fallback
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import AuthContext from '../../contexts/AuthContext';

const drawerWidth = 260;

/**
 * Shell genérico de módulo:
 * - header fijo sobre el Drawer (z-index corregido).
 * - sidebar mini-variant colapsable sin bordes redondeados.
 * - items: [{ id, label, path, icon (Componente|string), exact? }]
 */
export default function ModuleShell({ title = 'ELIANA ERP', items = [] }) {
  const [open, setOpen] = React.useState(true);
  const { mode, toggleMode } = useThemeMode();
  const { user } = React.useContext(AuthContext) || {};
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,                         // 👈 header sobre el drawer
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: (t) =>
            t.palette.mode === 'light' ? t.palette.background.paper : t.palette.background.default,
        }}
      >
        <Toolbar sx={{ px: 2, gap: 1, color: 'text.primary' }}>
          <IconButton edge="start" onClick={() => setOpen((v) => !v)} color="inherit" aria-label="menu">
            {open ? <ChevronLeftRoundedIcon /> : <MenuRoundedIcon />}
          </IconButton>

          <Typography variant="h6" sx={{ ml: 1, fontWeight: 800 }}>
            {title}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}>
            <IconButton onClick={toggleMode} color="inherit" aria-label="toggle theme">
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton color="inherit">
              <Badge variant="dot" color="primary">
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton onClick={() => navigate('/profile')} sx={{ ml: 1 }} color="inherit" aria-label="perfil">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            position: 'relative',
            width: open ? drawerWidth : 72,
            overflowX: 'hidden',
            transition: (t) =>
              t.transitions.create('width', {
                easing: t.transitions.easing.sharp,
                duration: t.transitions.duration.enteringScreen,
              }),
            borderRight: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 0,
          },
        }}
      >
        {/* separador para no tapar el header */}
        <Toolbar />
        <Divider />
        <List sx={{ py: 1 }}>
          {items.map((item) => {
            // 🔒 robustez: si alguien puso un string como icono, usamos un fallback
            const IconComp =
              typeof item.icon === 'function'
                ? item.icon
                : typeof item.icon === 'object' && item.icon
                ? item.icon
                : DashboardRoundedIcon;

            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <ListItemButton
                key={item.id}
                component={NavLink}
                to={item.path}
                selected={active}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                sx={{ mx: 1, my: 0.5, borderRadius: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <IconComp color={active ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                  sx={{ opacity: open ? 1 : 0, transition: 'opacity .2s' }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.background.default,
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

