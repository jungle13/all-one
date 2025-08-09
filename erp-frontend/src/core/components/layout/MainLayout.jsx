import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import AuthContext from '../../contexts/AuthContext';

const MainLayout = ({ children }) => {
  const { logout } = useContext(AuthContext);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ERP Dashboard
          </Typography>
          <Button color="inherit" onClick={logout}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>{children}</Container>
    </>
  );
};

export default MainLayout;
