// PATH: erp-frontend/src/core/contexts/AuthContext.jsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ROLES } from '../navigation/menuConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  });

  const login = async (email, password) => {
    // TODO: reemplazar por llamada real a backend
    if (email === 'admin@example.com' && password === 'password') {
      const u = { email, role: ROLES.ADMIN, token: 'demo-token' };
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      return u;
    }
    throw new Error('Credenciales inválidas');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (!Array.isArray(roles) || roles.length === 0) return true;
    return roles.includes(user.role);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
