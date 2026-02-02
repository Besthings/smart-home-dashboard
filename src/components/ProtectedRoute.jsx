import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireAuthorization = false }) => {
  const { currentUser, isAuthorized, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !currentUser) {
    // Redirect to login page, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if authorization is required
  if (requireAuthorization && !isAuthorized) {
    // User is authenticated but not authorized - render children
    // The ControlPage component will handle showing "Access Denied"
    return children;
  }

  // All checks passed - render children
  return children;
};

export default ProtectedRoute;
