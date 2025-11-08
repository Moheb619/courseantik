import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectIsLoading, 
  selectIsUpdatingProfile,
  selectError,
  fetchCurrentUser,
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  updateProfile,
  clearError
} from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const isUpdatingProfile = useAppSelector(selectIsUpdatingProfile);
  const error = useAppSelector(selectError);

  const handleSignUp = async (email, password, userData) => {
    try {
      await dispatch(signUp({ email, password, userData })).unwrap();
      toast.success('Account created successfully! Please check your email.');
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  const handleSignIn = async (email, password) => {
    try {
      await dispatch(signIn({ email, password })).unwrap();
      toast.success('Signed in successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to sign in');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap();
      toast.success('Signed in with Google successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      toast.success('Signed out successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const handleUpdateProfile = async (updates) => {
    try {
      await dispatch(updateProfile(updates)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isUpdatingProfile,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    clearError: handleClearError,
    fetchCurrentUser: () => dispatch(fetchCurrentUser()),
  };
};

export default useReduxAuth;
