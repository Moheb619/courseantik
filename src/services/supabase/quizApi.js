// ============================================================
// Quiz API — Quiz attempts, assignment submissions & grading
// ============================================================
import { supabase } from './supabaseClient';

export const quizApi = {
  /**
   * Get quiz details for a module (including questions for enrolled students)
   */
  async getQuizByModuleId(moduleId) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          id, question_text, options, correct_option_id, sort_order
        )
      `)
      .eq('module_id', moduleId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get the number of attempts a student has made
   */
  async getAttemptCount(quizId, userId) {
    const { count, error } = await supabase
      .from('student_quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId)
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get all attempts for a quiz by a student
   */
  async getMyAttempts(quizId, userId) {
    const { data, error } = await supabase
      .from('student_quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Submit a quiz attempt
   * @param {string} quizId
   * @param {string} userId
   * @param {Array} answers - [{ question_id, selected_option_id }]
   * @param {number} score - Percentage score
   * @param {boolean} passed - Whether the student passed
   */
  async submitQuizAttempt(quizId, userId, answers, score, passed) {
    const { data, error } = await supabase
      .from('student_quiz_attempts')
      .insert([{
        quiz_id: quizId,
        user_id: userId,
        answers,
        score,
        passed,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get assignment details for a module
   */
  async getAssignmentByModuleId(moduleId) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('module_id', moduleId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get a student's submission for an assignment
   */
  async getMySubmission(assignmentId, userId) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Submit an assignment
   */
  async submitAssignment(assignmentId, userId, submissionUrl, notes) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .upsert([{
        assignment_id: assignmentId,
        user_id: userId,
        submission_url: submissionUrl,
        notes,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Grade an assignment (instructor/admin)
   * @param {string} submissionId
   * @param {number} score - Percentage score
   * @param {string} graderId - ID of the grading user
   */
  async gradeAssignment(submissionId, score, graderId) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({
        score,
        graded_by: graderId,
        graded_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all submissions for an assignment (instructor/admin)
   */
  async getSubmissionsForAssignment(assignmentId) {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        profile:profiles!assignment_submissions_user_id_fkey (id, name, email, avatar_url)
      `)
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get module score for a student
   */
  async getModuleScore(moduleId, userId) {
    const { data, error } = await supabase
      .from('student_module_scores')
      .select('*')
      .eq('module_id', moduleId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};
