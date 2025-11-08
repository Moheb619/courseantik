// Comprehensive database service that integrates all services
import { courseService } from '../features/courses/services/courseService';
import quizService from './quizService';
import assignmentService from './assignmentService';
import moduleProgressionService from './moduleProgressionService';
import { supabase } from '../lib/supabase';

export const databaseService = {
  // Course operations
  courses: courseService,
  
  // Quiz operations
  quizzes: quizService,
  
  // Assignment operations
  assignments: assignmentService,
  
  // Progress tracking
  progress: moduleProgressionService,

  // Shop/Product operations
  async getProducts(filters = {}) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name, slug)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters.featured) {
        query = query.eq('is_featured', true);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: null, error };
    }
  },

  async getProductBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name, slug),
          product_reviews(
            rating,
            comment,
            user:profiles(full_name, avatar_url),
            created_at
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { data: null, error };
    }
  },

  // Order operations
  async createOrder(userId, orderData) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          order_number: `ORD-${Date.now()}`,
          total_amount: orderData.totalAmount,
          status: 'pending',
          payment_status: 'pending',
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress
        }])
        .select()
        .single();

      if (error) throw error;

      // Insert order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: data.id,
          course_id: item.type === 'course' ? item.id : null,
          product_id: item.type === 'product' ? item.id : null,
          item_type: item.type,
          title: item.title,
          price_cents: item.price,
          quantity: item.quantity || 1,
          selected_options: item.selectedOptions
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating order:', error);
      return { data: null, error };
    }
  },

  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            course:courses(title, thumbnail),
            product:products(title, images)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return { data: null, error };
    }
  },

  // Notification operations
  async getUserNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      return { data, error };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error };
    }
  },

  async markNotificationAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error };
    }
  },

  async createNotification(userId, notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: notificationData.title,
          message: notificationData.message,
          notification_type: notificationData.type,
          action_url: notificationData.actionUrl,
          metadata: notificationData.metadata
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { data: null, error };
    }
  },

  // Certificate operations
  async getUserCertificates(userId) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses(title, thumbnail)
        `)
        .eq('student_id', userId)
        .eq('is_valid', true)
        .order('issued_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return { data: null, error };
    }
  },

  async verifyCertificate(certificateNumber) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses(title),
          student:profiles(full_name)
        `)
        .eq('certificate_number', certificateNumber)
        .eq('is_valid', true)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return { data: null, error };
    }
  },

  // Admin operations
  async getInstructorCourses(instructorId) {
    try {
      const { data, error } = await supabase
        .from('course_details')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      return { data: null, error };
    }
  },

  async getInstructorEarnings(instructorId) {
    try {
      const { data, error } = await supabase
        .from('teacher_earnings')
        .select(`
          *,
          course:courses(title),
          order:orders(order_number, created_at)
        `)
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching instructor earnings:', error);
      return { data: null, error };
    }
  },

  // File upload operations
  async uploadFile(bucket, path, file) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        data: {
          path: data.path,
          url: urlData.publicUrl
        },
        error: null
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { data: null, error };
    }
  }
};

export default databaseService;
