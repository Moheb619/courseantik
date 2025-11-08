import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()


  // Get current user with profile data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        return null;
      }

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || '',
          avatar_url: authUser.user_metadata?.avatar_url || '',
          role: 'student' // Default role
        };
      }

      return {
        id: authUser.id,
        email: authUser.email,
        full_name: profile.full_name || authUser.user_metadata?.full_name || '',
        avatar_url: profile.avatar_url || authUser.user_metadata?.avatar_url || '',
        bio: profile.bio || '',
        role: profile.role || 'student'
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, userData }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            avatar_url: userData.avatar_url
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`
        }
      });

      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please check your email.');
      queryClient.invalidateQueries(['auth', 'user']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create account');
    }
  })

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Signed in successfully!');
      queryClient.invalidateQueries(['auth', 'user']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign in');
    }
  })

  // Google sign in mutation
  const googleSignInMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Signed out successfully!');
      queryClient.clear();
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sign out');
    }
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Update profile in database
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          bio: updates.bio
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries(['auth', 'user']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    }
  })

  return {
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor' || user?.role === 'admin',
    isStudent: user?.role === 'student',
    signUp: signUpMutation.mutate,
    signIn: signInMutation.mutate,
    signInWithGoogle: googleSignInMutation.mutate,
    signOut: signOutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    isLoading: signUpMutation.isPending || signInMutation.isPending || signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending
  }
}

export default useAuth
