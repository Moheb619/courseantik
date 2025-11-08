import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

/**
 * Enhanced Authentication Hook
 * 
 * Production-ready authentication with enhanced security features:
 * - Rate limiting
 * - Role-based access control
 * - Session management
 * - Real-time auth state updates
 */
export const useEnhancedAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ============ USER STATE ============

  // Get current user with enhanced profile data
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError 
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { user, error } = await authService.getCurrentUser();
      if (error) throw error;
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('JWT')) return false;
      return failureCount < 2;
    },
  });

  // ============ AUTHENTICATION MUTATIONS ============

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, userData }) => {
      const { data, error } = await authService.signUp(email, password, userData);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Account created! Please check your email to verify your account.');
      } else {
        toast.success('Account created successfully!');
      }
      queryClient.invalidateQueries(['auth', 'user']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await authService.signIn(email, password);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Signed in successfully!');
      queryClient.invalidateQueries(['auth', 'user']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign in');
    },
  });

  // Google sign in mutation
  const googleSignInMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await authService.signInWithGoogle();
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign in with Google');
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authService.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Signed out successfully!');
      queryClient.clear();
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign out');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await authService.updateProfile(user.id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries(['auth', 'user']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const { data, error } = await authService.resetPassword(email);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reset email');
    },
  });

  // ============ AUTHORIZATION HELPERS ============

  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission) => {
    return authService.hasPermission(user, permission);
  };

  /**
   * Check if user can access route
   */
  const canAccessRoute = (route) => {
    return authService.canAccessRoute(user, route);
  };

  /**
   * Get user's permissions
   */
  const getUserPermissions = () => {
    return authService.getUserPermissions(user);
  };

  // ============ ROLE CHECKS ============

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isAuthenticated = !!user;

  // ============ AUTH STATE LISTENER ============

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          queryClient.invalidateQueries(['auth', 'user']);
        } else if (event === 'SIGNED_OUT') {
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED') {
          queryClient.invalidateQueries(['auth', 'user']);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // ============ SESSION MANAGEMENT ============

  // Session refresh mutation
  const refreshSessionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await authService.refreshSession();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['auth', 'user']);
    },
    onError: (error) => {
      console.error('Session refresh failed:', error);
      // Force logout on session refresh failure
      signOutMutation.mutate();
    },
  });

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      const { data: session } = await authService.getSession();
      if (session?.session) {
        const expiresAt = new Date(session.session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        
        // Refresh if session expires in less than 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000) {
          refreshSessionMutation.mutate();
        }
      }
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshSessionMutation]);

  return {
    // User state
    user,
    isLoadingUser,
    isAuthenticated,
    userError,

    // Role checks
    isAdmin,
    isInstructor,
    isStudent,

    // Authorization
    hasPermission,
    canAccessRoute,
    getUserPermissions,

    // Authentication methods
    signUp: signUpMutation.mutate,
    signIn: signInMutation.mutate,
    signInWithGoogle: googleSignInMutation.mutate,
    signOut: signOutMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    refreshSession: refreshSessionMutation.mutate,

    // Loading states
    isLoading: 
      signUpMutation.isPending || 
      signInMutation.isPending || 
      signOutMutation.isPending ||
      googleSignInMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,

    // Validation helpers
    validatePassword: authService.validatePassword.bind(authService),
    validateEmail: authService.validateEmail.bind(authService),
  };
};

export default useEnhancedAuth;
