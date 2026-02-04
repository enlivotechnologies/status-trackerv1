import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[] | string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Compare role as uppercase string to handle both string and enum values
  const userRole = user?.role?.toString().toUpperCase();
  const allowed = allowedRoles.map(r => r.toString().toUpperCase());
  
  if (user && !allowed.includes(userRole || '')) {
    // Redirect based on actual role
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'AGENT') {
      return <Navigate to="/agent" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
