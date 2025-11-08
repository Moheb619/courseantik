// Assignment service for Supabase database operations
import { supabase } from '../lib/supabase';

export const assignmentService = {
  // Get assignment by module ID
  async getAssignmentByModule(moduleId) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          assignment_rubric (*)
        `)
        .eq('module_id', moduleId)
        .single();

      if (error) return { data: null, error };

      // Structure data to match Assignment.jsx component expectations
      const assignment = {
        id: data.id,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        submissionType: data.submission_type,
        allowedFileTypes: data.allowed_file_types,
        maxFileSize: data.max_file_size,
        passMarks: data.pass_marks,
        isRequired: data.is_required,
        dueDate: data.due_date,
        rubric: data.assignment_rubric
          .sort((a, b) => a.rubric_order - b.rubric_order)
          .map(r => ({
            criteria: r.criteria,
            description: r.description,
            points: r.points
          }))
      };

      return { data: assignment, error: null };
    } catch (error) {
      console.error('Error fetching assignment:', error);
      return { data: null, error };
    }
  },

  // Submit assignment
  async submitAssignment(assignmentId, studentId, submissionData) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert([{
          assignment_id: assignmentId,
          student_id: studentId,
          submission_type: submissionData.type,
          content: submissionData.content,
          files: submissionData.files
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return { data: null, error };
    }
  },

  // Get student's assignment submissions
  async getStudentSubmissions(assignmentId, studentId) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment_rubric_scores (
            *,
            rubric_item:assignment_rubric (criteria, points)
          )
        `)
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false });

      if (error) return { data: null, error };

      // Structure submissions with rubric scores
      const submissions = data.map(submission => ({
        ...submission,
        rubricScores: submission.assignment_rubric_scores.map(score => ({
          criteria: score.rubric_item.criteria,
          score: score.score,
          maxPoints: score.rubric_item.points
        }))
      }));

      return { data: submissions, error: null };
    } catch (error) {
      console.error('Error fetching student submissions:', error);
      return { data: null, error };
    }
  },

  // Get all submissions for an assignment (admin/instructor)
  async getAssignmentSubmissions(assignmentId, filters = {}) {
    try {
      let query = supabase
        .from('assignment_grading_queue') // Using the view we created
        .select('*')
        .eq('assignment_id', assignmentId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`student_name.ilike.%${filters.search}%,student_email.ilike.%${filters.search}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'studentName':
          query = query.order('student_name');
          break;
        case 'status':
          query = query.order('status');
          break;
        case 'score':
          query = query.order('score', { ascending: false });
          break;
        default:
          query = query.order('submitted_at', { ascending: false });
      }

      const { data, error } = await query;

      return { data, error };
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      return { data: null, error };
    }
  },

  // Grade assignment submission
  async gradeSubmission(submissionId, gradingData) {
    try {
      // Update submission with grade and feedback
      const { data: submission, error: submissionError } = await supabase
        .from('assignment_submissions')
        .update({
          score: gradingData.score,
          passed: gradingData.passed,
          feedback: gradingData.feedback,
          graded_at: gradingData.gradedAt,
          graded_by: gradingData.gradedBy,
          status: 'graded'
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Delete existing rubric scores
      await supabase
        .from('assignment_rubric_scores')
        .delete()
        .eq('submission_id', submissionId);

      // Insert new rubric scores
      if (gradingData.rubricScores && gradingData.rubricScores.length > 0) {
        const rubricScoresData = gradingData.rubricScores.map(score => ({
          submission_id: submissionId,
          rubric_item_id: score.rubricItemId, // You'll need to map criteria to rubric item IDs
          score: score.score
        }));

        const { error: rubricError } = await supabase
          .from('assignment_rubric_scores')
          .insert(rubricScoresData);

        if (rubricError) throw rubricError;
      }

      return { data: submission, error: null };
    } catch (error) {
      console.error('Error grading submission:', error);
      return { data: null, error };
    }
  },

  // Create new assignment (admin function)
  async createAssignment(moduleId, assignmentData) {
    try {
      // Insert assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert([{
          module_id: moduleId,
          title: assignmentData.title,
          description: assignmentData.description,
          requirements: assignmentData.requirements,
          submission_type: assignmentData.submissionType,
          allowed_file_types: assignmentData.allowedFileTypes,
          max_file_size: assignmentData.maxFileSize,
          pass_marks: assignmentData.passMarks,
          is_required: assignmentData.isRequired,
          due_date: assignmentData.dueDate
        }])
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Insert rubric items
      if (assignmentData.rubric && assignmentData.rubric.length > 0) {
        const rubricData = assignmentData.rubric.map((item, index) => ({
          assignment_id: assignment.id,
          criteria: item.criteria,
          description: item.description,
          points: item.points,
          rubric_order: index + 1
        }));

        const { error: rubricError } = await supabase
          .from('assignment_rubric')
          .insert(rubricData);

        if (rubricError) throw rubricError;
      }

      return { data: assignment, error: null };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { data: null, error };
    }
  },

  // Update assignment (admin function)
  async updateAssignment(assignmentId, assignmentData) {
    try {
      // Update assignment basic info
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .update({
          title: assignmentData.title,
          description: assignmentData.description,
          requirements: assignmentData.requirements,
          submission_type: assignmentData.submissionType,
          allowed_file_types: assignmentData.allowedFileTypes,
          max_file_size: assignmentData.maxFileSize,
          pass_marks: assignmentData.passMarks,
          is_required: assignmentData.isRequired,
          due_date: assignmentData.dueDate
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Delete existing rubric items
      await supabase
        .from('assignment_rubric')
        .delete()
        .eq('assignment_id', assignmentId);

      // Re-insert rubric items
      if (assignmentData.rubric && assignmentData.rubric.length > 0) {
        const rubricData = assignmentData.rubric.map((item, index) => ({
          assignment_id: assignmentId,
          criteria: item.criteria,
          description: item.description,
          points: item.points,
          rubric_order: index + 1
        }));

        const { error: rubricError } = await supabase
          .from('assignment_rubric')
          .insert(rubricData);

        if (rubricError) throw rubricError;
      }

      return { data: assignment, error: null };
    } catch (error) {
      console.error('Error updating assignment:', error);
      return { data: null, error };
    }
  },

  // Delete assignment (admin function)
  async deleteAssignment(assignmentId) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return { data: null, error };
    }
  },

  // Upload assignment files
  async uploadAssignmentFile(file, studentId, assignmentId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${studentId}/${assignmentId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('assignment-files')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assignment-files')
        .getPublicUrl(fileName);

      return {
        data: {
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
          path: fileName
        },
        error: null
      };
    } catch (error) {
      console.error('Error uploading assignment file:', error);
      return { data: null, error };
    }
  },

  // Get assignment analytics (admin function)
  async getAssignmentAnalytics(assignmentId) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          student:profiles(full_name)
        `)
        .eq('assignment_id', assignmentId);

      if (error) throw error;

      const totalSubmissions = data.length;
      const gradedSubmissions = data.filter(sub => sub.status === 'graded').length;
      const passedSubmissions = data.filter(sub => sub.passed === true).length;
      const averageScore = gradedSubmissions > 0
        ? Math.round(data.filter(sub => sub.score !== null).reduce((sum, sub) => sum + sub.score, 0) / gradedSubmissions)
        : 0;

      return {
        data: {
          totalSubmissions,
          gradedSubmissions,
          pendingSubmissions: totalSubmissions - gradedSubmissions,
          passedSubmissions,
          passRate: gradedSubmissions > 0 ? Math.round((passedSubmissions / gradedSubmissions) * 100) : 0,
          averageScore,
          submissions: data
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching assignment analytics:', error);
      return { data: null, error };
    }
  }
};

export default assignmentService;
