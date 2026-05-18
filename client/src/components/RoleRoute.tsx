import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface RoleRouteProps {
  children: JSX.Element;
  roles: Role[];
}

export const RoleRoute = ({ children, roles }: RoleRouteProps) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
