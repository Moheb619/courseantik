import { supabase } from '../lib/supabase';

/**
 * Comprehensive Admin Service
 * Production-level CRUD operations for all database entities
 */

// ===========================================
// COURSE MANAGEMENT
// ===========================================

export const courseAdminService = {
  // Get all courses with pagination and filters
  async getCourses(filters = {}) {
    let query = supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(full_name, avatar_url),
        category:categories(name, slug),
        enrollments(count),
        course_reviews(count)
      `)
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.instructor_id) {
      query = query.eq('instructor_id', filters.instructor_id);
    }
    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published);
    }
    if (filters.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  // Create new course
  async createCourse(courseData) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update course
  async updateCourse(id, updates) {
    const { data, error } = await supabase
      .from('courses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete course
  async deleteCourse(id) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Get course with full details
  async getCourseDetails(id) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(*),
        category:categories(*),
        modules:modules(
          *,
          lessons:lessons(*),
          quizzes:quizzes(*),
          assignments:assignments(*)
        ),
        enrollments(*),
        course_reviews(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
};

// ===========================================
// USER MANAGEMENT
// ===========================================

export const userAdminService = {
  // Get all users with pagination and filters
  async getUsers(filters = {}) {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        courses:courses(count),
        enrollments:enrollments(count)
      `)
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
    }
    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  // Update user role
  async updateUserRole(id, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete user
  async deleteUser(id) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ===========================================
// CATEGORY MANAGEMENT
// ===========================================

export const categoryAdminService = {
  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  // Create category
  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update category
  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete category
  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ===========================================
// MODULE MANAGEMENT
// ===========================================

export const moduleAdminService = {
  // Get modules for a course
  async getModules(courseId) {
    const { data, error } = await supabase
      .from('modules')
      .select(`
        *,
        lessons:lessons(*),
        quizzes:quizzes(*),
        assignments:assignments(*)
      `)
      .eq('course_id', courseId)
      .order('module_order');
    if (error) throw error;
    return data;
  },

  // Create module
  async createModule(moduleData) {
    const { data, error } = await supabase
      .from('modules')
      .insert([moduleData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update module
  async updateModule(id, updates) {
    const { data, error } = await supabase
      .from('modules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete module
  async deleteModule(id) {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ===========================================
// LESSON MANAGEMENT
// ===========================================

export const lessonAdminService = {
  // Get lessons for a module
  async getLessons(moduleId) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('lesson_order');
    if (error) throw error;
    return data;
  },

  // Create lesson
  async createLesson(lessonData) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update lesson
  async updateLesson(id, updates) {
    const { data, error } = await supabase
      .from('lessons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete lesson
  async deleteLesson(id) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ===========================================
// QUIZ MANAGEMENT
// ===========================================

export const quizAdminService = {
  // Get quizzes for a module
  async getQuizzes(moduleId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(
          *,
          options:quiz_options(*)
        )
      `)
      .eq('module_id', moduleId);
    if (error) throw error;
    return data;
  },

  // Create quiz
  async createQuiz(quizData) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update quiz
  async updateQuiz(id, updates) {
    const { data, error } = await supabase
      .from('quizzes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete quiz
  async deleteQuiz(id) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ===========================================
// ASSIGNMENT MANAGEMENT
// ===========================================

export const assignmentAdminService = {
  // Get assignments for a module
  async getAssignments(moduleId) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        submissions:assignment_submissions(count)
      `)
      .eq('module_id', moduleId);
    if (error) throw error;
    return data;
  },

  // Create assignment
  async createAssignment(assignmentData) {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignmentData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update assignment
  async updateAssignment(id, updates) {
    const { data, error } = await supabase
      .from('assignments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete assignment
  async deleteAssignment(id) {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ===========================================
// PRODUCT MANAGEMENT
// ===========================================

export const productAdminService = {
  // Get all products with pagination and filters
  async getProducts(filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:product_categories(name, slug),
        reviews:product_reviews(count)
      `)
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  // Create product
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update product
  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete product
  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

// ===========================================
// ORDER MANAGEMENT
// ===========================================

export const orderAdminService = {
  // Get all orders with pagination and filters
  async getOrders(filters = {}) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        user:profiles(full_name, avatar_url),
        items:order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (filters.search) {
      query = query.or(`order_number.ilike.%${filters.search}%`);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  // Update order status
  async updateOrderStatus(id, status, paymentStatus = null) {
    const updates = { status, updated_at: new Date().toISOString() };
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ===========================================
// ANALYTICS & REPORTS
// ===========================================

export const analyticsAdminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    const [
      { count: totalUsers },
      { count: totalCourses },
      { count: totalOrders },
      { count: totalRevenue }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount').eq('payment_status', 'completed')
    ]);

    const revenue = totalRevenue.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    return {
      totalUsers: totalUsers || 0,
      totalCourses: totalCourses || 0,
      totalOrders: totalOrders || 0,
      totalRevenue: revenue
    };
  },

  // Get enrollment statistics
  async getEnrollmentStats() {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        course_id,
        courses(title),
        count
      `);
    if (error) throw error;
    return data;
  },

  // Get revenue by month
  async getRevenueByMonth() {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('payment_status', 'completed')
      .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());
    if (error) throw error;
    return data;
  }
};

// ===========================================
// NOTIFICATION MANAGEMENT
// ===========================================

export const notificationAdminService = {
  // Get all notifications
  async getNotifications(filters = {}) {
    let query = supabase
      .from('notifications')
      .select(`
        *,
        user:profiles(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.notification_type) {
      query = query.eq('notification_type', filters.notification_type);
    }
    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Create notification
  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Mark notification as read
  async markAsRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export default {
  courseAdminService,
  userAdminService,
  categoryAdminService,
  moduleAdminService,
  lessonAdminService,
  quizAdminService,
  assignmentAdminService,
  productAdminService,
  orderAdminService,
  analyticsAdminService,
  notificationAdminService
};