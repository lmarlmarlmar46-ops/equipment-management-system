import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Main layout
import MainLayout from './components/MainLayout';

// Pages
import Dashboard from './components/Dashboard';
import Equipment from './components/Equipment';
import Employees from './components/Employees';
import Allocations from './components/Allocations';
import ITDashboard from './pages/ITDashboard';
import MyEquipment from './pages/MyEquipment';
import RequestEquipment from './pages/RequestEquipment';
import MyRequests from './pages/MyRequests';
import UserManagement from './pages/UserManagement';
import ProfileSettings from './pages/ProfileSettings';
import Contacts from './pages/Contacts';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with MainLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect based on role handled in MainLayout */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Common routes for all authenticated users */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="employees" element={<Employees />} />
            <Route path="allocations" element={<Allocations />} />

            {/* IT Operations routes (Admin & Manager only) */}
            <Route
              path="it-dashboard"
              element={
                <ProtectedRoute requiredRole={['admin', 'manager']}>
                  <ITDashboard />
                </ProtectedRoute>
              }
            />

            {/* User Management (Admin & Manager only) */}
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRole={['admin', 'manager']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* Employee routes */}
            <Route
              path="my-equipment"
              element={
                <ProtectedRoute>
                  <MyEquipment />
                </ProtectedRoute>
              }
            />
            <Route
              path="request-equipment"
              element={
                <ProtectedRoute>
                  <RequestEquipment />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-requests"
              element={
                <ProtectedRoute>
                  <MyRequests />
                </ProtectedRoute>
              }
            />
            
            {/* Profile and Contacts */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="contacts"
              element={
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
