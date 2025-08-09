import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../modules/auth/pages/LoginPage';
import CompanyListPage from '../modules/admin/pages/CompanyListPage';
import MainLayout from '../core/components/layout/MainLayout';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route 
      path="/"
      element={
        <ProtectedRoute>
          <MainLayout>
            <CompanyListPage />
          </MainLayout>
        </ProtectedRoute>
      } 
    />
  </Routes>
);

export default AppRoutes;
