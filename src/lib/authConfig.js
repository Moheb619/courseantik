/**
 * Production-Level Authentication Configuration
 * 
 * This file contains all authentication and authorization configurations
 * for production deployment with Supabase
 */

// Environment variables validation
export const validateAuthConfig = () => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    return false;
  }

  // Validate URL format
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url.includes('supabase.co') && !url.includes('localhost')) {
    console.error('❌ Invalid Supabase URL format');
    return false;
  }

  return true;
};

// Auth configuration for production
export const authConfig = {
  // Session settings
  session: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // PKCE for enhanced security
    storage: window.localStorage, // Use localStorage for persistence
    storageKey: 'course-antik-auth-token',
  },

  // OAuth providers configuration
  oauth: {
    google: {
      scopes: 'email profile',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },

  // Rate limiting
  rateLimiting: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    attemptWindow: 60 * 1000, // 1 minute
  },

  // Security headers
  security: {
    headers: {
      'X-Client-Info': 'course-antik-v1.0',
      'X-Requested-With': 'XMLHttpRequest',
    },
  },

  // Role-based access control
  roles: {
    student: {
      permissions: [
        'courses:read',
        'enrollments:create',
        'enrollments:read',
        'assignments:submit',
        'quizzes:attempt',
        'certificates:read',
        'orders:create',
        'orders:read',
        'profile:update',
      ],
      routes: ['/dashboard', '/courses', '/shop', '/cart', '/orders'],
    },
    instructor: {
      permissions: [
        'courses:create',
        'courses:read',
        'courses:update',
        'modules:create',
        'modules:update',
        'lessons:create',
        'lessons:update',
        'assignments:create',
        'assignments:grade',
        'quizzes:create',
        'students:read',
        'earnings:read',
      ],
      routes: ['/teacher', '/courses', '/dashboard'],
    },
    admin: {
      permissions: [
        'users:create',
        'users:read',
        'users:update',
        'users:delete',
        'courses:*',
        'orders:*',
        'analytics:read',
        'settings:update',
        'notifications:send',
      ],
      routes: ['/admin', '/teacher', '/dashboard'],
    },
  },
};

// Environment-specific configurations
export const getAuthConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  return {
    ...authConfig,
    
    // Development-specific settings
    ...(isDev && {
      session: {
        ...authConfig.session,
        debug: true,
      },
      security: {
        ...authConfig.security,
        bypassAuth: false, // Set to true only for development testing
      },
    }),

    // Production-specific settings
    ...(isProd && {
      session: {
        ...authConfig.session,
        secure: true,
        sameSite: 'strict',
      },
      security: {
        ...authConfig.security,
        enforceHttps: true,
        headers: {
          ...authConfig.security.headers,
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        },
      },
    }),
  };
};

export default authConfig;
