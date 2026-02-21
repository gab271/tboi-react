import { useAuth } from './useAuth';

export function useIsAdmin() {
  const { user } = useAuth();
  
  // Check if user has the admin role in app_metadata
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  return isAdmin;
}
