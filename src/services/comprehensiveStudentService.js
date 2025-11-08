import { supabase } from '../lib/supabase';

/**
 * Comprehensive Student Service - Complete student functionality aligned with database schema
 */
export const comprehensiveStudentService = {
  // ============ ENROLLMENT & PROGRESS ============
  
  /**
   * Get student's enrolled courses with detailed progress
   */
  async getEnrolledCourses(studentId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          *,
          instructor:profiles!instructor_id(full_name, avatar_url),
          category:categories(name, slug),
          modules:modules(
            id,
            title,
            module_order,
            lessons:lessons(
              id,
              title,
              duration,
              completions:lesson_completions!inner(completed_at)
            ),
            quizzes:quizzes(
              id,
              title,
              attempts:quiz_attempts!inner(score, passed, completed_at)
            ),
            assignments:assignments(
              id,
              title,
              submissions:assignment_submissions!inner(status, score, passed)
            ),
            completions:module_completions!inner(completed_at)
          )
        )
      `)
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get student's learning progress summary
   */
  async getProgressSummary(studentId) {
    const [
      { count: totalEnrollments },
      { count: completedCourses },
      { count: totalCertificates },
      { data: recentActivity },
      { data: quizAttempts },
      { data: assignmentSubmissions }
    ] = await Promise.all([
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId),
      
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .not('completed_at', 'is', null),
      
      supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId),
      
      // Recent activity (lesson completions, quiz attempts, etc.)
      supabase
        .from('lesson_completions')
        .select(`
          completed_at,
          lesson:lessons(
            title,
            module:modules(
              title,
              course:courses(title)
            )
          )
        `)
        .eq('student_id', studentId)
        .order('completed_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId),
      
      supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
    ]);

    return {
      totalEnrollments,
      completedCourses,
      totalCertificates,
      recentActivity,
      totalQuizAttempts: quizAttempts,
      totalAssignmentSubmissions: assignmentSubmissions
    };
  },

  // ============ CERTIFICATES ============

  /**
   * Get student's certificates
   */
  async getCertificates(studentId) {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses(
          id,
          title,
          instructor:profiles!instructor_id(full_name)
        )
      `)
      .eq('student_id', studentId)
      .eq('is_valid', true)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // ============ ORDERS & PURCHASES ============

  /**
   * Get student's order history
   */
  async getOrderHistory(studentId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          course:courses(id, title),
          product:products(id, title)
        )
      `)
      .eq('user_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // ============ ASSIGNMENTS ============

  /**
   * Get student's assignment submissions
   */
  async getAssignmentSubmissions(studentId, options = {}) {
    const { courseId = null, status = null } = options;

    let query = supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:assignments(
          id,
          title,
          description,
          pass_marks,
          due_date,
          module:modules(
            title,
            course:courses(id, title)
          ),
          rubric:assignment_rubric(*)
        ),
        rubric_scores:assignment_rubric_scores(
          score,
          rubric_item:assignment_rubric(criteria, points)
        )
      `)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (courseId) {
      query = query.eq('assignments.modules.course_id', courseId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Submit assignment
   */
  async submitAssignment(assignmentData) {
    const {
      assignmentId,
      studentId,
      submissionType,
      content = null,
      files = null
    } = assignmentData;

    const { data, error } = await supabase
      .from('assignment_submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: studentId,
        submission_type: submissionType,
        content,
        files,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ QUIZ ATTEMPTS ============

  /**
   * Get student's quiz attempts
   */
  async getQuizAttempts(studentId, options = {}) {
    const { courseId = null, quizId = null } = options;

    let query = supabase
      .from('quiz_attempts')
      .select(`
        *,
        quiz:quizzes(
          id,
          title,
          pass_marks,
          max_attempts,
          module:modules(
            title,
            course:courses(id, title)
          )
        )
      `)
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (courseId) {
      query = query.eq('quizzes.modules.course_id', courseId);
    }

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(quizData) {
    const {
      quizId,
      studentId,
      answers,
      score,
      passed,
      timeSpent
    } = quizData;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        answers,
        score,
        passed,
        time_spent: timeSpent,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ LESSON PROGRESS ============

  /**
   * Mark lesson as completed
   */
  async markLessonCompleted(lessonId, studentId, watchTime = 0) {
    const { data, error } = await supabase
      .from('lesson_completions')
      .upsert({
        lesson_id: lessonId,
        student_id: studentId,
        watch_time: watchTime,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get lesson completion status
   */
  async getLessonProgress(studentId, courseId = null) {
    let query = supabase
      .from('lesson_completions')
      .select(`
        *,
        lesson:lessons(
          id,
          title,
          duration,
          module:modules(
            id,
            title,
            course_id
          )
        )
      `)
      .eq('student_id', studentId);

    if (courseId) {
      query = query.eq('lessons.modules.course_id', courseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // ============ NOTIFICATIONS ============

  /**
   * Get student notifications
   */
  async getNotifications(studentId, options = {}) {
    const { isRead = null, limit = 20 } = options;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false });

    if (isRead !== null) {
      query = query.eq('is_read', isRead);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ REVIEWS ============

  /**
   * Submit course review
   */
  async submitCourseReview(reviewData) {
    const {
      courseId,
      studentId,
      rating,
      comment
    } = reviewData;

    const { data, error } = await supabase
      .from('course_reviews')
      .insert({
        course_id: courseId,
        student_id: studentId,
        rating,
        comment,
        is_approved: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default comprehensiveStudentService;
