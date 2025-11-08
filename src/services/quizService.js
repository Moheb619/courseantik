// Quiz service for Supabase database operations
import { supabase } from '../lib/supabase';

export const quizService = {
  // Get quiz by module ID
  async getQuizByModule(moduleId) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions (
            *,
            quiz_options (*)
          )
        `)
        .eq('module_id', moduleId)
        .single();

      if (error) return { data: null, error };

      // Structure data to match Quiz.jsx component expectations
      const quiz = {
        id: data.id,
        title: data.title,
        description: data.description,
        passMarks: data.pass_marks,
        timeLimit: data.time_limit,
        isRequired: data.is_required,
        maxAttempts: data.max_attempts,
        questions: data.quiz_questions.map(q => ({
          id: q.id,
          question: q.question,
          type: q.question_type,
          options: q.quiz_options
            .sort((a, b) => a.option_order - b.option_order)
            .map(opt => ({
              id: opt.id,
              text: opt.option_text,
              correct: opt.is_correct
            })),
          explanation: q.explanation
        }))
      };

      return { data: quiz, error: null };
    } catch (error) {
      console.error('Error fetching quiz:', error);
      return { data: null, error };
    }
  },

  // Submit quiz attempt
  async submitQuizAttempt(quizId, studentId, answers, score, passed, timeSpent) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert([{
          quiz_id: quizId,
          student_id: studentId,
          score,
          passed,
          time_spent: timeSpent,
          answers
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      return { data: null, error };
    }
  },

  // Get student's quiz attempts for a quiz
  async getStudentQuizAttempts(quizId, studentId) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .order('completed_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      return { data: null, error };
    }
  },

  // Create new quiz (admin function)
  async createQuiz(moduleId, quizData) {
    try {
      // Insert quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([{
          module_id: moduleId,
          title: quizData.title,
          description: quizData.description,
          pass_marks: quizData.passMarks,
          time_limit: quizData.timeLimit,
          is_required: quizData.isRequired || true,
          max_attempts: quizData.maxAttempts
        }])
        .select()
        .single();

      if (quizError) throw quizError;

      // Insert questions and options
      for (let i = 0; i < quizData.questions.length; i++) {
        const question = quizData.questions[i];
        
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .insert([{
            quiz_id: quiz.id,
            question: question.question,
            question_type: question.type,
            question_order: i + 1,
            explanation: question.explanation
          }])
          .select()
          .single();

        if (questionError) throw questionError;

        // Insert options
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          const { error: optionError } = await supabase
            .from('quiz_options')
            .insert([{
              question_id: questionData.id,
              option_text: option.text,
              option_order: j + 1,
              is_correct: option.correct
            }]);

          if (optionError) throw optionError;
        }
      }

      return { data: quiz, error: null };
    } catch (error) {
      console.error('Error creating quiz:', error);
      return { data: null, error };
    }
  },

  // Update quiz (admin function)
  async updateQuiz(quizId, quizData) {
    try {
      // Update quiz basic info
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: quizData.title,
          description: quizData.description,
          pass_marks: quizData.passMarks,
          time_limit: quizData.timeLimit,
          is_required: quizData.isRequired,
          max_attempts: quizData.maxAttempts
        })
        .eq('id', quizId)
        .select()
        .single();

      if (quizError) throw quizError;

      // Delete existing questions and options
      const { error: deleteError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);

      if (deleteError) throw deleteError;

      // Re-insert questions and options
      for (let i = 0; i < quizData.questions.length; i++) {
        const question = quizData.questions[i];
        
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .insert([{
            quiz_id: quizId,
            question: question.question,
            question_type: question.type,
            question_order: i + 1,
            explanation: question.explanation
          }])
          .select()
          .single();

        if (questionError) throw questionError;

        // Insert options
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          const { error: optionError } = await supabase
            .from('quiz_options')
            .insert([{
              question_id: questionData.id,
              option_text: option.text,
              option_order: j + 1,
              is_correct: option.correct
            }]);

          if (optionError) throw optionError;
        }
      }

      return { data: quiz, error: null };
    } catch (error) {
      console.error('Error updating quiz:', error);
      return { data: null, error };
    }
  },

  // Delete quiz (admin function)
  async deleteQuiz(quizId) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return { data: null, error };
    }
  },

  // Get quiz analytics (admin function)
  async getQuizAnalytics(quizId) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          student:profiles(full_name, avatar_url)
        `)
        .eq('quiz_id', quizId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Calculate analytics
      const totalAttempts = data.length;
      const passedAttempts = data.filter(attempt => attempt.passed).length;
      const averageScore = totalAttempts > 0 
        ? Math.round(data.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
        : 0;

      return {
        data: {
          totalAttempts,
          passedAttempts,
          passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
          averageScore,
          attempts: data
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching quiz analytics:', error);
      return { data: null, error };
    }
  }
};

export default quizService;
