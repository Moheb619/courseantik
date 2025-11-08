import { supabase } from '../lib/supabase';

/**
 * Comprehensive Teacher Service - Complete teacher functionality aligned with database schema
 */
export const comprehensiveTeacherService = {
  // ============ COURSE MANAGEMENT ============
  
  /**
   * Get teacher's courses with detailed analytics
   */
  async getTeacherCourses(teacherId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('courses')
      .select(`
        *,
        category:categories(name, slug),
        enrollments:enrollments(
          id,
          student:profiles!student_id(id, full_name, avatar_url),
          enrolled_at,
          completed_at,
          progress_percentage
        ),
        modules:modules(
          id,
          title,
          module_order,
          lessons:lessons(count),
          quizzes:quizzes(count),
          assignments:assignments(count)
        ),
        reviews:course_reviews(
          id,
          rating,
          comment,
          student:profiles!student_id(full_name),
          created_at
        ),
        teacher_assignments:teacher_assignments(percentage)
      `)
      .eq('instructor_id', teacherId)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (status !== null) {
      query = query.eq('is_published', status);
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
   * Get teacher's students across all courses
   */
  async getTeacherStudents(teacherId, options = {}) {
    const {
      courseId = null,
      search = null,
      status = null,
      sortBy = 'enrolled_at',
      sortOrder = 'desc'
    } = options;

    let query = supabase
      .from('enrollments')
      .select(`
        *,
        student:profiles!student_id(
          id,
          full_name,
          avatar_url,
          bio
        ),
        course:courses!course_id(
          id,
          title,
          instructor_id
        ),
        lesson_completions:lesson_completions(count),
        quiz_attempts:quiz_attempts(
          score,
          passed,
          completed_at
        ),
        assignment_submissions:assignment_submissions(
          status,
          score,
          passed,
          submitted_at
        ),
        certificates:certificates(
          id,
          certificate_number,
          issued_at
        )
      `)
      .eq('courses.instructor_id', teacherId)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (search) {
      query = query.or(`profiles.full_name.ilike.%${search}%`);
    }

    if (status) {
      if (status === 'completed') {
        query = query.not('completed_at', 'is', null);
      } else if (status === 'active') {
        query = query.is('completed_at', null);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  },

  /**
   * Get pending assignments for grading
   */
  async getPendingAssignments(teacherId) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:assignments(
          id,
          title,
          description,
          pass_marks,
          module:modules(
            title,
            course:courses(
              id,
              title,
              instructor_id
            )
          ),
          rubric:assignment_rubric(*)
        ),
        student:profiles!student_id(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'pending')
      .eq('assignments.modules.courses.instructor_id', teacherId)
      .order('submitted_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Grade assignment submission
   */
  async gradeAssignment(submissionId, gradeData) {
    const {
      score,
      feedback,
      rubricScores = [],
      passed
    } = gradeData;

    // Start transaction
    const { data: submission, error: updateError } = await supabase
      .from('assignment_submissions')
      .update({
        score,
        feedback,
        passed,
        status: 'graded',
        graded_at: new Date().toISOString(),
        graded_by: gradeData.gradedBy
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Insert rubric scores if provided
    if (rubricScores.length > 0) {
      const rubricData = rubricScores.map(score => ({
        submission_id: submissionId,
        rubric_item_id: score.rubricItemId,
        score: score.score
      }));

      const { error: rubricError } = await supabase
        .from('assignment_rubric_scores')
        .insert(rubricData);

      if (rubricError) throw rubricError;
    }

    return submission;
  },

  // ============ EARNINGS ============

  /**
   * Get teacher earnings
   */
  async getTeacherEarnings(teacherId, options = {}) {
    const {
      dateFrom = null,
      dateTo = null,
      status = null
    } = options;

    let query = supabase
      .from('teacher_earnings')
      .select(`
        *,
        course:courses(id, title, price_cents),
        order:orders(
          id,
          order_number,
          created_at,
          user:profiles!user_id(full_name)
        )
      `)
      .eq('instructor_id', teacherId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  },

  /**
   * Get teacher earnings summary
   */
  async getEarningsSummary(teacherId) {
    const [
      { data: totalEarnings },
      { data: pendingEarnings },
      { data: paidEarnings },
      { data: monthlyEarnings }
    ] = await Promise.all([
      supabase
        .from('teacher_earnings')
        .select('amount_cents')
        .eq('instructor_id', teacherId),
      
      supabase
        .from('teacher_earnings')
        .select('amount_cents')
        .eq('instructor_id', teacherId)
        .eq('status', 'pending'),
      
      supabase
        .from('teacher_earnings')
        .select('amount_cents')
        .eq('instructor_id', teacherId)
        .eq('status', 'paid'),
      
      supabase
        .from('teacher_earnings')
        .select('amount_cents, created_at')
        .eq('instructor_id', teacherId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    return {
      totalEarnings: totalEarnings?.reduce((sum, e) => sum + e.amount_cents, 0) || 0,
      pendingEarnings: pendingEarnings?.reduce((sum, e) => sum + e.amount_cents, 0) || 0,
      paidEarnings: paidEarnings?.reduce((sum, e) => sum + e.amount_cents, 0) || 0,
      monthlyEarnings: monthlyEarnings?.reduce((sum, e) => sum + e.amount_cents, 0) || 0
    };
  },

  // ============ COURSE ANALYTICS ============

  /**
   * Get detailed course analytics for teacher
   */
  async getCourseAnalytics(courseId, teacherId) {
    const [
      { data: course },
      { data: enrollmentTrend },
      { data: completionStats },
      { data: quizPerformance },
      { data: assignmentStats }
    ] = await Promise.all([
      // Basic course info
      supabase
        .from('courses')
        .select(`
          *,
          enrollments:enrollments(count),
          completions:enrollments!inner(completed_at)
        `)
        .eq('id', courseId)
        .eq('instructor_id', teacherId)
        .single(),
      
      // Enrollment trend (last 30 days)
      supabase
        .from('enrollments')
        .select('enrolled_at')
        .eq('course_id', courseId)
        .gte('enrolled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('enrolled_at'),
      
      // Completion statistics
      supabase
        .from('enrollments')
        .select('progress_percentage, completed_at')
        .eq('course_id', courseId),
      
      // Quiz performance
      supabase
        .from('quiz_attempts')
        .select(`
          score,
          passed,
          quiz:quizzes!inner(
            module:modules!inner(
              course_id
            )
          )
        `)
        .eq('quizzes.modules.course_id', courseId),
      
      // Assignment statistics
      supabase
        .from('assignment_submissions')
        .select(`
          score,
          passed,
          status,
          assignment:assignments!inner(
            module:modules!inner(
              course_id
            )
          )
        `)
        .eq('assignments.modules.course_id', courseId)
    ]);

    const completionRate = completionStats?.filter(e => e.completed_at).length / completionStats?.length * 100 || 0;
    const averageProgress = completionStats?.reduce((sum, e) => sum + e.progress_percentage, 0) / completionStats?.length || 0;
    const quizPassRate = quizPerformance?.filter(q => q.passed).length / quizPerformance?.length * 100 || 0;
    const assignmentPassRate = assignmentStats?.filter(a => a.passed).length / assignmentStats?.length * 100 || 0;

    return {
      course,
      enrollmentTrend: this._groupByDate(enrollmentTrend, 'enrolled_at'),
      completionRate,
      averageProgress,
      quizPassRate,
      assignmentPassRate,
      totalEnrollments: completionStats?.length || 0
    };
  },

  // ============ STUDENT COMMUNICATION ============

  /**
   * Send message to students
   */
  async sendMessageToStudents(teacherId, messageData) {
    const {
      courseId = null,
      studentIds = null,
      title,
      message,
      notification_type = 'course'
    } = messageData;

    let targetStudents = [];

    if (studentIds) {
      targetStudents = studentIds;
    } else if (courseId) {
      const { data } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', courseId);
      targetStudents = data?.map(e => e.student_id) || [];
    }

    const notifications = targetStudents.map(studentId => ({
      user_id: studentId,
      title,
      message,
      notification_type,
      is_read: false,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return data;
  }
};

export default comprehensiveTeacherService;
