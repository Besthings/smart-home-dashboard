import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastContainer';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import ControlPage from './pages/ControlPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Root redirect - always go to dashboard (guest access allowed) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Public route - Login page without Layout */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Dashboard route - accessible to all (guest mode) */}
          <Route path="/dashboard" element={
            <Layout>
              <DashboardPage />
            </Layout>
          } />
          
          {/* Control route - requires auth and authorization */}
          <Route path="/control" element={
            <ProtectedRoute requireAuth={true} requireAuthorization={true}>
              <Layout>
                <ControlPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* 404 - catch all invalid routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;