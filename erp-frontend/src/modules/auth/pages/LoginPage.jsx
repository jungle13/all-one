import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { TextField, Button, Box, Typography } from '@mui/material';
import AuthContext from '../../../core/contexts/AuthContext';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate('/');
    } catch (error) {
      console.error('Error de autenticación', error);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Box width={300}>
        <Typography variant="h5" mb={2} align="center">
          Iniciar sesión
        </Typography>
        <Form
          onSubmit={onSubmit}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="email">
                {({ input }) => (
                  <TextField {...input} label="Email" type="email" margin="normal" fullWidth />
                )}
              </Field>
              <Field name="password">
                {({ input }) => (
                  <TextField {...input} label="Contraseña" type="password" margin="normal" fullWidth />
                )}
              </Field>
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                Ingresar
              </Button>
            </form>
          )}
        />
      </Box>
    </Box>
  );
};

export default LoginPage;
