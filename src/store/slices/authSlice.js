import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { dummyAuthService } from '../../services/dummyService';
import { supabase } from '../../lib/supabase';

// Async thunks
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async () => {
    const user = await dummyAuthService.getCurrentUser();
    return user;
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, userData }) => {
    const { user, error } = await dummyAuthService.signUp(email, password, userData);
    if (error) throw error;
    return user;
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }) => {
    const { user, error } = await dummyAuthService.signIn(email, password);
    if (error) throw error;
    return user;
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    const { user, error } = await dummyAuthService.signInWithGoogle();
    if (error) throw error;
    return user;
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    const { error } = await dummyAuthService.signOut();
    if (error) throw error;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  }
);

const initialState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  isUpdatingProfile: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });

    // Sign up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });

    // Sign in
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });

    // Google sign in
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });

    // Sign out
    builder
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;

// Memoized selectors to prevent unnecessary re-renders
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = createSelector(
  [selectUser],
  (user) => !!user
);
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectIsUpdatingProfile = (state) => state.auth.isUpdatingProfile;
export const selectError = (state) => state.auth.error;

export default authSlice.reducer;
