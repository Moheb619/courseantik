// User service for admin user management
import { supabase, supabaseAdmin } from '../lib/supabase';

export const userService = {
  // Get all users with filtering and pagination
  async getUsers(options = {}) {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          bio,
          role,
          expertise,
          experience_years,
          hourly_rate,
          is_active,
          created_at,
          updated_at
        `);

      // Apply filters
      if (options.search) {
        query = query.or(`full_name.ilike.%${options.search}%,bio.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      }

      if (options.role) {
        query = query.eq('role', options.role);
      }

      if (options.is_active !== undefined) {
        query = query.eq('is_active', options.is_active);
      }

      // Apply sorting
      if (options.sortBy) {
        const [field, order] = options.sortBy.split('-');
        query = query.order(field, { ascending: order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        totalPages: options.limit ? Math.ceil((count || 0) / options.limit) : 1
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [], count: 0, totalPages: 0 };
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Create new user (admin only)
  async createUser(userData) {
    try {
      console.log('Creating user with data:', userData);
      
      // Check current user authentication
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', currentUser);
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Not authenticated');
      }
      
      // Generate a unique UUID for the new user
      const userId = crypto.randomUUID();
      console.log('Generated user ID:', userId);
      
      // Check if we have admin client available
      const adminClient = supabaseAdmin;
      console.log('Admin client available:', !!adminClient);
      
      if (adminClient) {
        console.log('Using admin client for user creation');
        
        try {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!userData.email || !emailRegex.test(userData.email)) {
            throw new Error('Please provide a valid email address');
          }
          
          // Check if profile with this email already exists
          const { data: existingProfileByEmail } = await adminClient
            .from('profiles')
            .select('id, full_name, email')
            .eq('email', userData.email)
            .single();

          if (existingProfileByEmail) {
            throw new Error('User with this email already exists');
          }
          
          // First create auth user using admin client
          const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              full_name: userData.full_name,
              role: userData.role
            }
          });

          if (authError) {
            console.error('Auth creation error:', authError);
            throw authError;
          }

          // Use the auth user's ID for the profile
          const profileId = authData.user.id;
          console.log('Using auth user ID for profile:', profileId);

          // Create profile using admin client
          const { data: profileData, error: profileError } = await adminClient
            .from('profiles')
            .insert({
              id: profileId,
              email: userData.email,
              full_name: userData.full_name,
              avatar_url: userData.avatar_url || null,
              bio: userData.bio || null,
              role: userData.role,
              expertise: userData.expertise || null,
              hourly_rate: userData.hourly_rate || 0,
              is_active: userData.is_active !== undefined ? userData.is_active : true
            })
            .select()
            .single();

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }

          return profileData;
        } catch (adminError) {
          console.log('Admin client failed, falling back to profile-only creation');
          // Fall through to profile-only creation
        }
      }
      
      // Fallback: Create profile only (without auth user for now)
      console.log('Creating profile-only user (no auth user)');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email || !emailRegex.test(userData.email)) {
        throw new Error('Please provide a valid email address');
      }
      
      // Check if profile with this email already exists
      const { data: existingProfileByEmail } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', userData.email)
        .single();

      if (existingProfileByEmail) {
        throw new Error('User with this email already exists');
      }
      
      // Check if profile with this name already exists
      const { data: existingProfileByName } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('full_name', userData.full_name)
        .single();

      if (existingProfileByName) {
        throw new Error('User with this name already exists');
      }

      // Create profile with generated UUID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userData.email,
          full_name: userData.full_name,
          avatar_url: userData.avatar_url || null,
          bio: userData.bio || null,
          role: userData.role,
          expertise: userData.expertise || null,
          hourly_rate: userData.hourly_rate || 0,
          is_active: userData.is_active !== undefined ? userData.is_active : true
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      console.log('Profile created successfully:', profileData);
      return profileData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(id, role) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      // First delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

      // Then delete profile (this should cascade)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (profileError) throw profileError;

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get instructors for course creation
  async getInstructors() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          expertise,
          hourly_rate
        `)
        .eq('role', 'instructor')
        .eq('is_active', true)
        .order('full_name');

      if (error) {
        console.error('Supabase error fetching instructors:', error);
        throw error;
      }
      
      console.log('Instructors data:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching instructors:', error);
      return [];
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_active, created_at');

      if (error) throw error;

      const stats = {
        total: data.length,
        students: data.filter(u => u.role === 'student').length,
        instructors: data.filter(u => u.role === 'instructor').length,
        admins: data.filter(u => u.role === 'admin').length,
        active: data.filter(u => u.is_active).length,
        inactive: data.filter(u => !u.is_active).length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        total: 0,
        students: 0,
        instructors: 0,
        admins: 0,
        active: 0,
        inactive: 0
      };
    }
  }
};
