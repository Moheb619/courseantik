// ============================================================
// Instructor API — Instructor-scoped analytics & data
// ============================================================
import { supabase } from './supabaseClient';

export const instructorApi = {
  /**
   * Get courses assigned to the instructor
   */
  async getMyCourses(instructorId) {
    const { data, error } = await supabase
      .from('course_instructors')
      .select(`
        course:courses (
          id, title, thumbnail_url, published, total_students, rating, price, created_at
        )
      `)
      .eq('user_id', instructorId);

    if (error) throw error;
    return (data || []).map((row) => row.course);
  },

  /**
   * Get students enrolled in instructor's courses
   */
  async getMyStudents(instructorId) {
    // First get instructor's course IDs
    const { data: courses, error: coursesError } = await supabase
      .from('course_instructors')
      .select('course_id')
      .eq('user_id', instructorId);

    if (coursesError) throw coursesError;

    const courseIds = (courses || []).map((c) => c.course_id);
    if (courseIds.length === 0) return [];

    // Get enrollments for those courses
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select(`
        *,
        profile:profiles!enrollments_user_id_fkey (id, name, email, avatar_url),
        course:courses!enrollments_course_id_fkey (id, title)
      `)
      .in('course_id', courseIds)
      .order('enrolled_at', { ascending: false });

    if (enrollError) throw enrollError;
    return enrollments;
  },

  /**
   * Get revenue analytics for instructor
   */
  async getMyRevenue(instructorId) {
    // Get instructor's courses
    const courses = await this.getMyCourses(instructorId);
    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return { courses: [], totalEarnings: 0 };
    }

    // Get revenue split
    const { data: settings } = await supabase
      .from('revenue_settings')
      .select('*');

    const instructorPercentage = parseInt(
      settings?.find((s) => s.key === 'instructor_percentage')?.value || '30'
    );

    // Calculate per-course revenue based on enrollments × price
    const courseRevenue = courses.map((course) => {
      const grossRevenue = course.total_students * course.price;
      const instructorShare = Math.round(grossRevenue * instructorPercentage / 100);
      return {
        ...course,
        grossRevenue,
        instructorShare,
        instructorPercentage,
      };
    });

    const totalEarnings = courseRevenue.reduce((sum, c) => sum + c.instructorShare, 0);

    return {
      courses: courseRevenue,
      totalEarnings,
      instructorPercentage,
    };
  },

  /**
   * Get dashboard summary stats
   */
  async getDashboardStats(instructorId) {
    const courses = await this.getMyCourses(instructorId);
    const totalStudents = courses.reduce((sum, c) => sum + (c.total_students || 0), 0);
    const revenue = await this.getMyRevenue(instructorId);

    return {
      totalCourses: courses.length,
      totalStudents,
      totalEarnings: revenue.totalEarnings,
      courses,
    };
  },
};
