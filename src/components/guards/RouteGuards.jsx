// ============================================================
// Route Guard Components — Role-based access control
// ============================================================
// These guards protect routes based on auth state and user role.
// They wait for both session resolution AND role hydration before
// making access decisions, preventing premature redirects.
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
 * Forbidden page shown when user lacks the required role
 */
const Forbidden = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4 max-w-md mx-auto px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
        <span className="text-3xl">🚫</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="text-muted-foreground text-sm">
        You don't have permission to access this page.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Go Home
      </a>
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

  // Wait for auth state to resolve
  if (loading) return <AuthLoading />;

  // No session → redirect to login (preserving intended destination)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * AdminRoute — Requires admin role.
 * - Loading → spinner
 * - Not authenticated → /login
 * - Role still hydrating (null) → spinner (safety net)
 * - Authenticated but not admin → 403 Forbidden
 * - Admin → render children
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, role } = useAuth();
  const location = useLocation();

  // Wait for auth state to resolve
  if (loading) return <AuthLoading />;

  // No session → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role is still hydrating (edge case safety net) → show loading
  if (role === null) return <AuthLoading />;

  // Authenticated but not admin → show forbidden
  if (!isAdmin) return <Forbidden />;

  return children;
};

/**
 * InstructorRoute — Requires instructor (or admin) role.
 * - Loading → spinner
 * - Not authenticated → /login
 * - Role still hydrating (null) → spinner (safety net)
 * - Authenticated but not instructor/admin → 403 Forbidden
 * - Instructor or Admin → render children
 */
export const InstructorRoute = ({ children }) => {
  const { isAuthenticated, isInstructor, isAdmin, loading, role } = useAuth();
  const location = useLocation();

  // Wait for auth state to resolve
  if (loading) return <AuthLoading />;

  // No session → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role is still hydrating (edge case safety net) → show loading
  if (role === null) return <AuthLoading />;

  // Authenticated but neither instructor nor admin → show forbidden
  if (!isInstructor && !isAdmin) return <Forbidden />;

  return children;
};

/**
 * GuestRoute — Only for unauthenticated users (login/signup).
 * Redirects to / or stored location if already authenticated.
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for auth state to resolve
  if (loading) return <AuthLoading />;

  // Already logged in → redirect to intended page or home
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
};
