import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

/**
 * ProtectedRoute — guards all routes that require authentication.
 *
 * If unauthenticated, redirects to /login while preserving the
 * originally requested path in `state.from` for post-login redirect.
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
