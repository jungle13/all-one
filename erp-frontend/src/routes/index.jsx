// PATH: erp-frontend/src/routes/index.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../core/components/layout/MainLayout';

import LoginPage from '../modules/auth/pages/LoginPage';
import Dashboard from '../modules/dashboard/pages/Dashboard';
import SubscriberListPage from '../modules/admin/pages/SubscriberListPage';
import ModuleListPage from '../modules/admin/pages/ModuleListPage';

// Raffles (nuevo “shell” como componente en components/)
import RafflesShell from '../modules/raffles/components/RafflesShell';
import RafflesDashboardPage from '../modules/raffles/pages/RafflesDashboardPage';
import RaffleManagementPage from '../modules/raffles/pages/RaffleManagementPage';
import TicketManagementPage from '../modules/raffles/pages/TicketManagementPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        {/* ERP estándar */}
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subscribers" element={<SubscriberListPage />} />
          <Route path="/modules" element={<ModuleListPage />} />
        </Route>

        {/* Módulo de Rifas: shell propio pero como componente del módulo */}
        <Route path="/raffles" element={<RafflesShell />}>
          <Route index element={<RafflesDashboardPage />} />
          <Route path="raffles" element={<RaffleManagementPage />} />
          <Route path="tickets" element={<TicketManagementPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}


