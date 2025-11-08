import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { hasRole } from "../utils/guards";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, isLoadingUser } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated (production mode)
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  // Check role-based access if required (production mode)
  if (requiredRole) {
    if (!hasRole(user, requiredRole)) {
      // Redirect to dashboard if user doesn't have required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
