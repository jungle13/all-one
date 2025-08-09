import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../modules/auth/pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../core/components/layout/MainLayout';
import SubscriberListPage from '../modules/admin/pages/SubscriberListPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="subscribers" replace />} />
      <Route path="subscribers" element={<SubscriberListPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
