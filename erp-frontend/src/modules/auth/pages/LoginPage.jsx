// =============================================
// 4) src/modules/auth/pages/LoginPage.jsx
// =============================================
import * as React from 'react';
import { useState } from 'react';
import {
  Avatar, Box, Button, Checkbox, Container, FormControlLabel,
  InputAdornment, Link, Paper, Stack, TextField, Typography
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import KeyIcon from '@mui/icons-material/Key';
import { useAuth } from '../../../core/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    try {
      setLoading(true);
      await login(email, password);     // mock demo en el AuthContext
      navigate('/dashboard', { replace: true });
    } catch (err) {
      alert(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
      <Paper sx={{ p: 4, width: '100%' }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h4">Iniciar sesión</Typography>
          <Typography variant="body2" color="text.secondary">Bienvenido de nuevo, ingresa tus credenciales.</Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              name="email"
              label="Correo electrónico"
              type="email"
              fullWidth
              required
              autoFocus
              InputProps={{ startAdornment: (
                <InputAdornment position="start"><MailOutlineIcon /></InputAdornment>
              ) }}
            />

            <TextField
              name="password"
              label="Contraseña"
              type="password"
              fullWidth
              required
              InputProps={{ startAdornment: (
                <InputAdornment position="start"><KeyIcon /></InputAdornment>
              ) }}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <FormControlLabel control={<Checkbox defaultChecked />} label="Recordarme" />
              <Link href="#" variant="body2">¿Olvidaste tu contraseña?</Link>
            </Stack>

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Demo: admin@example.com / password
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}