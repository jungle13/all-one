import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../core/components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../modules/auth/pages/LoginPage';
import Dashboard from '../modules/dashboard/pages/Dashboard';
import SubscriberListPage from '../modules/admin/pages/SubscriberListPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subscribers" element={<SubscriberListPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
