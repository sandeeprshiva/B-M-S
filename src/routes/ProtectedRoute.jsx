import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasRouteAccess } from '../utils/roleRedirect';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to the current route
  if (!hasRouteAccess(user.role, location.pathname)) {
    // Redirect to appropriate dashboard if user doesn't have access
    const roleRedirects = {
      admin: '/',
      sales: '/sales',
      accounts: '/accounts/ledger',
      purchase: '/orders',
    };
    
    const redirectPath = roleRedirects[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
