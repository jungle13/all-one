// PATH: erp-frontend/src/core/components/layout/MainLayout.jsx
import * as React from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  CssBaseline,
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
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getMenuForRole } from '../../navigation/menuConfig';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import AuthContext from '../../contexts/AuthContext';

const drawerWidth = 264;
const collapsedWidth = 80;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : collapsedWidth,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter,
    }),
    // SIN bordes redondeados (requisito):
    borderRadius: 0,
  },
}));

export default function MainLayout() {
  const { mode, toggleMode } = useThemeMode();
  const { user } = React.useContext(AuthContext) || {};
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(true);
  const menu = React.useMemo(() => getMenuForRole(user?.role || 'admin'), [user]);

  const handleToggleDrawer = () => setOpen((v) => !v);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <CssBaseline />

      {/* Header */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          backgroundColor: (t) => t.palette.background.paper,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          // sombra sutil bajo el header
          boxShadow: (t) =>
            t.palette.mode === 'light'
              ? '0 1px 0 rgba(15, 23, 42, 0.06)'
              : '0 1px 0 rgba(0,0,0,0.4)',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            // 🔧 clave: forzar color de texto/íconos que heredan
            color: 'text.primary',
            gap: 1,
          }}
        >
          <IconButton onClick={handleToggleDrawer} edge="start" color="inherit">
            <MenuRoundedIcon />
          </IconButton>

          <Typography variant="h6" noWrap sx={{ ml: 1, flexGrow: 1 }}>
            ERP Admin
          </Typography>

          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton color="inherit" onClick={toggleMode}>
              {mode === 'dark' ? <Brightness7RoundedIcon /> : <Brightness4RoundedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton color="inherit">
              <Badge color="error" variant="dot">
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 32,
              height: 32,
              ml: 1,
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            {/* Simulación de foto de perfil */}
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer variant="permanent" open={open}>
        <Toolbar />
        <Divider />
        <List sx={{ py: 1 }}>
          {menu.map((item) => {
            const ActiveIcon = item.icon;
            const active = location.pathname.startsWith(item.path);
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
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ActiveIcon color={active ? 'primary' : 'inherit'} />
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

      {/* Contenido */}
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
        <Box component="div" sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}


