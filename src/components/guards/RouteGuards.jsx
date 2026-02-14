// ============================================================
// Route Guard Components — Role-based access control
// ============================================================
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Loading spinner shown while auth state is being resolved
 */
const AuthLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
      <p className="text-muted-foreground text-sm font-medium">Loading...</p>
    </div>
  </div>
);

/**
 * ProtectedRoute — Requires any authenticated user.
 * Redirects to /login if not authenticated.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * AdminRoute — Requires admin role.
 * Redirects to / if authenticated but not admin.
 * Redirects to /login if not authenticated.
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * InstructorRoute — Requires instructor (or admin) role.
 * Redirects to / if authenticated but not instructor/admin.
 * Redirects to /login if not authenticated.
 */
export const InstructorRoute = ({ children }) => {
  const { isAuthenticated, isInstructor, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isInstructor && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * GuestRoute — Only for unauthenticated users (login/signup).
 * Redirects to /dashboard or stored location if already authenticated.
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
};
