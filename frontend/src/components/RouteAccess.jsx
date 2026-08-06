import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessRoute } from '../lib/navAccess';

export default function RouteAccess({ children }) {
  const location = useLocation();
  const authState = useAuth();

  if (authState.loading) {
    return <div className="page-loading">Checking session…</div>;
  }

  if (!canAccessRoute(location.pathname, authState)) {
    const redirectTo = authState.authenticated || authState.mfaPending ? '/' : '/signin';
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  return children;
}
