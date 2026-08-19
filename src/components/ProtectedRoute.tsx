import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAgent();

  if (!isAuthenticated) {
    return <Navigate to="/agent/login" replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
