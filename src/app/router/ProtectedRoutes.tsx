import React from 'react';
import Login from '../../pages/auth/LoginPage';
import { User } from '../../types';

export interface ProtectedRoutesProps {
  isAuthenticated: boolean;
  onLoginSuccess: (user: User) => void;
  children: React.ReactNode;
}

export const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({
  isAuthenticated,
  onLoginSuccess,
  children,
}) => {
  if (!isAuthenticated) {
    return <Login onLoginSuccess={onLoginSuccess} />;
  }

  return <>{children}</>;
};

export default ProtectedRoutes;
