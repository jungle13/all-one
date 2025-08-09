// PATH: erp-frontend/src/core/components/layout/MainLayout.jsx
import * as React from 'react';
import {
  AppBar as MuiAppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import AuthContext from '../../contexts/AuthContext';
import { getMenuForRole } from '../../navigation/menuConfig';
import { useThemeMode } from '../../contexts/ThemeModeContext';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;

// AppBar sin bordes redondeados; el color se controla por theme
const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

// Drawer mini-variant SIN bordes redondeados
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      borderRadius: 0, // sin bordes redondeados
      width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
      backgroundColor: theme.palette.background.paper,
      borderRight: `1px solid ${theme.palette.divider}`,
      transition: 'width 220ms ease',
      overflowX: 'hidden',
    },
  })
);

function NavItem({ to, icon: Icon, label, collapsed }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Tooltip title={collapsed ? label : ''} placement="right">
      <ListItemButton
        component={NavLink}
        to={to}
        selected={active}
        sx={{
          mx: 1,
          borderRadius: 2,
          '&.Mui-selected': {
            backgroundColor: 'rgba(34,197,94,0.18)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'text.secondary' }}>
          <Icon />
        </ListItemIcon>
        {!collapsed && <ListItemText primary={label} />}
      </ListItemButton>
    </Tooltip>
  );
}

export default function MainLayout() {
  const [open, setOpen] = React.useState(true);
  const { mode, toggleMode } = useThemeMode();
  const { user } = React.useContext(AuthContext) || {};
  const navigate = useNavigate();
  const collapsed = !open;

  const menu = React.useMemo(() => getMenuForRole(user?.role || 'admin'), [user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      {/* AppBar: color default -> usa text.primary del theme (no queda blanco en light) */}
      <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <Toolbar sx={{ gap: 1, color: 'text.primary' }}>
          <IconButton
            edge="start"
            onClick={() => setOpen((v) => !v)}
            color="inherit"
            sx={{ mr: 1 }}
            aria-label="toggle sidebar"
          >
            {open ? <ChevronLeftRoundedIcon /> : <MenuRoundedIcon />}
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            ELIANA ERP
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Theme toggle */}
          <Tooltip title={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            <IconButton color="inherit" onClick={toggleMode} aria-label="toggle theme">
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          {/* Notificaciones */}
          <IconButton color="inherit" aria-label="notifications" sx={{ ml: 1 }}>
            <Badge variant="dot" color="primary">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>

          {/* Perfil */}
          <IconButton onClick={() => navigate('/profile')} sx={{ ml: 1 }} color="inherit" aria-label="perfil">
            <Avatar
              alt="Usuario"
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

      {/* Sidebar */}
      <Drawer variant="permanent" open={open}>
        <Toolbar />
        <Divider />
        <List sx={{ mt: 1 }}>
          {menu.map((item) => (
            <NavItem
              key={item.id}
              to={item.path}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed}
            />
          ))}
        </List>
      </Drawer>

      {/* Contenido */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 3,
        }}
      >
        <Toolbar /> {/* offset del AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
}



