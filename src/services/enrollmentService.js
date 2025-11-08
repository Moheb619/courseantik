import { supabase } from '../lib/supabase';
import { teacherEarningsService } from './teacherEarningsService';
import { notificationService } from './notificationService';

export const enrollmentService = {
  // Process course enrollment with payment and revenue calculation
  async processCourseEnrollment(courseId, userId, orderData = null) {
    try {
      // Check if user is already enrolled
      const isEnrolled = await this.checkEnrollment(courseId, userId);
      if (isEnrolled) {
        throw new Error('User is already enrolled in this course');
      }

      // Get course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, title, price_cents, instructor_id')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      if (!course) throw new Error('Course not found');

      // If course is free, enroll directly
      if (course.price_cents === 0) {
        return await this.enrollInCourse(courseId, userId);
      }

      // If order data is provided, process paid enrollment
      if (orderData) {
        return await this.processPaidEnrollment(courseId, userId, orderData);
      }

      // For paid courses without order data, return course info for payment
      return {
        course,
        requiresPayment: true,
        price: course.price_cents
      };
    } catch (error) {
      console.error('Error processing course enrollment:', error);
      throw error;
    }
  },

  // Process paid enrollment with revenue calculation
  async processPaidEnrollment(courseId, userId, orderData) {
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'completed',
          subtotal: orderData.subtotal || 0,
          discount: orderData.discount || 0,
          grand_total: orderData.grand_total || 0,
          payment_status: 'paid'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item for the course
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          course_id: courseId,
          title: orderData.courseTitle || 'Course Enrollment',
          price_cents: orderData.coursePrice || 0,
          quantity: 1,
          item_type: 'course'
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Create payment record
      if (orderData.paymentData) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            order_id: order.id,
            provider: orderData.paymentData.provider || 'sslcommerz',
            transaction_id: orderData.paymentData.transaction_id,
            amount: order.grand_total,
            status: 'success'
          });

        if (paymentError) throw paymentError;
      }

      // Enroll user in course
      const enrollment = await this.enrollInCourse(courseId, userId);

      // Process teacher earnings
      await teacherEarningsService.processOrderEarnings(order.id);

      // Update course enrollment count
      await this.updateCourseEnrollmentCount(courseId);

      // Notify user about successful enrollment
      await notificationService.createNotification(
        userId,
        'enrollment_success',
        'Course Enrolled Successfully',
        `You have been successfully enrolled in the course.`,
        { url: `/course/${courseId}` }
      );

      return {
        enrollment,
        order,
        success: true
      };
    } catch (error) {
      console.error('Error processing paid enrollment:', error);
      throw error;
    }
  },

  // Check if user is enrolled in a course
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

  // Enroll user in course
  async enrollInCourse(courseId, userId) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        course_id: courseId,
        user_id: userId,
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update course enrollment count
  async updateCourseEnrollmentCount(courseId) {
    const { error } = await supabase.rpc('increment_course_enrollment', {
      course_id: courseId
    });

    if (error) {
      console.error('Error updating enrollment count:', error);
      // Don't throw error as this is not critical
    }
  },

  // Get user's enrolled courses
  async getEnrolledCourses(userId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          id,
          slug,
          title,
          thumbnail,
          price_cents,
          instructor:profiles(full_name)
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    return data.map(enrollment => ({
      id: enrollment.id,
      courseId: enrollment.course_id,
      enrolledAt: enrollment.enrolled_at,
      course: {
        id: enrollment.course.id,
        slug: enrollment.course.slug,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
        priceCents: enrollment.course.price_cents,
        instructorName: enrollment.course.instructor?.full_name
      }
    }));
  },

  // Get course enrollment statistics
  async getCourseEnrollmentStats(courseId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id, enrolled_at')
      .eq('course_id', courseId);

    if (error) throw error;

    const totalEnrollments = data.length;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthEnrollments = data.filter(
      enrollment => enrollment.enrolled_at.startsWith(thisMonth)
    ).length;

    return {
      totalEnrollments,
      thisMonthEnrollments,
      enrollments: data
    };
  },

  // Get teacher's course enrollment stats
  async getTeacherEnrollmentStats(teacherId) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        price_cents,
        enrolled_count,
        enrollments(id, enrolled_at)
      `)
      .eq('instructor_id', teacherId);

    if (error) throw error;

    return data.map(course => ({
      courseId: course.id,
      title: course.title,
      priceCents: course.price_cents,
      totalEnrollments: course.enrolled_count,
      recentEnrollments: course.enrollments.filter(
        enrollment => {
          const enrollmentDate = new Date(enrollment.enrolled_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return enrollmentDate >= thirtyDaysAgo;
        }
      ).length
    }));
  }
};

export default enrollmentService;
