import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export const teacherEarningsService = {
  // Calculate and create earnings for a completed order
  async processOrderEarnings(orderId) {
    try {
      // Get order details with items
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            course:courses(id, title, instructor_id),
            product:products(id, title)
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!order || order.payment_status !== 'paid') return;

      // Process each order item
      for (const item of order.order_items) {
        if (item.item_type === 'course' && item.course) {
          await this.processCourseEarnings(order, item);
        }
      }
    } catch (error) {
      console.error('Error processing order earnings:', error);
      throw error;
    }
  },

  // Process earnings for a specific course
  async processCourseEarnings(order, orderItem) {
    try {
      const courseId = orderItem.course.id;
      const courseTitle = orderItem.course.title;
      
      // Get teacher assignments for this course
      const { data: assignments, error: assignmentsError } = await supabase
        .from('teacher_assignments')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true);

      if (assignmentsError) throw assignmentsError;

      // Calculate earnings for each teacher
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      for (const assignment of assignments) {
        const earningsAmount = Math.round(
          (orderItem.total_cents * assignment.percentage) / 100
        );

        // Create earnings record
        const { data: earnings, error: earningsError } = await supabase
          .from('teacher_earnings')
          .insert({
            teacher_id: assignment.teacher_id,
            course_id: courseId,
            order_id: order.id,
            earnings_cents: earningsAmount,
            percentage: assignment.percentage,
            status: 'pending',
            month: currentMonth
          })
          .select()
          .single();

        if (earningsError) throw earningsError;

        // Notify teacher about new earnings
        await notificationService.notifyTeacherEarning(
          assignment.teacher_id,
          courseTitle,
          earningsAmount,
          currentMonth
        );
      }
    } catch (error) {
      console.error('Error processing course earnings:', error);
      throw error;
    }
  },

  // Get teacher earnings summary
  async getTeacherEarningsSummary(teacherId, year = null) {
    try {
      let query = supabase
        .from('teacher_earnings')
        .select('*')
        .eq('teacher_id', teacherId);

      if (year) {
        query = query.like('month', `${year}-%`);
      }

      const { data: earnings, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate summary statistics
      const summary = {
        totalEarnings: 0,
        paidEarnings: 0,
        pendingEarnings: 0,
        approvedEarnings: 0,
        monthlyBreakdown: {},
        courses: new Set(),
        totalOrders: 0
      };

      earnings.forEach(earning => {
        summary.totalEarnings += earning.earnings_cents;
        
        if (earning.status === 'paid') {
          summary.paidEarnings += earning.earnings_cents;
        } else if (earning.status === 'pending') {
          summary.pendingEarnings += earning.earnings_cents;
        } else if (earning.status === 'approved') {
          summary.approvedEarnings += earning.earnings_cents;
        }

        // Monthly breakdown
        if (!summary.monthlyBreakdown[earning.month]) {
          summary.monthlyBreakdown[earning.month] = {
            total: 0,
            paid: 0,
            pending: 0,
            approved: 0
          };
        }
        summary.monthlyBreakdown[earning.month].total += earning.earnings_cents;
        summary.monthlyBreakdown[earning.month][earning.status] += earning.earnings_cents;

        summary.courses.add(earning.course_id);
        summary.totalOrders++;
      });

      return {
        ...summary,
        totalCourses: summary.courses.size,
        monthlyBreakdown: Object.entries(summary.monthlyBreakdown)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => b.month.localeCompare(a.month))
      };
    } catch (error) {
      console.error('Error getting teacher earnings summary:', error);
      throw error;
    }
  },

  // Get detailed earnings for a teacher
  async getTeacherEarnings(teacherId, filters = {}) {
    try {
      let query = supabase
        .from('teacher_earnings')
        .select(`
          *,
          course:courses(title, slug),
          order:orders(order_number, total_cents)
        `)
        .eq('teacher_id', teacherId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.month) {
        query = query.eq('month', filters.month);
      }
      
      if (filters.year) {
        query = query.like('month', `${filters.year}-%`);
      }
      
      if (filters.courseId) {
        query = query.eq('course_id', filters.courseId);
      }

      const { data: earnings, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return earnings;
    } catch (error) {
      console.error('Error getting teacher earnings:', error);
      throw error;
    }
  },

  // Approve earnings for payment
  async approveEarnings(earningsId) {
    try {
      const { data, error } = await supabase
        .from('teacher_earnings')
        .update({ status: 'approved' })
        .eq('id', earningsId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving earnings:', error);
      throw error;
    }
  },

  // Mark earnings as paid
  async markEarningsAsPaid(earningsId) {
    try {
      const { data, error } = await supabase
        .from('teacher_earnings')
        .update({ status: 'paid' })
        .eq('id', earningsId)
        .select()
        .single();

      if (error) throw error;

      // Notify teacher about payment
      await notificationService.createNotification(
        data.teacher_id,
        'payment_received',
        'Earnings Paid',
        `Your earnings of ${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(data.earnings_cents / 100)} have been processed and paid.`,
        { url: '/dashboard/teacher/earnings' }
      );

      return data;
    } catch (error) {
      console.error('Error marking earnings as paid:', error);
      throw error;
    }
  },

  // Batch approve earnings for a month
  async batchApproveMonthlyEarnings(teacherId, month) {
    try {
      const { data, error } = await supabase
        .from('teacher_earnings')
        .update({ status: 'approved' })
        .eq('teacher_id', teacherId)
        .eq('month', month)
        .eq('status', 'pending')
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error batch approving earnings:', error);
      throw error;
    }
  },

  // Get teacher assignment details
  async getTeacherAssignments(teacherId) {
    try {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select(`
          *,
          course:courses(title, slug, is_published)
        `)
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting teacher assignments:', error);
      throw error;
    }
  },

  // Create or update teacher assignment
  async createTeacherAssignment(courseId, teacherId, percentage) {
    try {
      // Check if assignment already exists
      const { data: existing, error: checkError } = await supabase
        .from('teacher_assignments')
        .select('id')
        .eq('course_id', courseId)
        .eq('teacher_id', teacherId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        // Update existing assignment
        const { data, error } = await supabase
          .from('teacher_assignments')
          .update({ percentage, is_active: true })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new assignment
        const { data, error } = await supabase
          .from('teacher_assignments')
          .insert({
            course_id: courseId,
            teacher_id: teacherId,
            percentage,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error creating teacher assignment:', error);
      throw error;
    }
  },

  // Deactivate teacher assignment
  async deactivateTeacherAssignment(assignmentId) {
    try {
      const { data, error } = await supabase
        .from('teacher_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deactivating teacher assignment:', error);
      throw error;
    }
  },

  // Get earnings analytics for admin dashboard
  async getEarningsAnalytics(startDate, endDate) {
    try {
      const { data: earnings, error } = await supabase
        .from('teacher_earnings')
        .select(`
          *,
          teacher:profiles(full_name),
          course:courses(title)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      // Calculate analytics
      const analytics = {
        totalEarnings: 0,
        totalTeachers: new Set(),
        totalCourses: new Set(),
        statusBreakdown: { pending: 0, approved: 0, paid: 0 },
        monthlyBreakdown: {},
        topEarners: [],
        topCourses: []
      };

      const teacherEarnings = {};
      const courseEarnings = {};

      earnings.forEach(earning => {
        analytics.totalEarnings += earning.earnings_cents;
        analytics.totalTeachers.add(earning.teacher_id);
        analytics.totalCourses.add(earning.course_id);
        analytics.statusBreakdown[earning.status] += earning.earnings_cents;

        // Monthly breakdown
        const month = earning.month;
        if (!analytics.monthlyBreakdown[month]) {
          analytics.monthlyBreakdown[month] = 0;
        }
        analytics.monthlyBreakdown[month] += earning.earnings_cents;

        // Teacher earnings
        if (!teacherEarnings[earning.teacher_id]) {
          teacherEarnings[earning.teacher_id] = {
            teacher: earning.teacher,
            total: 0
          };
        }
        teacherEarnings[earning.teacher_id].total += earning.earnings_cents;

        // Course earnings
        if (!courseEarnings[earning.course_id]) {
          courseEarnings[earning.course_id] = {
            course: earning.course,
            total: 0
          };
        }
        courseEarnings[earning.course_id].total += earning.earnings_cents;
      });

      analytics.totalTeachers = analytics.totalTeachers.size;
      analytics.totalCourses = analytics.totalCourses.size;
      analytics.topEarners = Object.values(teacherEarnings)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      analytics.topCourses = Object.values(courseEarnings)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      return analytics;
    } catch (error) {
      console.error('Error getting earnings analytics:', error);
      throw error;
    }
  }
};

export default teacherEarningsService;
