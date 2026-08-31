import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EquipmentPage from './pages/EquipmentPage';
import RequestsPage from './pages/RequestsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import MyEquipmentPage from './pages/MyEquipmentPage';
import MaintenancePage from './pages/MaintenancePage';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="my-equipment" element={<MyEquipmentPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
