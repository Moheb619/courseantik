/**
 * Environment Configuration Example
 * 
 * Copy this file to .env.local and fill in your actual values
 * 
 * IMPORTANT: Never commit actual environment variables to version control!
 */

// ============ SUPABASE CONFIGURATION ============
// Get these from your Supabase project dashboard

// Your Supabase project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

// Your Supabase anon/public key
VITE_SUPABASE_ANON_KEY=your-anon-key-here

// ============ GOOGLE OAUTH CONFIGURATION ============
// Get these from Google Cloud Console

// Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

// ============ DEVELOPMENT SETTINGS ============
// Set to 'true' only for development testing (NEVER in production)
VITE_BYPASS_AUTH=false

// ============ SECURITY SETTINGS ============
// JWT secret for additional security (optional)
VITE_JWT_SECRET=your-super-secret-jwt-key

// App environment
VITE_APP_ENV=development

// API base URL (if using external APIs)
VITE_API_BASE_URL=https://api.course-antik.com

// ============ PAYMENT CONFIGURATION ============
// SSLCommerz configuration (if using)
VITE_SSLCOMMERZ_STORE_ID=your-store-id
VITE_SSLCOMMERZ_STORE_PASSWORD=your-store-password

// ============ ANALYTICS CONFIGURATION ============
// Google Analytics (if using)
VITE_GA_TRACKING_ID=GA-XXXXXXXXX

// ============ STORAGE CONFIGURATION ============
// File upload limits
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png,gif

// ============ FEATURE FLAGS ============
// Enable/disable features
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_EMAIL_VERIFICATION=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME=true
