import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './core/contexts/AuthContext';
import AppRoutes from './routes';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
