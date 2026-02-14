// ============================================================
// Admin API — Admin dashboard & management operations
// ============================================================
import { supabase } from './supabaseClient';

export const adminApi = {
  /**
   * Get platform-wide dashboard statistics
   * @returns {Promise<object>} { totalUsers, totalCourses, totalOrders, totalRevenue }
   */
  async getDashboardStats() {
    const [usersRes, coursesRes, ordersRes, revenueRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total').eq('payment_status', 'paid'),
    ]);

    const totalRevenue = (revenueRes.data || []).reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalUsers: usersRes.count || 0,
      totalCourses: coursesRes.count || 0,
      totalOrders: ordersRes.count || 0,
      totalRevenue,
    };
  },

  /**
   * Get all users with their roles
   */
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (
          role:roles (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten role data for convenience
    return data.map((user) => ({
      ...user,
      role: user.user_roles?.[0]?.role?.name || 'student',
    }));
  },

  /**
   * Update a user's role
   * @param {string} userId
   * @param {string} roleName - 'admin' | 'instructor' | 'student'
   */
  async updateUserRole(userId, roleName) {
    // Get the role ID
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError) throw roleError;

    // Delete existing roles and insert new one
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    const { data, error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role_id: role.id }])
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Update user status (active/suspended/banned)
   */
  async updateUserStatus(userId, status) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get recent activity for dashboard (last 10 enrollments + orders)
   */
  async getRecentActivity() {
    const [enrollments, orders] = await Promise.all([
      supabase
        .from('enrollments')
        .select('*, profiles:user_id (name), courses:course_id (title)')
        .order('enrolled_at', { ascending: false })
        .limit(5),
      supabase
        .from('orders')
        .select('*, profiles:user_id (name)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    return {
      recentEnrollments: enrollments.data || [],
      recentOrders: orders.data || [],
    };
  },
};
