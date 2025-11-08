import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'placeholder-service-key'

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

// Log configuration status for debugging
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Configuration Status:', {
    url: supabaseUrl,
    configured: isSupabaseConfigured,
    environment: import.meta.env.MODE
  })
}

// Create a mock Supabase client for development when env vars are not set
const createMockClient = () => {
  return {
    auth: {
      getCurrentUser: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signIn: async () => ({ data: null, error: null }),
      signInWithOAuth: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: null, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null })
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        download: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        createSignedUrl: async () => ({ data: null, error: null }),
        remove: async () => ({ data: null, error: null })
      })
    },
    rpc: async () => ({ data: null, error: null })
  }
}

// Create Supabase client with enhanced configuration
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Enhanced security
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'course-antik-v1.0'
        }
      }
    })
  : createMockClient()

// Create service role client for admin operations
export const supabaseAdmin = isSupabaseConfigured && supabaseServiceKey !== 'placeholder-service-key'
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'course-antik-admin-v1.0'
        }
      }
    })
  : null

// Log client status
if (import.meta.env.DEV) {
  console.log('📡 Supabase Client:', isSupabaseConfigured ? 'Connected' : 'Mock Mode')
}

// Auth helpers
export const auth = {
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/verify-email`
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Storage helpers
export const storage = {
  uploadFile: async (bucket, path, file, options = {}) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options)
    return { data, error }
  },

  getSignedUrl: async (bucket, path, expiresIn = 3600) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)
    return { data, error }
  },

  deleteFile: async (bucket, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { data, error }
  }
}

// Database helpers with enhanced error handling
export const db = {
  from: (table) => supabase.from(table),
  
  rpc: (functionName, params) => supabase.rpc(functionName, params),

  // Enhanced query helper with error handling
  query: async (table, options = {}) => {
    try {
      let query = supabase.from(table).select(options.select || '*')
      
      if (options.eq) {
        Object.entries(options.eq).forEach(([column, value]) => {
          query = query.eq(column, value)
        })
      }
      
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending })
      }
      
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query
      
      if (error) {
        console.error(`Database query error for table ${table}:`, error)
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error(`Database operation failed:`, error)
      return { data: null, error }
    }
  }
}

// Real-time subscription helpers
export const realtime = {
  // Subscribe to table changes
  subscribe: (table, callback, filter = {}) => {
    let subscription = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...filter
        }, 
        callback
      )
      .subscribe()

    return subscription
  },

  // Subscribe to user-specific changes
  subscribeToUser: (userId, tables, callback) => {
    const channels = tables.map(table => 
      supabase
        .channel(`user_${userId}_${table}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: table,
            filter: `student_id=eq.${userId}`
          }, 
          (payload) => callback(table, payload)
        )
        .subscribe()
    )

    return {
      unsubscribe: () => {
        channels.forEach(channel => supabase.removeChannel(channel))
      }
    }
  },

  // Subscribe to quiz attempts for real-time grading
  subscribeToQuizAttempts: (quizId, callback) => {
    return supabase
      .channel(`quiz_${quizId}_attempts`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'quiz_attempts',
          filter: `quiz_id=eq.${quizId}`
        }, 
        callback
      )
      .subscribe()
  },

  // Subscribe to assignment submissions for grading queue
  subscribeToAssignmentSubmissions: (assignmentId, callback) => {
    return supabase
      .channel(`assignment_${assignmentId}_submissions`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'assignment_submissions',
          filter: `assignment_id=eq.${assignmentId}`
        }, 
        callback
      )
      .subscribe()
  }
}

// Configuration helper
export const config = {
  isConfigured: isSupabaseConfigured,
  url: supabaseUrl,
  isDevelopment: import.meta.env.DEV,
  
  // Check connection status
  checkConnection: async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      return { connected: !error, error }
    } catch (error) {
      return { connected: false, error }
    }
  }
}

export default supabase
