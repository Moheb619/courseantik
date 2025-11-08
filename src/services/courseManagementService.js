import { supabase } from '../lib/supabase';

// Debug function to log database connection status
const debugConnection = () => {
  console.log('🔍 Course Management Service: Testing database connection...');
  console.log('📊 Supabase URL:', supabase.supabaseUrl);
  console.log('🔑 Supabase Key:', supabase.supabaseKey ? 'Present' : 'Missing');
};

// Course Management Service
export const courseManagementService = {
  // Get all courses with filters and pagination
  getCourses: async (filters = {}) => {
    debugConnection(); // Debug database connection
    
    const {
      search = '',
      category = '',
      status = '',
      instructor = '',
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name, avatar_url),
          category:categories!category_id(name, slug)
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%, subtitle.ilike.%${search}%, description.ilike.%${search}%`);
      }

      if (category) {
        query = query.eq('category_id', category);
      }

      if (status) {
        if (status === 'published') {
          query = query.eq('is_published', true);
        } else if (status === 'draft') {
          query = query.eq('is_published', false);
        } else if (status === 'featured') {
          query = query.eq('is_featured', true);
        }
      }

      if (instructor) {
        query = query.eq('instructor_id', instructor);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;

      return {
        courses: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to basic course data without relationships
      const { data, error: fallbackError, count } = await supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1);
      
      if (fallbackError) throw fallbackError;

      return {
        courses: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    }
  },

  // Get single course with full details
  getCourse: async (id) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name, avatar_url, bio),
          category:categories!category_id(name, slug, description)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      // Fallback to basic course data without relationships
      const { data, error: fallbackError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fallbackError) throw fallbackError;
      return data;
    }
  },

  // Get course modules separately
  getCourseModules: async (courseId) => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('module_order');

    if (error) throw error;
    return data;
  },

  // Get full course with structure for editing
  getCourseForEdit: async (courseId) => {
    try {
      // Get basic course data
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Get modules with lessons, quizzes, and assignments
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          lessons:lessons(*),
          quiz:quizzes(
            *,
            questions:quiz_questions(
              *,
              options:quiz_options(*)
            )
          ),
          assignment:assignments(
            *,
            rubric:assignment_rubric(*)
          )
        `)
        .eq('course_id', courseId)
        .order('module_order');

      if (modulesError) throw modulesError;

      // Transform to match form structure
      const transformedModules = modules?.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        module_order: module.module_order,
        estimated_time: module.estimated_time,
        pass_marks: module.pass_marks,
        is_required: module.is_required,
        lessons: module.lessons?.sort((a, b) => a.lesson_order - b.lesson_order) || [],
        quiz: module.quiz?.[0] || null,
        assignment: module.assignment?.[0] || null,
      })) || [];

      return {
        ...course,
        modules: transformedModules,
      };
    } catch (error) {
      console.error('Error fetching course for edit:', error);
      throw error;
    }
  },

  // Get module lessons separately
  getModuleLessons: async (moduleId) => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('lesson_order');

    if (error) throw error;
    return data;
  },

  // Create new course
  createCourse: async (courseData) => {
    const {
      title,
      subtitle,
      description,
      thumbnail,
      price_cents,
      is_free,
      is_featured,
      is_published,
      instructor_id,
      category_id,
      estimated_duration,
      difficulty_level,
      includes_certificate
    } = courseData;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title,
        slug,
        subtitle,
        description,
        thumbnail,
        price_cents: is_free ? 0 : price_cents,
        is_free,
        is_featured,
        is_published,
        instructor_id,
        category_id,
        estimated_duration,
        difficulty_level,
        includes_certificate
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const {
      title,
      subtitle,
      description,
      thumbnail,
      price_cents,
      is_free,
      is_featured,
      is_published,
      instructor_id,
      category_id,
      estimated_duration,
      difficulty_level,
      includes_certificate
    } = courseData;

    // Generate new slug if title changed
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('courses')
      .update({
        title,
        slug,
        subtitle,
        description,
        thumbnail,
        price_cents: is_free ? 0 : price_cents,
        is_free,
        is_featured,
        is_published,
        instructor_id,
        category_id,
        estimated_duration,
        difficulty_level,
        includes_certificate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete course
  deleteCourse: async (id) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Toggle course status
  toggleCourseStatus: async (id, field, value) => {
    const { data, error } = await supabase
      .from('courses')
      .update({
        [field]: value,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Bulk operations
  bulkUpdateCourses: async (ids, updates) => {
    const { data, error } = await supabase
      .from('courses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select();

    if (error) throw error;
    return data;
  },

  bulkDeleteCourses: async (ids) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return true;
  },

  // Get course statistics
  getCourseStats: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        is_published,
        is_featured,
        is_free,
        difficulty_level,
        enrolled_count,
        rating
      `);

    if (error) throw error;

    const stats = {
      total: data.length,
      published: data.filter(c => c.is_published).length,
      draft: data.filter(c => !c.is_published).length,
      featured: data.filter(c => c.is_featured).length,
      free: data.filter(c => c.is_free).length,
      paid: data.filter(c => !c.is_free).length,
      byDifficulty: {
        beginner: data.filter(c => c.difficulty_level === 'beginner').length,
        intermediate: data.filter(c => c.difficulty_level === 'intermediate').length,
        advanced: data.filter(c => c.difficulty_level === 'advanced').length
      },
      totalEnrollments: data.reduce((sum, c) => sum + (c.enrolled_count || 0), 0),
      averageRating: data.length > 0 ? 
        data.reduce((sum, c) => sum + (c.rating || 0), 0) / data.length : 0
    };

    return stats;
  },

  // Enhanced course creation with full structure
  createCourseWithStructure: async (courseData) => {
    const { modules = [], ...basicCourseData } = courseData;
    
    try {
      // Create the basic course first
      const course = await courseManagementService.createCourse(basicCourseData);
      
      // Create modules with their nested content
      if (modules.length > 0) {
        for (const moduleData of modules) {
          const { lessons = [], quiz = null, assignment = null, ...moduleInfo } = moduleData;
          
          // Create module
          const module = await courseManagementService.createModule(course.id, moduleInfo);
          
          // Create lessons
          if (lessons.length > 0) {
            for (const lessonData of lessons) {
              await courseManagementService.createLesson(module.id, lessonData);
            }
          }
          
          // Create quiz if provided
          if (quiz) {
            await courseManagementService.createQuiz(module.id, quiz);
          }
          
          // Create assignment if provided
          if (assignment) {
            await courseManagementService.createAssignment(module.id, assignment);
          }
        }
        
        // Update course counts
        await courseManagementService.updateCourseCounts(course.id);
      }
      
      return course;
    } catch (error) {
      console.error('Error creating course with structure:', error);
      throw error;
    }
  },

  // Update course with full structure
  updateCourseWithStructure: async (courseId, courseData) => {
    const { modules = [], ...basicCourseData } = courseData;
    
    try {
      // Update basic course info
      const course = await courseManagementService.updateCourse(courseId, basicCourseData);
      
      // Handle modules update
      if (modules.length > 0) {
        // Get existing modules
        const existingModules = await courseManagementService.getCourseModules(courseId);
        
        // Delete modules not in the new data
        const moduleIdsToKeep = modules.filter(m => m.id).map(m => m.id);
        const modulesToDelete = existingModules.filter(m => !moduleIdsToKeep.includes(m.id));
        
        for (const module of modulesToDelete) {
          await courseManagementService.deleteModule(module.id);
        }
        
        // Update or create modules
        for (const moduleData of modules) {
          const { lessons = [], quiz = null, assignment = null, ...moduleInfo } = moduleData;
          
          let module;
          if (moduleData.id) {
            // Update existing module
            module = await courseManagementService.updateModule(moduleData.id, moduleInfo);
          } else {
            // Create new module
            module = await courseManagementService.createModule(courseId, moduleInfo);
          }
          
          // Handle lessons
          await courseManagementService.updateModuleLessons(module.id, lessons);
          
          // Handle quiz
          if (quiz) {
            if (quiz.id) {
              await courseManagementService.updateQuiz(quiz.id, quiz);
            } else {
              await courseManagementService.createQuiz(module.id, quiz);
            }
          }
          
          // Handle assignment
          if (assignment) {
            if (assignment.id) {
              await courseManagementService.updateAssignment(assignment.id, assignment);
            } else {
              await courseManagementService.createAssignment(module.id, assignment);
            }
          }
        }
        
        // Update course counts
        await courseManagementService.updateCourseCounts(courseId);
      }
      
      return course;
    } catch (error) {
      console.error('Error updating course with structure:', error);
      throw error;
    }
  },

  // Update course counts (modules, lessons, etc.)
  updateCourseCounts: async (courseId) => {
    try {
      // Get module count
      const { count: modulesCount } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);
      
      // Get lesson count
      const { count: lessonsCount } = await supabase
        .from('lessons')
        .select(`
          *,
          modules!inner(course_id)
        `, { count: 'exact', head: true })
        .eq('modules.course_id', courseId);
      
      // Update course
      await supabase
        .from('courses')
        .update({
          modules_count: modulesCount || 0,
          lessons_count: lessonsCount || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId);
        
    } catch (error) {
      console.error('Error updating course counts:', error);
    }
  },

  // Module Management
  createModule: async (courseId, moduleData) => {
    const { data, error } = await supabase
      .from('modules')
      .insert({
        course_id: courseId,
        ...moduleData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateModule: async (id, moduleData) => {
    const { data, error } = await supabase
      .from('modules')
      .update({
        ...moduleData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteModule: async (id) => {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Lesson Management
  createLesson: async (moduleId, lessonData) => {
    // Generate slug if not provided
    const slug = lessonData.slug || lessonData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        module_id: moduleId,
        slug,
        ...lessonData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateLesson: async (id, lessonData) => {
    const { data, error } = await supabase
      .from('lessons')
      .update({
        ...lessonData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteLesson: async (id) => {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  updateModuleLessons: async (moduleId, lessons) => {
    try {
      // Get existing lessons
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_id', moduleId);
      
      const existingIds = existingLessons?.map(l => l.id) || [];
      const lessonIdsToKeep = lessons.filter(l => l.id).map(l => l.id);
      const lessonsToDelete = existingIds.filter(id => !lessonIdsToKeep.includes(id));
      
      // Delete removed lessons
      if (lessonsToDelete.length > 0) {
        await supabase
          .from('lessons')
          .delete()
          .in('id', lessonsToDelete);
      }
      
      // Update or create lessons
      for (const lesson of lessons) {
        if (lesson.id) {
          await courseManagementService.updateLesson(lesson.id, lesson);
        } else {
          await courseManagementService.createLesson(moduleId, lesson);
        }
      }
    } catch (error) {
      console.error('Error updating module lessons:', error);
      throw error;
    }
  },

  // Quiz Management
  createQuiz: async (moduleId, quizData) => {
    const { questions = [], ...basicQuizData } = quizData;
    
    try {
      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          module_id: moduleId,
          ...basicQuizData
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions
      if (questions.length > 0) {
        for (const questionData of questions) {
          const { options = [], ...basicQuestionData } = questionData;
          
          // Create question
          const { data: question, error: questionError } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quiz.id,
              ...basicQuestionData
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Create options
          if (options.length > 0) {
            const optionsData = options.map(option => ({
              question_id: question.id,
              ...option
            }));

            const { error: optionsError } = await supabase
              .from('quiz_options')
              .insert(optionsData);

            if (optionsError) throw optionsError;
          }
        }
      }

      return quiz;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  updateQuiz: async (id, quizData) => {
    const { questions = [], ...basicQuizData } = quizData;
    
    try {
      // Update quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .update({
          ...basicQuizData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (quizError) throw quizError;

      // Handle questions update
      if (questions.length > 0) {
        // Get existing questions
        const { data: existingQuestions } = await supabase
          .from('quiz_questions')
          .select('id')
          .eq('quiz_id', id);
        
        const existingIds = existingQuestions?.map(q => q.id) || [];
        const questionIdsToKeep = questions.filter(q => q.id).map(q => q.id);
        const questionsToDelete = existingIds.filter(id => !questionIdsToKeep.includes(id));
        
        // Delete removed questions
        if (questionsToDelete.length > 0) {
          await supabase
            .from('quiz_questions')
            .delete()
            .in('id', questionsToDelete);
        }
        
        // Update or create questions
        for (const questionData of questions) {
          const { options = [], ...basicQuestionData } = questionData;
          
          let question;
          if (questionData.id) {
            // Update existing question
            const { data, error } = await supabase
              .from('quiz_questions')
              .update(basicQuestionData)
              .eq('id', questionData.id)
              .select()
              .single();
            
            if (error) throw error;
            question = data;
          } else {
            // Create new question
            const { data, error } = await supabase
              .from('quiz_questions')
              .insert({
                quiz_id: id,
                ...basicQuestionData
              })
              .select()
              .single();
            
            if (error) throw error;
            question = data;
          }
          
          // Handle options
          if (options.length > 0) {
            // Delete existing options
            await supabase
              .from('quiz_options')
              .delete()
              .eq('question_id', question.id);
            
            // Insert new options
            const optionsData = options.map(option => ({
              question_id: question.id,
              ...option
            }));

            const { error: optionsError } = await supabase
              .from('quiz_options')
              .insert(optionsData);

            if (optionsError) throw optionsError;
          }
        }
      }

      return quiz;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Assignment Management
  createAssignment: async (moduleId, assignmentData) => {
    const { rubric = [], ...basicAssignmentData } = assignmentData;
    
    try {
      // Create assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .insert({
          module_id: moduleId,
          ...basicAssignmentData
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create rubric
      if (rubric.length > 0) {
        const rubricData = rubric.map(item => ({
          assignment_id: assignment.id,
          ...item
        }));

        const { error: rubricError } = await supabase
          .from('assignment_rubric')
          .insert(rubricData);

        if (rubricError) throw rubricError;
      }

      return assignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  updateAssignment: async (id, assignmentData) => {
    const { rubric = [], ...basicAssignmentData } = assignmentData;
    
    try {
      // Update assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .update({
          ...basicAssignmentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Update rubric
      if (rubric.length > 0) {
        // Delete existing rubric
        await supabase
          .from('assignment_rubric')
          .delete()
          .eq('assignment_id', id);
        
        // Insert new rubric
        const rubricData = rubric.map(item => ({
          assignment_id: id,
          ...item
        }));

        const { error: rubricError } = await supabase
          .from('assignment_rubric')
          .insert(rubricData);

        if (rubricError) throw rubricError;
      }

      return assignment;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }
};

// Category Management Service
export const categoryManagementService = {
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  },

  createCategory: async (categoryData) => {
    const { name, description, image_url } = categoryData;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description,
        image_url
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Instructor Management Service
export const instructorManagementService = {
  // Simple method that returns just the instructors array (for dropdowns)
  getInstructors: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          expertise,
          hourly_rate
        `)
        .eq('role', 'instructor')
        .eq('is_active', true)
        .order('full_name');

      if (error) {
        console.error('Error fetching instructors:', error);
        throw error;
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error in getInstructors:', error);
      return [];
    }
  },

  // Detailed method with pagination for admin management
  getInstructorsWithPagination: async (filters = {}) => {
    const {
      search = '',
      status = '',
      expertise = '',
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          courses_count:courses(count)
        `)
        .eq('role', 'instructor')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply filters
      if (search) {
        query = query.or(`full_name.ilike.%${search}%, bio.ilike.%${search}%`);
      }

      if (status === 'active') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      }

      if (expertise) {
        query = query.ilike('expertise', `%${expertise}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;

      // Process the data to include courses count
      const processedData = data?.map(instructor => ({
        ...instructor,
        courses_count: instructor.courses_count?.[0]?.count || 0
      })) || [];

      return {
        instructors: processedData,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching instructors:', error);
      // Fallback to basic instructor data
      const { data, error: fallbackError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'instructor')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1);
      
      if (fallbackError) throw fallbackError;

      return {
        instructors: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    }
  },

  createInstructor: async (instructorData) => {
    const {
      full_name,
      email,
      bio,
      avatar_url,
      expertise,
      hourly_rate,
      is_active = true
    } = instructorData;

    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'temp_password_123!', // This should be changed by the user
      email_confirm: true
    });

    if (authError) throw authError;

    // Create the profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name,
        bio,
        avatar_url,
        role: 'instructor',
        expertise,
        hourly_rate,
        is_active
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateInstructor: async (id, instructorData) => {
    const {
      full_name,
      bio,
      avatar_url,
      expertise,
      hourly_rate,
      is_active
    } = instructorData;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        bio,
        avatar_url,
        expertise,
        hourly_rate,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteInstructor: async (id) => {
    // First delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw authError;

    // Then delete the profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  toggleInstructorStatus: async (id, is_active) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getInstructorStats: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        is_active,
        hourly_rate,
        courses:courses(count)
      `)
      .eq('role', 'instructor');

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(i => i.is_active !== false).length,
      inactive: data.filter(i => i.is_active === false).length,
      totalCourses: data.reduce((sum, i) => sum + (i.courses?.[0]?.count || 0), 0),
      averageHourlyRate: data.length > 0 ? 
        Math.round(data.reduce((sum, i) => sum + (i.hourly_rate || 0), 0) / data.length) : 0
    };

    return stats;
  }
};
