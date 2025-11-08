import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useEnhancedAuth } from "../hooks/useEnhancedAuth";
import { Shield, AlertCircle, Loader } from "lucide-react";

/**
 * Enhanced Protected Route Component
 *
 * Provides comprehensive authentication and authorization:
 * - Role-based access control
 * - Permission-based access
 * - Route-based access
 * - Loading states
 * - Error handling
 */
const EnhancedProtectedRoute = ({
  children,
  requiredRole = null,
  requiredPermission = null,
  fallbackRoute = "/auth/signin",
  showUnauthorized = true,
}) => {
  const {
    user,
    isAuthenticated,
    isLoadingUser,
    hasPermission,
    canAccessRoute,
  } = useEnhancedAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackRoute} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Allow admin to access any role-restricted route
    if (user.role !== "admin") {
      if (showUnauthorized) {
        return (
          <UnauthorizedPage requiredRole={requiredRole} userRole={user.role} />
        );
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (showUnauthorized) {
      return <UnauthorizedPage requiredPermission={requiredPermission} />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Check route-based access
  if (!canAccessRoute(location.pathname)) {
    if (showUnauthorized) {
      return <UnauthorizedPage route={location.pathname} />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed, render children
  return children;
};

/**
 * Unauthorized Access Page
 */
const UnauthorizedPage = ({
  requiredRole,
  requiredPermission,
  route,
  userRole,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Access Denied
          </h1>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Insufficient Permissions
              </span>
            </div>

            <div className="text-sm text-neutral-600 space-y-2">
              {requiredRole && (
                <p>
                  <span className="font-medium">Required Role:</span>{" "}
                  {requiredRole}
                  <br />
                  <span className="font-medium">Your Role:</span> {userRole}
                </p>
              )}

              {requiredPermission && (
                <p>
                  <span className="font-medium">Required Permission:</span>{" "}
                  {requiredPermission}
                </p>
              )}

              {route && (
                <p>
                  <span className="font-medium">Restricted Route:</span> {route}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-neutral-100 text-neutral-700 py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Go Back
            </button>

            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-brand-500 text-white py-2 px-4 rounded-lg hover:bg-brand-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Role-specific route wrapper
 */
export const AdminRoute = ({ children }) => (
  <EnhancedProtectedRoute requiredRole="admin">
    {children}
  </EnhancedProtectedRoute>
);

export const InstructorRoute = ({ children }) => (
  <EnhancedProtectedRoute requiredRole="instructor">
    {children}
  </EnhancedProtectedRoute>
);

export const StudentRoute = ({ children }) => (
  <EnhancedProtectedRoute requiredRole="student">
    {children}
  </EnhancedProtectedRoute>
);

/**
 * Permission-based route wrapper
 */
export const PermissionRoute = ({ permission, children }) => (
  <EnhancedProtectedRoute requiredPermission={permission}>
    {children}
  </EnhancedProtectedRoute>
);

export default EnhancedProtectedRoute;
