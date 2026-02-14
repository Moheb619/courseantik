// ============================================================
// Auth API — Authentication & profile management
// ============================================================
import { supabase } from './supabaseClient';

export const authApi = {
  /**
   * Sign in / sign up with Google OAuth
   * Redirects the user to Google's consent screen.
   * On success, Supabase redirects back to the app.
   */
  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current auth user
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Update auth user metadata (display name, avatar, etc.)
   */
  async updateUser(updates) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  },

  // ── Profile methods ──

  /**
   * Get profile for a user (simple query, no joins)
   * @param {string} userId
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get the user's role name via the SECURITY DEFINER function
   * This bypasses RLS on user_roles/roles tables
   * @param {string} userId
   * @returns {Promise<string>} 'admin' | 'instructor' | 'student'
   */
  async getUserRole(userId) {
    const { data, error } = await supabase
      .rpc('get_user_role', { p_user_id: userId });

    if (error) throw error;
    return data || 'student';
  },

  /**
   * Update profile
   */
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Listen for auth state changes
   * @param {function} callback
   * @returns {object} subscription
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
