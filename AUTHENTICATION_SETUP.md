# 🔐 Production Authentication Setup Guide

This guide will help you set up production-level authentication and authorization for Course Antik.

## 📋 Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Google Cloud Account**: For Google OAuth setup
3. **Domain/Hosting**: For production deployment

## 🚀 Step 1: Supabase Configuration

### 1.1 Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `course-antik`
5. Generate a strong database password
6. Select your region (closest to your users)
7. Click "Create new project"

### 1.2 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**
4. **NEVER** share your **service_role** key publicly!

### 1.3 Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:5173/auth/callback` (for development)

## 🔑 Step 2: Google OAuth Setup

### 2.1 Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

### 2.2 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add **Authorized JavaScript origins**:
   - `https://your-domain.com`
   - `http://localhost:5173` (for development)
5. Add **Authorized redirect URIs**:
   - `https://your-project-id.supabase.co/auth/v1/callback`
6. Copy your **Client ID**

### 2.3 Configure Google OAuth in Supabase

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Enter your **Google Client ID**
4. Enter your **Google Client Secret**
5. Click **Save**

## 🔧 Step 3: Environment Variables

### 3.1 Create Environment File

Create `.env.local` in your project root:

```bash
# ============ SUPABASE CONFIGURATION ============
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ============ GOOGLE OAUTH CONFIGURATION ============
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# ============ SECURITY SETTINGS ============
VITE_BYPASS_AUTH=false
VITE_APP_ENV=production

# ============ OPTIONAL FEATURES ============
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_EMAIL_VERIFICATION=true
VITE_ENABLE_NOTIFICATIONS=true
```

### 3.2 Environment Variables for Production

For **Vercel**:

1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable with its value

For **Netlify**:

1. Go to **Site settings** → **Environment variables**
2. Add each variable

For **Other platforms**: Check their documentation for environment variable setup.

## 🛡️ Step 4: Database Security (RLS Policies)

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Course access policies
CREATE POLICY "Published courses are viewable by all" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Instructors can manage own courses" ON courses
  FOR ALL USING (auth.uid() = instructor_id);

-- Enrollment policies
CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Assignment submission policies
CREATE POLICY "Students can view own submissions" ON assignment_submissions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create submissions" ON assignment_submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Instructors can view submissions for their courses" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE a.id = assignment_id AND c.instructor_id = auth.uid()
    )
  );

-- Admin policies (full access)
CREATE POLICY "Admins have full access" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 🔒 Step 5: Security Best Practices

### 5.1 Password Security

- ✅ Minimum 8 characters
- ✅ Require uppercase, lowercase, numbers, special characters
- ✅ Rate limiting (5 attempts per minute)
- ✅ Account lockout after failed attempts

### 5.2 Session Security

- ✅ PKCE flow for OAuth
- ✅ Auto token refresh
- ✅ Secure session storage
- ✅ Session timeout handling

### 5.3 API Security

- ✅ Row Level Security (RLS) enabled
- ✅ Role-based access control
- ✅ Permission-based authorization
- ✅ Request rate limiting

## 🧪 Step 6: Testing Authentication

### 6.1 Test User Accounts

Create test accounts for each role:

```sql
-- Insert test users (run in Supabase SQL Editor)
INSERT INTO profiles (id, full_name, role) VALUES
  ('test-admin-id', 'Test Admin', 'admin'),
  ('test-instructor-id', 'Test Instructor', 'instructor'),
  ('test-student-id', 'Test Student', 'student');
```

### 6.2 Test Scenarios

1. **Registration**: Create new account with email verification
2. **Login**: Sign in with email/password and Google
3. **Role Access**: Test each dashboard with different roles
4. **Permissions**: Verify users can only access allowed features
5. **Rate Limiting**: Test multiple failed login attempts
6. **Session Management**: Test auto-refresh and logout

## 🚨 Security Checklist

### Before Production Deployment:

- [ ] **Environment Variables**: All secrets properly configured
- [ ] **RLS Policies**: All database tables protected
- [ ] **OAuth Setup**: Google OAuth properly configured
- [ ] **HTTPS**: SSL certificate installed and enforced
- [ ] **Domain Security**: CORS and redirect URLs configured
- [ ] **Rate Limiting**: Authentication rate limits active
- [ ] **Session Security**: Proper session management
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **Logging**: Authentication events properly logged
- [ ] **Backup**: Database backup strategy in place

## 🔧 Development vs Production

### Development:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BYPASS_AUTH=false  # Keep false for real testing
```

### Production:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BYPASS_AUTH=false  # MUST be false
VITE_APP_ENV=production
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**

   - Check email/password combination
   - Verify user exists in auth.users table
   - Check if email is confirmed

2. **"Access denied"**

   - Verify user role in profiles table
   - Check RLS policies
   - Confirm route permissions

3. **Google OAuth not working**

   - Check Google Client ID
   - Verify redirect URLs
   - Confirm Google+ API is enabled

4. **Environment variables not loading**
   - Restart development server
   - Check .env.local file location
   - Verify variable names (must start with VITE\_)

## 📞 Support

If you encounter issues:

1. Check Supabase logs in your dashboard
2. Review browser console for errors
3. Verify all environment variables are set
4. Test with a fresh incognito browser session

## 🔄 Updates and Maintenance

### Regular Security Tasks:

1. **Rotate secrets** every 90 days
2. **Review user roles** monthly
3. **Update dependencies** regularly
4. **Monitor auth logs** for suspicious activity
5. **Backup user data** regularly

---

**Remember**: Security is an ongoing process, not a one-time setup!
