import { supabase } from '../lib/supabase';

/**
 * Comprehensive Admin Service - Complete admin functionality aligned with database schema
 */
export const comprehensiveAdminService = {
  // ============ USER MANAGEMENT ============
  
  /**
   * Get all users with detailed information
   */
  async getUsers(options = {}) {
    const {
      page = 1,
      limit = 20,
      role = null,
      search = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        bio,
        role,
        created_at,
        updated_at,
        enrollments:enrollments(count),
        courses_taught:courses!instructor_id(count),
        orders:orders(count),
        certificates:certificates(count)
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      users: data,
      totalCount: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  },

  /**
   * Get comprehensive user statistics
   */
  async getUserStats() {
    const [
      { count: totalUsers },
      { count: totalStudents },
      { count: totalInstructors },
      { count: totalAdmins },
      { count: activeEnrollments },
      { data: recentUsers }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      activeEnrollments,
      recentUsers
    };
  },

  /**
   * Update user profile and role
   */
  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ COURSE MANAGEMENT ============

  /**
   * Get all courses with comprehensive details
   */
  async getAllCourses(options = {}) {
    const {
      page = 1,
      limit = 20,
      category = null,
      status = null,
      search = null,
      instructor = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!instructor_id(id, full_name, avatar_url),
        category:categories(id, name, slug),
        enrollments(count),
        modules:modules(count),
        reviews:course_reviews(rating),
        teacher_assignments:teacher_assignments(
          id,
          teacher:profiles!teacher_id(full_name),
          percentage
        )
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (category) {
      query = query.eq('category_id', category);
    }

    if (status !== null) {
      query = query.eq('is_published', status);
    }

    if (instructor) {
      query = query.eq('instructor_id', instructor);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      courses: data,
      totalCount: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  },

  /**
   * Get course statistics
   */
  async getCourseStats() {
    const [
      { count: totalCourses },
      { count: publishedCourses },
      { count: draftCourses },
      { count: totalEnrollments },
      { data: topCourses }
    ] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', false),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase
        .from('courses')
        .select('id, title, enrolled_count, rating')
        .eq('is_published', true)
        .order('enrolled_count', { ascending: false })
        .limit(5)
    ]);

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      topCourses
    };
  },

  /**
   * Update course status
   */
  async updateCourseStatus(courseId, updates) {
    const { data, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ ORDER MANAGEMENT ============

  /**
   * Get all orders with comprehensive details
   */
  async getAllOrders(options = {}) {
    const {
      page = 1,
      limit = 20,
      status = null,
      dateFrom = null,
      dateTo = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('orders')
      .select(`
        *,
        user:profiles!user_id(id, full_name, avatar_url),
        order_items:order_items(
          id,
          item_type,
          title,
          price_cents,
          quantity,
          course:courses(id, title),
          product:products(id, title)
        )
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (status) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      orders: data,
      totalCount: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  },

  /**
   * Get order statistics
   */
  async getOrderStats() {
    const [
      { count: totalOrders },
      { count: pendingOrders },
      { count: completedOrders },
      { count: cancelledOrders },
      { data: revenueData }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
      supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const monthlyRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      monthlyRevenue
    };
  },

  // ============ ASSIGNMENT & QUIZ MANAGEMENT ============

  /**
   * Get all assignments with submissions
   */
  async getAllAssignments(options = {}) {
    const { courseId = null, moduleId = null } = options;

    let query = supabase
      .from('assignments')
      .select(`
        *,
        module:modules(id, title, course:courses(id, title)),
        submissions:assignment_submissions(
          id,
          student:profiles!student_id(full_name),
          status,
          score,
          submitted_at,
          graded_at
        ),
        rubric:assignment_rubric(*)
      `)
      .order('created_at', { ascending: false });

    if (courseId) {
      query = query.eq('modules.course_id', courseId);
    }

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  },

  /**
   * Get all quizzes with attempts
   */
  async getAllQuizzes(options = {}) {
    const { courseId = null, moduleId = null } = options;

    let query = supabase
      .from('quizzes')
      .select(`
        *,
        module:modules(id, title, course:courses(id, title)),
        questions:quiz_questions(
          *,
          options:quiz_options(*)
        ),
        attempts:quiz_attempts(
          id,
          student:profiles!student_id(full_name),
          score,
          passed,
          completed_at
        )
      `)
      .order('created_at', { ascending: false });

    if (courseId) {
      query = query.eq('modules.course_id', courseId);
    }

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  },

  // ============ ANALYTICS ============

  /**
   * Get comprehensive platform analytics
   */
  async getPlatformAnalytics(dateRange = '30d') {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: userGrowth },
      { data: enrollmentData },
      { data: revenueData },
      { data: completionData },
      { data: certificateData }
    ] = await Promise.all([
      // User growth
      supabase
        .from('profiles')
        .select('created_at, role')
        .gte('created_at', startDate)
        .order('created_at'),
      
      // Enrollment data
      supabase
        .from('enrollments')
        .select('enrolled_at, course:courses(title)')
        .gte('enrolled_at', startDate)
        .order('enrolled_at'),
      
      // Revenue data
      supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .order('created_at'),
      
      // Course completion data
      supabase
        .from('enrollments')
        .select('completed_at, progress_percentage')
        .not('completed_at', 'is', null)
        .gte('completed_at', startDate),
      
      // Certificate data
      supabase
        .from('certificates')
        .select('issued_at')
        .gte('issued_at', startDate)
    ]);

    return {
      userGrowth: this._groupByDate(userGrowth),
      enrollmentData: this._groupByDate(enrollmentData, 'enrolled_at'),
      revenueData: this._groupByDate(revenueData, 'created_at', 'total_amount'),
      completionData: this._groupByDate(completionData, 'completed_at'),
      certificateData: this._groupByDate(certificateData, 'issued_at')
    };
  },

  /**
   * Get teacher performance analytics
   */
  async getTeacherAnalytics() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        courses:courses!instructor_id(
          id,
          title,
          enrolled_count,
          rating,
          price_cents,
          enrollments:enrollments(count)
        ),
        earnings:teacher_earnings(
          amount_cents,
          status
        )
      `)
      .eq('role', 'instructor');

    if (error) throw error;

    return data.map(teacher => ({
      ...teacher,
      totalStudents: teacher.courses.reduce((sum, course) => sum + course.enrolled_count, 0),
      totalCourses: teacher.courses.length,
      averageRating: teacher.courses.length > 0 
        ? teacher.courses.reduce((sum, course) => sum + course.rating, 0) / teacher.courses.length 
        : 0,
      totalEarnings: teacher.earnings.reduce((sum, earning) => sum + earning.amount_cents, 0)
    }));
  },

  // ============ NOTIFICATIONS ============

  /**
   * Send bulk notifications
   */
  async sendNotification(notification) {
    const {
      title,
      message,
      notification_type = 'system',
      userIds = null,
      role = null,
      action_url = null
    } = notification;

    let targetUsers = [];

    if (userIds) {
      targetUsers = userIds;
    } else if (role) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', role);
      targetUsers = data?.map(u => u.id) || [];
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('id');
      targetUsers = data?.map(u => u.id) || [];
    }

    const notifications = targetUsers.map(userId => ({
      user_id: userId,
      title,
      message,
      notification_type,
      action_url,
      is_read: false,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return data;
  },

  // ============ INSTRUCTOR-COURSE ASSIGNMENT ============

  /**
   * Get courses assigned to an instructor
   */
  async getUserAssignedCourses(instructorId) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!instructor_id(full_name, avatar_url),
        category:categories(name, slug),
        enrollments(count)
      `)
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Assign courses to an instructor
   */
  async assignCoursesToInstructor(instructorId, courseIds) {
    const { data, error } = await supabase
      .from('courses')
      .update({ instructor_id: instructorId })
      .in('id', courseIds)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Remove course assignment from instructor
   */
  async removeCourseAssignment(instructorId, courseId) {
    const { data, error } = await supabase
      .from('courses')
      .update({ instructor_id: null })
      .eq('id', courseId)
      .eq('instructor_id', instructorId)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Get all instructors for course assignment
   */
  async getInstructorsForAssignment() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        expertise,
        experience_years,
        courses:courses!instructor_id(count)
      `)
      .eq('role', 'instructor')
      .eq('is_active', true)
      .order('full_name');

    if (error) throw error;
    return data;
  },

  /**
   * Bulk assign courses to multiple instructors
   */
  async bulkAssignCoursesToInstructors(assignments) {
    const updates = assignments.map(({ instructorId, courseIds }) =>
      courseIds.map(courseId => ({
        id: courseId,
        instructor_id: instructorId
      }))
    ).flat();

    const { data, error } = await supabase
      .from('courses')
      .upsert(updates, { onConflict: 'id' })
      .select();

    if (error) throw error;
    return data;
  },

  // ============ HELPER METHODS ============

  /**
   * Group data by date for analytics
   */
  _groupByDate(data, dateField = 'created_at', valueField = null) {
    if (!data) return [];
    
    const grouped = data.reduce((acc, item) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = valueField ? 0 : 0;
      }
      if (valueField) {
        acc[date] += item[valueField] || 0;
      } else {
        acc[date] += 1;
      }
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, value]) => ({
      date,
      value
    }));
  },

  /**
   * Export data to CSV
   */
  async exportData(type, options = {}) {
    let data = [];
    
    switch (type) {
      case 'users':
        const users = await this.getUsers({ limit: 10000, ...options });
        data = users.users;
        break;
      case 'courses':
        const courses = await this.getAllCourses({ limit: 10000, ...options });
        data = courses.courses;
        break;
      case 'orders':
        const orders = await this.getAllOrders({ limit: 10000, ...options });
        data = orders.orders;
        break;
      case 'enrollments':
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses(title),
            student:profiles(full_name)
          `);
        data = enrollments;
        break;
      default:
        throw new Error('Invalid export type');
    }

    return this._convertToCSV(data);
  },

  /**
   * Convert data to CSV format
   */
  _convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'object') return JSON.stringify(value);
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }
};

export default comprehensiveAdminService;
