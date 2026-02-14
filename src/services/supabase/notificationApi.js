// ============================================================
// Notification API — User notifications
// ============================================================
import { supabase } from './supabaseClient';

export const notificationApi = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  /**
   * Create a notification (admin/system)
   */
  async createNotification({ userId, type, title, message, link }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        link,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
