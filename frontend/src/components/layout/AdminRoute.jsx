import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useIsAdmin } from '../../hooks/useAdmin';

const AdminRoute = () => {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin();

  if (loading) {
      return <div className="flex items-center justify-center h-screen bg-bg-0 text-gold font-serif">Loading Codex Permissions...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
