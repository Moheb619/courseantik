// ============================================================
// AuthContext — Global authentication state
// ============================================================
// Provides session persistence, RBAC hydration, and loading
// state management across the entire app.
//
// ARCHITECTURE:
//   - Initial session check: supabase.auth.getSession() (we control the await)
//   - Subsequent auth events: onAuthStateChange listener
//   - Loading state: true until BOTH session + role are resolved
//   - Role fetch: always awaited before loading becomes false
//
// WHY NOT rely solely on onAuthStateChange?
//   Supabase does NOT await async callbacks in onAuthStateChange.
//   So if our callback is async, setLoading(false) after await won't
//   be properly sequenced. We use getSession() for initial load
//   (where we fully control the async flow) and the listener for
//   subsequent sign-in/sign-out events only.
// ============================================================
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
  // Tracks whether initial session check has completed
  const initializedRef = useRef(false);

  /**
   * Load profile + role for a given auth user.
   * If authUser is null, clears all state.
   * Uses Promise.allSettled so one failure doesn't block the other.
   * Returns true if state was updated (component still mounted).
   */
  const loadUserData = useCallback(async (authUser) => {
    if (!authUser) {
      if (mountedRef.current) {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      return;
    }

    if (mountedRef.current) {
      setUser(authUser);
    }

    try {
      // Fetch profile and role in parallel, independently
      const [profileResult, roleResult] = await Promise.allSettled([
        authApi.getProfile(authUser.id),
        authApi.getUserRole(authUser.id),
      ]);

      if (!mountedRef.current) return;

      // Handle profile — fallback to auth metadata on failure
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

      // Handle role — default to 'student' on failure
      if (roleResult.status === "fulfilled") {
        setRole(roleResult.value || "student");
      } else {
        console.error(
          "[Auth] Role fetch failed (network or RLS), defaulting to student:",
          roleResult.reason,
        );
        setRole("student");
      }
    } catch (err) {
      // Safety net — should not reach here due to allSettled,
      // but ensures role is never left as null
      console.error("[Auth] Unexpected error in loadUserData:", err);
      if (mountedRef.current) {
        setRole("student");
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    initializedRef.current = false;

    // ── STEP 1: Initial session check ──
    // We use getSession() because WE control the async flow.
    // loading stays true until this completes (including role fetch).
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] getSession error:", error);
        }

        if (mountedRef.current) {
          if (session?.user) {
            await loadUserData(session.user);
          } else {
            // No session — clear state
            setUser(null);
            setProfile(null);
            setRole(null);
          }
        }
      } catch (err) {
        console.error("[Auth] initAuth error:", err);
        // Ensure state is clean on error
        if (mountedRef.current) {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } finally {
        if (mountedRef.current) {
          initializedRef.current = true;
          setLoading(false);
        }
      }
    };

    initAuth();

    // ── STEP 2: Listen for subsequent auth changes ──
    // Skip INITIAL_SESSION (handled by initAuth above) to avoid race condition.
    // For SIGNED_IN/SIGNED_OUT/TOKEN_REFRESHED, update state accordingly.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return;

      // Skip INITIAL_SESSION — already handled by getSession() above
      if (event === "INITIAL_SESSION") return;

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          // Set loading true, then fetch role+profile
          setLoading(true);
          // Use setTimeout(0) to avoid Supabase deadlock on auth state
          // (Supabase warns against calling async auth methods inside the listener synchronously)
          setTimeout(async () => {
            if (!mountedRef.current) return;
            try {
              await loadUserData(session.user);
            } catch (err) {
              console.error(
                "[Auth] Error loading user data on auth change:",
                err,
              );
            } finally {
              if (mountedRef.current) {
                setLoading(false);
              }
            }
          }, 0);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setRole(null);
        // Don't set loading — sign out should be instant
      }
    });

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [loadUserData]);

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
      // Ensure local state is cleared even if signOut API call failed
      if (mountedRef.current) {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
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
