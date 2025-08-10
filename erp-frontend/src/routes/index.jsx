// PATH: erp-frontend/src/routes/index.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../core/components/layout/MainLayout';

import LoginPage from '../modules/auth/pages/LoginPage';
import Dashboard from '../modules/dashboard/pages/Dashboard';
import SubscriberListPage from '../modules/admin/pages/SubscriberListPage';
import ModuleListPage from '../modules/admin/pages/ModuleListPage';

// Raffles (módulo)
import RafflesShell from '../modules/raffles/components/RafflesShell';
import RafflesDashboardPage from '../modules/raffles/pages/RafflesDashboardPage';
import RaffleManagementPage from '../modules/raffles/pages/RaffleManagementPage';
import RaffleCreatePage from '../modules/raffles/pages/RaffleCreatePage';
import RaffleDetailPage from '../modules/raffles/pages/RaffleDetailPage';
import TicketManagementPage from '../modules/raffles/pages/TicketManagementPage';
import TicketDetailPage from '../modules/raffles/pages/TicketDetailPage';
import SalesManagementPage from '../modules/raffles/pages/SalesManagementPage';

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

        {/* Módulo de Rifas */}
        <Route path="/raffles" element={<RafflesShell />}>
          <Route index element={<RafflesDashboardPage />} />
          <Route path="raffles" element={<RaffleManagementPage />} />
          <Route path="raffles/new" element={<RaffleCreatePage />} />
          <Route path="raffles/:raffleId" element={<RaffleDetailPage />} />
          <Route path="tickets" element={<TicketManagementPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
          <Route path="sales" element={<SalesManagementPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}


