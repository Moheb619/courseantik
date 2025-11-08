/**
 * Module Progression Service
 * Handles the logic for module completion requirements and progression gating
 * Now integrated with Supabase database
 */

import { supabase } from '../lib/supabase';

class ModuleProgressionService {
  
  /**
   * Check if a module is unlocked for a student
   * @param {string} courseId 
   * @param {string} moduleId 
   * @param {string} studentId 
   * @returns {Promise<boolean>}
   */
  async isModuleUnlocked(courseId, moduleId, studentId) {
    try {
      // Get module prerequisites
      const { data: prerequisites } = await supabase
        .from('module_prerequisites')
        .select('prerequisite_module_id')
        .eq('module_id', moduleId);

      // If no prerequisites, module is unlocked
      if (!prerequisites || prerequisites.length === 0) {
        return true;
      }

      // Check if all prerequisite modules are completed
      const prereqModuleIds = prerequisites.map(p => p.prerequisite_module_id);
      
      const { data: completions } = await supabase
        .from('module_completions')
        .select('module_id')
        .eq('student_id', studentId)
        .in('module_id', prereqModuleIds)
        .not('completed_at', 'is', null);

      // All prerequisites must be completed
      return completions && completions.length === prereqModuleIds.length;
    } catch (error) {
      console.error('Error checking module unlock status:', error);
      return false;
    }
  }

  /**
   * Check if a module is completed for a student
   * @param {string} courseId 
   * @param {string} moduleId 
   * @param {string} studentId 
   * @returns {Promise<boolean>}
   */
  async isModuleCompleted(courseId, moduleId, studentId) {
    try {
      const { data: completion } = await supabase
        .from('module_completions')
        .select('completed_at, quiz_passed, assignment_passed, all_lessons_completed')
        .eq('module_id', moduleId)
        .eq('student_id', studentId)
        .single();

      // Module is completed if all requirements are met and completed_at is set
      return completion && 
             completion.completed_at && 
             completion.quiz_passed && 
             completion.assignment_passed && 
             completion.all_lessons_completed;
    } catch (error) {
      console.error('Error checking module completion:', error);
      return false;
    }
  }

  /**
   * Get module completion status with detailed breakdown
   * @param {string} courseId 
   * @param {string} moduleId 
   * @param {string} studentId 
   * @returns {Promise<Object>}
   */
  async getModuleCompletionStatus(courseId, moduleId, studentId) {
    try {
      // Get module info and requirements
      const { data: module } = await supabase
        .from('modules')
        .select(`
          *,
          quizzes (*),
          assignments (*),
          lessons (id)
        `)
        .eq('id', moduleId)
        .single();

      if (!module) {
        return {
          isCompleted: false,
          isUnlocked: false,
          requirements: null,
          progress: null
        };
      }

      // Check if module is unlocked
      const isUnlocked = await this.isModuleUnlocked(courseId, moduleId, studentId);

      // Get completion status
      const { data: completion } = await supabase
        .from('module_completions')
        .select('*')
        .eq('module_id', moduleId)
        .eq('student_id', studentId)
        .single();

      // Get lesson completions
      const { data: lessonCompletions } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('student_id', studentId)
        .in('lesson_id', module.lessons.map(l => l.id));

      // Get quiz attempts
      let quizStatus = { required: false, completed: false, passed: false, bestScore: 0, attempts: [] };
      if (module.quizzes.length > 0 && module.quizzes[0].is_required) {
        const { data: quizAttempts } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', module.quizzes[0].id)
          .eq('student_id', studentId)
          .order('completed_at', { ascending: false });

        const bestScore = quizAttempts && quizAttempts.length > 0 
          ? Math.max(...quizAttempts.map(a => a.score))
          : 0;

        quizStatus = {
          required: true,
          completed: quizAttempts && quizAttempts.length > 0,
          passed: quizAttempts && quizAttempts.some(attempt => attempt.passed),
          bestScore,
          attempts: quizAttempts || [],
          passMarkRequired: module.quizzes[0].pass_marks
        };
      }

      // Get assignment submissions
      let assignmentStatus = { required: false, submitted: false, passed: false, bestScore: 0, submissions: [] };
      if (module.assignments.length > 0 && module.assignments[0].is_required) {
        const { data: submissions } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', module.assignments[0].id)
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false });

        const bestScore = submissions && submissions.length > 0
          ? Math.max(...submissions.filter(s => s.score !== null).map(s => s.score))
          : 0;

        assignmentStatus = {
          required: true,
          submitted: submissions && submissions.length > 0,
          passed: submissions && submissions.some(sub => sub.passed),
          bestScore,
          submissions: submissions || [],
          passMarkRequired: module.assignments[0].pass_marks
        };
      }

      const isCompleted = completion && completion.completed_at !== null;

