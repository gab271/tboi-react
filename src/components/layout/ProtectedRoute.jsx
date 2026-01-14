import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '../ui/Skeleton'; // Assuming Skeleton exists or I should create/use default

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
    ); 
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
