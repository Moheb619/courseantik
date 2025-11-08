import { supabase } from '../lib/supabase';

export const notificationService = {
  // Create a notification
  async createNotification(userId, type, title, message, data = {}) {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return notification;
  },

  // Create multiple notifications (for batch operations)
  async createNotifications(notifications) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return data;
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Get unread count for a user
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  // Notification templates for common events
  templates: {
    courseEnrollment: (courseTitle) => ({
      type: 'course_enrollment',
      title: 'Course Enrolled!',
      message: `You have successfully enrolled in "${courseTitle}". Start learning now!`,
      data: { url: `/course/${courseTitle.toLowerCase().replace(/\s+/g, '-')}` }
    }),

    courseCompletion: (courseTitle, certificateUrl) => ({
      type: 'course_completion',
      title: 'Course Completed! 🎉',
      message: `Congratulations! You have completed "${courseTitle}". Your certificate is ready for download.`,
      data: { url: certificateUrl }
    }),

    certificateIssued: (courseTitle, certificateUrl) => ({
      type: 'certificate_issued',
      title: 'Certificate Issued',
      message: `Your certificate for "${courseTitle}" has been issued and is ready for download.`,
      data: { url: certificateUrl }
    }),

    paymentReceived: (amount, orderNumber) => ({
      type: 'payment_received',
      title: 'Payment Received',
      message: `Payment of ${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount / 100)} received for order #${orderNumber}.`,
      data: { url: `/orders/${orderNumber}` }
    }),

    teacherEarning: (courseTitle, amount, month) => ({
      type: 'teacher_earning',
      title: 'New Earnings!',
      message: `You earned ${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount / 100)} from "${courseTitle}" for ${month}.`,
      data: { url: '/dashboard/teacher/earnings' }
    }),

    quizGraded: (courseTitle, score, passed) => ({
      type: 'quiz_graded',
      title: 'Quiz Graded',
      message: `Your quiz for "${courseTitle}" has been graded. Score: ${score}% ${passed ? '✅' : '❌'}`,
      data: { url: `/course/${courseTitle.toLowerCase().replace(/\s+/g, '-')}` }
    }),

    fileSubmissionGraded: (courseTitle, score, passed) => ({
      type: 'file_submission_graded',
      title: 'Assignment Graded',
      message: `Your assignment for "${courseTitle}" has been graded. Score: ${score}% ${passed ? '✅' : '❌'}`,
      data: { url: `/course/${courseTitle.toLowerCase().replace(/\s+/g, '-')}` }
    }),

    systemMaintenance: (message) => ({
      type: 'system',
      title: 'System Notice',
      message: message,
      data: {}
    }),

    newCoursePublished: (courseTitle, instructorName) => ({
      type: 'new_course',
      title: 'New Course Available!',
      message: `"${courseTitle}" by ${instructorName} is now available for enrollment.`,
      data: { url: `/course/${courseTitle.toLowerCase().replace(/\s+/g, '-')}` }
    })
  },

  // Helper methods for common notification scenarios
  async notifyCourseEnrollment(userId, courseTitle) {
    const template = this.templates.courseEnrollment(courseTitle);
    return this.createNotification(userId, template.type, template.title, template.message, template.data);
  },

  async notifyCourseCompletion(userId, courseTitle, certificateUrl) {
    const template = this.templates.courseCompletion(courseTitle, certificateUrl);
    return this.createNotification(userId, template.type, template.title, template.message, template.data);
  },

  async notifyPaymentReceived(userId, amount, orderNumber) {
    const template = this.templates.paymentReceived(amount, orderNumber);
    return this.createNotification(userId, template.type, template.title, template.message, template.data);
  },

  async notifyTeacherEarning(teacherId, courseTitle, amount, month) {
    const template = this.templates.teacherEarning(courseTitle, amount, month);
    return this.createNotification(teacherId, template.type, template.title, template.message, template.data);
  },

  async notifyQuizGraded(userId, courseTitle, score, passed) {
    const template = this.templates.quizGraded(courseTitle, score, passed);
    return this.createNotification(userId, template.type, template.title, template.message, template.data);
  },

  async notifyFileSubmissionGraded(userId, courseTitle, score, passed) {
    const template = this.templates.fileSubmissionGraded(courseTitle, score, passed);
    return this.createNotification(userId, template.type, template.title, template.message, template.data);
  },

  // Broadcast notification to multiple users
  async broadcastNotification(userIds, type, title, message, data = {}) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      data,
      is_read: false
    }));

    return this.createNotifications(notifications);
  },

  // Notify all students about new course
  async notifyNewCourse(courseTitle, instructorName) {
    // Get all student IDs
    const { data: students, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');

    if (error) throw error;

    const studentIds = students.map(student => student.id);
    const template = this.templates.newCoursePublished(courseTitle, instructorName);

    return this.broadcastNotification(
      studentIds,
      template.type,
      template.title,
      template.message,
      template.data
    );
  },

  // Clean up old notifications (older than 30 days)
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;
  }
};

export default notificationService;