      return {
        isCompleted,
        isUnlocked,
        requirements: {
          quizRequired: module.quizzes.length > 0 && module.quizzes[0].is_required,
          assignmentRequired: module.assignments.length > 0 && module.assignments[0].is_required,
          lessonsRequired: module.lessons.map(l => l.id)
        },
        progress: {
          lessons: {
            required: module.lessons.length,
            completed: lessonCompletions ? lessonCompletions.length : 0,
            isComplete: lessonCompletions && lessonCompletions.length === module.lessons.length
          },
          quiz: quizStatus,
          assignment: assignmentStatus
        }
      };
    } catch (error) {
      console.error('Error getting module completion status:', error);
      return {
        isCompleted: false,
        isUnlocked: false,
        requirements: null,
        progress: null
      };
    }
  }

  /**
   * Get all modules status for a course
   * @param {string} courseId 
   * @param {string} studentId 
   * @returns {Promise<Object>}
   */
  async getCourseProgress(courseId, studentId) {
    try {
      // Get all modules for the course
      const { data: modules } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId)
        .order('module_order');

      if (!modules) return { modules: {}, overall: { totalModules: 0, completedModules: 0, unlockedModules: 0, completionPercentage: 0 } };

      const moduleStatuses = {};

      // Get status for each module
      for (const module of modules) {
        moduleStatuses[module.id] = await this.getModuleCompletionStatus(courseId, module.id, studentId);
      }

      // Calculate overall course progress
      const totalModules = modules.length;
      const completedModules = Object.values(moduleStatuses).filter(status => status.isCompleted).length;
      const unlockedModules = Object.values(moduleStatuses).filter(status => status.isUnlocked).length;

      return {
        modules: moduleStatuses,
        overall: {
          totalModules,
          completedModules,
          unlockedModules,
          completionPercentage: Math.round((completedModules / totalModules) * 100)
        }
      };
    } catch (error) {
      console.error('Error getting course progress:', error);
      return { 
        modules: {}, 
        overall: { totalModules: 0, completedModules: 0, unlockedModules: 0, completionPercentage: 0 } 
      };
    }
  }

  /**
   * Update student progress after quiz completion
   * @param {string} courseId 
   * @param {string} moduleId 
   * @param {Object} quizResult 
   * @param {string} studentId 
   * @returns {Promise<Object>}
   */
  async updateQuizProgress(courseId, moduleId, quizResult, studentId) {
    try {
      // The quiz attempt is already inserted by quizService
      // We just need to return the updated module status
      // The database triggers will handle module completion checking
      
      return await this.getModuleCompletionStatus(courseId, moduleId, studentId);
    } catch (error) {
      console.error('Error updating quiz progress:', error);
      return null;
    }
  }

  /**
   * Update student progress after assignment submission
   * @param {string} courseId 
   * @param {string} moduleId 
   * @param {Object} submissionResult 
   * @param {string} studentId 
   * @returns {Promise<Object>}
   */
  async updateAssignmentProgress(courseId, moduleId, submissionResult, studentId) {
    try {
      // The assignment submission is already inserted by assignmentService
      // We just need to return the updated module status
      // The database triggers will handle module completion checking
      
      return await this.getModuleCompletionStatus(courseId, moduleId, studentId);
    } catch (error) {
      console.error('Error updating assignment progress:', error);
      return null;
    }
  }

  /**
   * Update student progress after lesson completion
   * @param {string} courseId 
   * @param {string} moduleId 
   * @param {string} lessonId 
   * @param {string} studentId 
   * @returns {Promise<Object>}
   */
  async updateLessonProgress(courseId, moduleId, lessonId, studentId) {
    try {
      // Insert lesson completion
      const { error } = await supabase
        .from('lesson_completions')
        .upsert([{
          lesson_id: lessonId,
          student_id: studentId
        }], {
          onConflict: 'lesson_id,student_id'
        });

      if (error) throw error;

      // Return updated module status
      // The database triggers will handle module completion checking
      return await this.getModuleCompletionStatus(courseId, moduleId, studentId);
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return null;
    }
  }

  /**
   * Get next available module for student
   * @param {string} courseId 
   * @param {string} studentId 
   * @returns {Promise<string|null>}
   */
  async getNextAvailableModule(courseId, studentId) {
    try {
      const courseProgress = await this.getCourseProgress(courseId, studentId);
      
      // Find the first unlocked but not completed module
      const moduleIds = Object.keys(courseProgress.modules);
      
      for (const moduleId of moduleIds) {
        const moduleStatus = courseProgress.modules[moduleId];
        if (moduleStatus.isUnlocked && !moduleStatus.isCompleted) {
          return moduleId;
        }
      }

      // If all modules are completed, return null
      return null;
    } catch (error) {
      console.error('Error getting next available module:', error);
      return null;
    }
  }

  /**
   * Check if student can proceed to next module
   * @param {string} courseId 
   * @param {string} currentModuleId 
   * @param {string} studentId 
   * @returns {Promise<Object>}
   */
  async canProceedToNextModule(courseId, currentModuleId, studentId) {
    try {
      const currentStatus = await this.getModuleCompletionStatus(courseId, currentModuleId, studentId);
      
      if (!currentStatus.isCompleted) {
        const missingRequirements = [];
        
        if (currentStatus.progress.lessons && !currentStatus.progress.lessons.isComplete) {
          missingRequirements.push({
            type: 'lessons',
            message: `Complete ${currentStatus.progress.lessons.required - currentStatus.progress.lessons.completed} more lessons`
          });
        }
        
        if (currentStatus.progress.quiz.required && !currentStatus.progress.quiz.passed) {
          missingRequirements.push({
            type: 'quiz',
            message: `Pass the quiz with ${currentStatus.progress.quiz.passMarkRequired}% or higher`
          });
        }
        
        if (currentStatus.progress.assignment.required && !currentStatus.progress.assignment.passed) {
          missingRequirements.push({
            type: 'assignment',
            message: `Submit and pass the assignment with ${currentStatus.progress.assignment.passMarkRequired}% or higher`
          });
        }

        return {
          canProceed: false,
          missingRequirements
        };
      }

      return {
        canProceed: true,
        missingRequirements: []
      };
    } catch (error) {
      console.error('Error checking module progression:', error);
      return {
        canProceed: false,
        missingRequirements: [{ type: 'error', message: 'Unable to check requirements' }]
      };
    }
  }

}

// Export singleton instance
export default new ModuleProgressionService();
