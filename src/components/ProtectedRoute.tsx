import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, hasRole } = useAuth();
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      if (!requiredRole) {
        setIsAuthorized(true);
        return;
      }

      const hasRequiredRole = await hasRole(requiredRole);
      setIsAuthorized(hasRequiredRole);
    };

    checkRole();
  }, [user, requiredRole, hasRole]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <div>Access Denied: You do not have the required role.</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
