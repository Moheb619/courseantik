// ============================================================
// Course API — Course CRUD, enrollment, progress
// ============================================================
import { supabase } from './supabaseClient';

export const courseApi = {
  /**
   * Fetch all published courses with instructor info
   */
  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_instructors (
          profile:profiles (id, name, avatar_url)
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten instructor data
    return (data || []).map((course) => ({
      ...course,
      instructors: (course.course_instructors || []).map((ci) => ci.profile),
    }));
  },

  /**
   * Fetch all courses (admin view, including unpublished)
   */
  async getAllCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_instructors (
          profile:profiles (id, name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((course) => ({
      ...course,
      instructors: (course.course_instructors || []).map((ci) => ci.profile),
    }));
  },

  /**
   * Fetch single course with full details
   */
  async getCourseById(id) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_instructors (
          profile:profiles (id, name, avatar_url, email)
        ),
        course_products (
          product:products (id, title, price, thumbnail)
        ),
        modules (
          id, title, sort_order, weight_percentage, quiz_percentage, assignment_percentage,
          lessons (id, title, type, duration, video_url, sort_order),
          resources (id, title, type, url),
          quizzes (id, total_questions_pool, questions_per_attempt, max_attempts, pass_percentage),
          assignments (id, title, description)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Sort modules and lessons by sort_order
    if (data.modules) {
      data.modules.sort((a, b) => a.sort_order - b.sort_order);
      data.modules.forEach((m) => {
        if (m.lessons) m.lessons.sort((a, b) => a.sort_order - b.sort_order);
      });
    }

    return {
      ...data,
      instructors: (data.course_instructors || []).map((ci) => ci.profile),
      recommended_products: (data.course_products || []).map((cp) => cp.product),
    };
  },

  /**
   * Enroll user in a course
   */
  async enrollCourse(courseId, userId) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert([{ course_id: courseId, user_id: userId }])
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Check enrollment status
   */
  async checkEnrollment(courseId, userId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  /**
   * Get enrolled courses for a user
   */
  async getEnrolledCourses(userId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        enrolled_at,
        course:courses (
          id, title, thumbnail_url, duration, level,
          modules (
            id,
            lessons (id)
          )
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get user progress for a course (completed lessons)
   */
  async getProgress(courseId, userId) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id, status, completed_at')
      .eq('course_id', courseId)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  /**
   * Mark a lesson as complete
   */
  async markLessonComplete(courseId, moduleId, lessonId, userId) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert([{
        course_id: courseId,
        module_id: moduleId,
        lesson_id: lessonId,
        user_id: userId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      }])
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new course (admin)
   */
  async createCourse(courseData) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a course (admin)
   */
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

  /**
   * Delete a course (admin)
   */
  async deleteCourse(id) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Assign an instructor to a course
   */
  async assignInstructor(courseId, userId) {
    const { data, error } = await supabase
      .from('course_instructors')
      .insert([{ course_id: courseId, user_id: userId }])
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Remove instructor from course
   */
  async removeInstructor(courseId, userId) {
    const { error } = await supabase
      .from('course_instructors')
      .delete()
      .eq('course_id', courseId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Create a module
   */
  async createModule(moduleData) {
    const { data, error } = await supabase
      .from('modules')
      .insert([moduleData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a module
   */
  async updateModule(id, updates) {
    const { data, error } = await supabase
      .from('modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a module
   */
  async deleteModule(id) {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Create a lesson
   */
  async createLesson(lessonData) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a lesson
   */
  async updateLesson(id, updates) {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a lesson
   */
  async deleteLesson(id) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Link recommended product to a course
   */
  async addRecommendedProduct(courseId, productId) {
    const { error } = await supabase
      .from('course_products')
      .insert([{ course_id: courseId, product_id: productId }]);

    if (error) throw error;
  },

  /**
   * Remove recommended product from a course
   */
  async removeRecommendedProduct(courseId, productId) {
    const { error } = await supabase
      .from('course_products')
      .delete()
      .eq('course_id', courseId)
      .eq('product_id', productId);

    if (error) throw error;
  },
};
