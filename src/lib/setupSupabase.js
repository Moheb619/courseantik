// Supabase setup and configuration utility
import { supabase, config } from './supabase';

export const setupSupabase = {
  // Initialize Supabase connection and verify setup
  async initialize() {
    try {
      console.log('🚀 Initializing Supabase connection...');
      
      // Check if Supabase is configured
      if (!config.isConfigured) {
        console.warn('⚠️ Supabase not configured. Using mock client.');
        return { success: false, error: 'Supabase credentials not provided' };
      }

      // Test database connection
      const connectionTest = await config.checkConnection();
      
      if (!connectionTest.connected) {
        console.error('❌ Database connection failed:', connectionTest.error);
        return { success: false, error: 'Database connection failed' };
      }

      console.log('✅ Supabase connection successful');
      
      // Check if required tables exist
      await this.verifyTables();
      
      // Check if storage buckets exist
      await this.verifyStorageBuckets();
      
      console.log('🎉 Supabase setup complete!');
      return { success: true, error: null };
      
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Verify required database tables exist
  async verifyTables() {
    const requiredTables = [
      'profiles',
      'courses',
      'modules',
      'lessons',
      'quizzes',
      'quiz_questions',
      'quiz_options',
      'quiz_attempts',
      'assignments',
      'assignment_rubric',
      'assignment_submissions',
      'enrollments',
      'module_completions',
      'lesson_completions'
    ];

    console.log('🔍 Verifying database tables...');
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.warn(`⚠️ Table '${table}' not accessible:`, error.message);
        } else {
          console.log(`✅ Table '${table}' verified`);
        }
      } catch (error) {
        console.warn(`⚠️ Table '${table}' check failed:`, error.message);
      }
    }
  },

  // Verify storage buckets exist
  async verifyStorageBuckets() {
    const requiredBuckets = [
      'assignment-files',
      'course-materials', 
      'profile-avatars'
    ];

    console.log('🗂️ Verifying storage buckets...');
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.warn('⚠️ Cannot access storage buckets:', error.message);
        return;
      }

      const existingBuckets = buckets.map(b => b.name);
      
      for (const bucket of requiredBuckets) {
        if (existingBuckets.includes(bucket)) {
          console.log(`✅ Storage bucket '${bucket}' verified`);
        } else {
          console.warn(`⚠️ Storage bucket '${bucket}' not found`);
          console.log(`📝 To create bucket '${bucket}': Go to Supabase Dashboard → Storage → Create Bucket`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Storage verification failed:', error.message);
    }
  },

  // Create storage buckets if they don't exist (admin function)
  async createStorageBuckets() {
    const buckets = [
      {
        name: 'assignment-files',
        options: {
          public: false,
          allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'],
          fileSizeLimit: 52428800 // 50MB
        }
      },
      {
        name: 'course-materials',
        options: {
          public: true,
          allowedMimeTypes: ['application/pdf', 'image/*', 'video/*', 'application/zip'],
          fileSizeLimit: 104857600 // 100MB
        }
      },
      {
        name: 'profile-avatars',
        options: {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 2097152 // 2MB
        }
      }
    ];

    console.log('📦 Creating storage buckets...');
    
    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage.createBucket(bucket.name, bucket.options);
        
        if (error && !error.message.includes('already exists')) {
          console.error(`❌ Failed to create bucket '${bucket.name}':`, error.message);
        } else {
          console.log(`✅ Bucket '${bucket.name}' ready`);
        }
      } catch (error) {
        console.error(`❌ Bucket creation error for '${bucket.name}':`, error.message);
      }
    }
  },

  // Set up real-time subscriptions for the app
  setupRealtimeSubscriptions(userId) {
    const subscriptions = [];

    // Subscribe to user notifications
    const notificationSub = supabase
      .channel(`notifications_${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('🔔 New notification:', payload.new);
          // Trigger notification in UI
          window.dispatchEvent(new CustomEvent('newNotification', { detail: payload.new }));
        }
      )
      .subscribe();

    subscriptions.push(notificationSub);

    // Subscribe to assignment grading updates
    const gradingSub = supabase
      .channel(`grading_${userId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'assignment_submissions',
          filter: `student_id=eq.${userId}`
        }, 
        (payload) => {
          if (payload.new.status === 'graded') {
            console.log('📝 Assignment graded:', payload.new);
            // Trigger UI update
            window.dispatchEvent(new CustomEvent('assignmentGraded', { detail: payload.new }));
          }
        }
      )
      .subscribe();

    subscriptions.push(gradingSub);

    return {
      unsubscribe: () => {
        subscriptions.forEach(sub => supabase.removeChannel(sub));
      }
    };
  },

  // Test all core functionality
  async runTests() {
    console.log('🧪 Running Supabase integration tests...');
    
    const tests = [
      {
        name: 'Database Connection',
        test: async () => {
          const result = await config.checkConnection();
          return result.connected;
        }
      },
      {
        name: 'Course Query',
        test: async () => {
          const { data, error } = await supabase.from('courses').select('id').limit(1);
          return !error;
        }
      },
      {
        name: 'Profile Query',
        test: async () => {
          const { data, error } = await supabase.from('profiles').select('id').limit(1);
          return !error;
        }
      },
      {
        name: 'Storage Access',
        test: async () => {
          const { data, error } = await supabase.storage.listBuckets();
          return !error;
        }
      }
    ];

    const results = {};
    
    for (const test of tests) {
      try {
        const passed = await test.test();
        results[test.name] = passed ? '✅ PASS' : '❌ FAIL';
      } catch (error) {
        results[test.name] = `❌ ERROR: ${error.message}`;
      }
    }

    console.table(results);
    return results;
  }
};

export default setupSupabase;
