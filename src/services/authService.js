import { supabase } from '../lib/supabase';
import { authConfig, getAuthConfig } from '../lib/authConfig';

/**
 * Production-Level Authentication Service
 * 
 * Handles all authentication operations with enhanced security,
 * rate limiting, and proper error handling
 */

class AuthService {
  constructor() {
    this.config = getAuthConfig();
    this.attemptTracker = new Map(); // Track login attempts for rate limiting
  }

  // ============ RATE LIMITING ============

  /**
   * Check if user is rate limited
   */
  isRateLimited(identifier) {
    const attempts = this.attemptTracker.get(identifier);
    if (!attempts) return false;

    const now = Date.now();
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < this.config.rateLimiting.attemptWindow
    );

    if (recentAttempts.length >= this.config.rateLimiting.maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const lockoutEnd = oldestAttempt + this.config.rateLimiting.lockoutDuration;
      
      if (now < lockoutEnd) {
        return {
          isLimited: true,
          retryAfter: Math.ceil((lockoutEnd - now) / 1000 / 60), // minutes
        };
      }
    }

    return { isLimited: false };
  }

  /**
   * Record authentication attempt
   */
  recordAttempt(identifier, success = false) {
    const now = Date.now();
    const attempts = this.attemptTracker.get(identifier) || [];
    
    if (!success) {
      attempts.push(now);
      this.attemptTracker.set(identifier, attempts);
    } else {
      // Clear attempts on successful login
      this.attemptTracker.delete(identifier);
    }
  }

  // ============ AUTHENTICATION METHODS ============

  /**
   * Sign up with email and password
   */
  async signUp(email, password, userData = {}) {
    try {
      // Validate password strength
      if (!this.validatePassword(password)) {
        throw new Error('Password does not meet security requirements');
      }

      // Check rate limiting
      const rateLimitCheck = this.isRateLimited(email);
      if (rateLimitCheck.isLimited) {
        throw new Error(`Too many attempts. Try again in ${rateLimitCheck.retryAfter} minutes.`);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone,
            role: 'student', // Default role
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        this.recordAttempt(email, false);
        throw error;
      }

      // Create profile record
      if (data.user && !data.user.email_confirmed_at) {
        await this.createUserProfile(data.user.id, {
          full_name: userData.fullName,
          role: 'student',
          bio: userData.bio || '',
        });
      }

      this.recordAttempt(email, true);
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      // Check rate limiting
      const rateLimitCheck = this.isRateLimited(email);
      if (rateLimitCheck.isLimited) {
        throw new Error(`Too many attempts. Try again in ${rateLimitCheck.retryAfter} minutes.`);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.recordAttempt(email, false);
        throw error;
      }

      this.recordAttempt(email, true);
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: this.config.oauth.google.queryParams,
          scopes: this.config.oauth.google.scopes,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: null, error };
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear local storage and rate limiting data
      this.attemptTracker.clear();
      localStorage.removeItem('course-antik-auth-token');
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { data: null, error };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    try {
      if (!this.validatePassword(newPassword)) {
        throw new Error('Password does not meet security requirements');
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Password update error:', error);
      return { data: null, error };
    }
  }

  // ============ USER PROFILE MANAGEMENT ============

  /**
   * Create user profile
   */
  async createUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Profile creation error:', error);
      return { data: null, error };
    }
  }

  /**
   * Get current user with profile
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { user: null, error: authError };
      }

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Create profile if it doesn't exist
        if (profileError.code === 'PGRST116') {
          await this.createUserProfile(user.id, {
            full_name: user.user_metadata?.full_name || '',
            role: 'student',
          });
          
          // Retry getting profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          return {
            user: {
              ...user,
              ...newProfile,
            },
            error: null,
          };
        }
        
        throw profileError;
      }

      return {
        user: {
          ...user,
          ...profile,
        },
        error: null,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { data: null, error };
    }
  }

  // ============ AUTHORIZATION ============

  /**
   * Check if user has permission
   */
  hasPermission(user, permission) {
    if (!user || !user.role) return false;

    const roleConfig = this.config.roles[user.role];
    if (!roleConfig) return false;

    // Check for wildcard permissions (admin)
    if (roleConfig.permissions.includes('*')) return true;

    // Check for resource wildcard (e.g., 'courses:*')
    const [resource] = permission.split(':');
    if (roleConfig.permissions.includes(`${resource}:*`)) return true;

    // Check for exact permission
    return roleConfig.permissions.includes(permission);
  }

  /**
   * Check if user can access route
   */
  canAccessRoute(user, route) {
    if (!user || !user.role) return false;

    const roleConfig = this.config.roles[user.role];
    if (!roleConfig) return false;

    return roleConfig.routes.some(allowedRoute => 
      route.startsWith(allowedRoute)
    );
  }

  /**
   * Get user permissions
   */
  getUserPermissions(user) {
    if (!user || !user.role) return [];

    const roleConfig = this.config.roles[user.role];
    return roleConfig ? roleConfig.permissions : [];
  }

  // ============ VALIDATION ============

  /**
   * Validate password strength
   */
  validatePassword(password) {
    const { minLength, pattern } = this.config.password;
    
    if (password.length < minLength) return false;
    if (!pattern.test(password)) return false;
    
    return true;
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ============ SESSION MANAGEMENT ============

  /**
   * Refresh session
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { data: null, error };
    }
  }

  /**
   * Get session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { data: null, error };
    }
  }

  // ============ AUTH STATE LISTENERS ============

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      callback(event, session);
    });
  }

  // ============ SECURITY UTILITIES ============

  /**
   * Generate secure random string
   */
  generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash sensitive data (for client-side hashing if needed)
   */
  async hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
