// ============================================================
// AuthContext — Global authentication state
// ============================================================
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { authApi } from "../services/supabase/authApi";
import { supabase } from "../services/supabase/supabaseClient";

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides:
 * - user, profile, role, loading
 * - loginWithGoogle, logout, refreshProfile
 * - isAdmin, isInstructor, isStudent, isAuthenticated
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // Load profile + role separately (avoids joined queries)
  const loadUserData = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setRole(null);
      return;
    }

    setUser(authUser);

    // Fetch profile and role in parallel, independently
    const [profileResult, roleResult] = await Promise.allSettled([
      authApi.getProfile(authUser.id),
      authApi.getUserRole(authUser.id),
    ]);

    if (mountedRef.current) {
      // Handle profile
      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else {
        console.warn(
          "[Auth] Profile fetch failed, using auth metadata:",
          profileResult.reason,
        );
        setProfile({
          name: authUser.user_metadata?.full_name || authUser.email,
          email: authUser.email,
          avatar_url:
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture,
        });
      }

      // Handle role
      if (roleResult.status === "fulfilled") {
        setRole(roleResult.value || "student");
      } else {
        console.error(
          "[Auth] Role fetch failed (network or RLS), defaulting to student:",
          roleResult.reason,
        );
        setRole("student");
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      try {
        // Add timeout to prevent hanging forever if Supabase is unreachable (30s)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth Init Timeout (30s)")), 30000),
        );

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise]);

        if (session?.user && mountedRef.current) {
          await loadUserData(session.user);
        }
      } catch (err) {
        console.error("[Auth] initAuth error:", err);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes (skip INITIAL_SESSION — handled by initAuth)
    const {
      data: { subscription },
    } = authApi.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          await loadUserData(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    const data = await authApi.loginWithGoogle();
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
    } finally {
      setUser(null);
      setProfile(null);
      setRole(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  const value = {
    user,
    profile,
    role,
    loading,
    loginWithGoogle,
    logout,
    refreshProfile,
    isAdmin: role === "admin",
    isInstructor: role === "instructor",
    isStudent: role === "student",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
