// Course service with correct database schema integration
import { supabase } from '../../../lib/supabase';

export const courseService = {
  // Get all courses with filtering - matches actual schema
  async getCourses(options = {}) {
    try {
      let query = supabase
        .from('courses')
        .select(`
          id,
          title,
          slug,
          subtitle,
          description,
          thumbnail,
          price_cents,
          is_free,
          is_featured,
          is_published,
          instructor_id,
          category_id,
          lessons_count,
          modules_count,
          estimated_duration,
          difficulty_level,
          includes_certificate,
          rating,
          enrolled_count,
          created_at,
          categories:category_id(name, slug),
          instructor:instructor_id(full_name)
        `)
        .eq('is_published', true);

      // Apply filters
      if (options.featured) {
        query = query.eq('is_featured', true);
      }

      if (options.free) {
        query = query.eq('is_free', true);
      }

      if (options.category) {
        query = query.eq('category_id', options.category);
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      if (options.instructor) {
        query = query.eq('instructor_id', options.instructor);
      }

      // Apply sorting
      if (options.sortBy) {
        switch (options.sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          case 'enrolled':
            query = query.order('enrolled_count', { ascending: false });
            break;
          default:
            query = query.order('is_featured', { ascending: false })
                        .order('created_at', { ascending: false });
        }
      } else {
        query = query.order('is_featured', { ascending: false })
                    .order('created_at', { ascending: false });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match UI expectations
      return data.map(course => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        thumbnail: course.thumbnail,
        priceCents: course.price_cents,
        isFree: course.is_free,
        isFeatured: course.is_featured,
        instructorName: course.instructor?.full_name || 'Course Instructor',
        lessonsCount: course.lessons_count || 0,
        modulesCount: course.modules_count || 0,
        estimatedDuration: course.estimated_duration,
        difficultyLevel: course.difficulty_level,
        includesCertificate: course.includes_certificate,
        rating: course.rating || 4.5,
        enrolledCount: course.enrolled_count || 0,
        categoryName: course.categories?.name,
        categorySlug: course.categories?.slug,
        createdAt: course.created_at
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  // Get course by slug with full details including modules
  async getCourseBySlug(slug) {
    try {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          categories:category_id(name, slug),
          instructor:instructor_id(full_name, bio, avatar_url),
          modules:modules(
            id,
            title,
            description,
            module_order,
            estimated_time,
            pass_marks,
            is_required,
            lessons:lessons(
              id,
              title,
              slug,
              description,
              lesson_order,
              duration,
              video_url,
              video_type,
              is_free_preview
            ),
            quiz:quizzes(
              id,
              title,
              description,
              pass_marks,
              time_limit,
              is_required,
              max_attempts,
              questions:quiz_questions(
                id,
                question,
                question_type,
                question_order,
                explanation,
                options:quiz_options(
                  id,
                  option_text,
                  option_order,
                  is_correct
                )
              )
            ),
            assignment:assignments(
              id,
              title,
              description,
              requirements,
              submission_type,
              allowed_file_types,
              max_file_size,
              pass_marks,
              is_required,
              due_date,
              rubric:assignment_rubric(
                id,
                criteria,
                description,
                points,
                rubric_order
              )
            )
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (courseError) throw courseError;

      // Transform the data to match the expected format
      const transformedCourse = {
        id: course.id,
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        thumbnail: course.thumbnail,
        priceCents: course.price_cents,
        isFree: course.is_free,
        isFeatured: course.is_featured,
        instructorName: course.instructor?.full_name || 'Course Instructor',
        instructorBio: course.instructor?.bio,
        instructorAvatar: course.instructor?.avatar_url,
        lessonsCount: course.lessons_count || 0,
        modulesCount: course.modules_count || 0,
        estimatedDuration: course.estimated_duration,
        difficultyLevel: course.difficulty_level,
        includesCertificate: course.includes_certificate,
        rating: course.rating || 4.5,
        enrolledCount: course.enrolled_count || 0,
        categoryName: course.categories?.name,
        categorySlug: course.categories?.slug,
        createdAt: course.created_at,
        curriculum: course.modules?.sort((a, b) => a.module_order - b.module_order).map(module => ({
          moduleId: module.id,
          title: module.title,
          description: module.description,
          moduleOrder: module.module_order,
          estimatedTime: module.estimated_time,
          passMarks: module.pass_marks,
          isRequired: module.is_required,
          lessons: module.lessons?.sort((a, b) => a.lesson_order - b.lesson_order).map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            duration: lesson.duration,
            videoUrl: lesson.video_url,
            videoType: lesson.video_type,
            isFreePreview: lesson.is_free_preview
          })) || [],
          quiz: module.quiz?.[0] ? {
            id: module.quiz[0].id,
            title: module.quiz[0].title,
            description: module.quiz[0].description,
            passMarks: module.quiz[0].pass_marks,
            timeLimit: module.quiz[0].time_limit,
            isRequired: module.quiz[0].is_required,
            maxAttempts: module.quiz[0].max_attempts,
            questions: module.quiz[0].questions?.sort((a, b) => a.question_order - b.question_order).map(question => ({
              id: question.id,
              question: question.question,
              type: question.question_type,
              explanation: question.explanation,
              options: question.options?.sort((a, b) => a.option_order - b.option_order).map(option => ({
                id: option.id,
                text: option.option_text,
                isCorrect: option.is_correct
              })) || []
            })) || []
          } : null,
          assignment: module.assignment?.[0] ? {
            id: module.assignment[0].id,
            title: module.assignment[0].title,
            description: module.assignment[0].description,
            requirements: module.assignment[0].requirements,
            submissionType: module.assignment[0].submission_type,
            allowedFileTypes: module.assignment[0].allowed_file_types,
            maxFileSize: module.assignment[0].max_file_size,
            passMarks: module.assignment[0].pass_marks,
            isRequired: module.assignment[0].is_required,
            dueDate: module.assignment[0].due_date,
            rubric: module.assignment[0].rubric?.sort((a, b) => a.rubric_order - b.rubric_order).map(item => ({
              id: item.id,
              criteria: item.criteria,
              description: item.description,
              points: item.points
            })) || []
          } : null
        })) || []
      };

      return transformedCourse;
    } catch (error) {
      console.error('Error fetching course by slug:', error);
      return null;
    }
  },

  // Get categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: [], error };
    }
  },

  // Check if user is enrolled in course
  async checkEnrollment(courseId, userId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  },

  // Enroll student in course
  async enrollInCourse(courseId, userId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          course_id: courseId,
          student_id: userId
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return { data: null, error };
    }
  },

  // Get user's enrolled courses
  async getEnrolledCourses(userId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:course_id(
            id,
            title,
            slug,
            description,
            thumbnail,
            instructor_id,
            price_cents,
            is_free,
            instructor:instructor_id(full_name)
          )
        `)
        .eq('student_id', userId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      return data.map(enrollment => ({
        id: enrollment.course.id,
        slug: enrollment.course.slug,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnail: enrollment.course.thumbnail,
        instructorName: enrollment.course.instructor?.full_name || 'Instructor',
        progress: enrollment.progress_percentage || 0,
        enrolledAt: enrollment.enrolled_at,
        completedAt: enrollment.completed_at,
        certificateIssued: enrollment.certificate_issued,
        priceCents: enrollment.course.price_cents,
        isFree: enrollment.course.is_free
      }));
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      return [];
    }
  },

  // Get user certificates
  async getUserCertificates(userId) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:course_id(
            title,
            instructor:instructor_id(full_name)
          )
        `)
        .eq('student_id', userId)
        .order('issued_at', { ascending: false });

      if (error) throw error;

      return data.map(cert => ({
        id: cert.id,
        courseTitle: cert.course.title,
        instructorName: cert.course.instructor?.full_name || 'Instructor',
        issuedAt: cert.issued_at,
        certificateUrl: cert.certificate_url,
        verificationCode: cert.verification_code,
        finalGrade: cert.final_grade
      }));
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  },

  // Get user orders
  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            quantity,
            price_cents,
            title,
            item_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        items: order.items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price_cents,
          type: item.item_type
        }))
      }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  // Get admin dashboard statistics
  async getAdminDashboardStats() {
    try {
      // Get total students count
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // Get total revenue from completed orders
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Get pending orders count
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        data: {
          totalStudents: totalStudents || 0,
          totalRevenue: totalRevenue,
          pendingOrders: pendingOrders || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      return { 
        data: {
          totalStudents: 0,
          totalRevenue: 0,
          pendingOrders: 0
        }, 
        error 
      };
    }
  }
};

export default courseService;
