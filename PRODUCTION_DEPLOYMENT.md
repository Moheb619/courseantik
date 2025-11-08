# 🚀 Production Deployment Guide

Complete guide for deploying Course Antik with production-level authentication and security.

## 📋 Pre-Deployment Checklist

### ✅ Authentication Setup

- [ ] Supabase project created and configured
- [ ] Google OAuth credentials obtained
- [ ] Environment variables configured
- [ ] RLS policies implemented
- [ ] Email templates customized

### ✅ Security Configuration

- [ ] HTTPS certificate obtained
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Error handling tested
- [ ] Session management verified

### ✅ Database Setup

- [ ] Production database configured
- [ ] Sample data inserted (if needed)
- [ ] Backup strategy implemented
- [ ] Performance optimization applied

## 🔐 Step-by-Step Authentication Setup

### 1. Supabase Project Setup

#### 1.1 Create Production Project

```bash
# 1. Go to https://app.supabase.com
# 2. Click "New Project"
# 3. Choose organization
# 4. Project name: course-antik-prod
# 5. Strong password: Use password generator
# 6. Region: Choose closest to users
# 7. Click "Create new project"
```

#### 1.2 Configure Authentication Settings

```sql
-- In Supabase SQL Editor, run:

-- 1. Set up authentication configuration
UPDATE auth.config SET
  site_url = 'https://your-domain.com',
  jwt_exp = 3600,
  refresh_token_rotation_enabled = true,
  security_update_password_require_reauthentication = true;

-- 2. Configure email templates (optional)
-- Go to Authentication > Email Templates in Supabase dashboard
```

#### 1.3 Set Up Google OAuth

```bash
# Google Cloud Console Steps:
# 1. Go to https://console.cloud.google.com
# 2. Create new project: "course-antik-prod"
# 3. Enable Google+ API
# 4. Create OAuth 2.0 credentials
# 5. Authorized origins: https://your-domain.com
# 6. Authorized redirects: https://your-project.supabase.co/auth/v1/callback
# 7. Copy Client ID and Secret
```

### 2. Environment Variables Setup

#### 2.1 Production Environment Variables

```bash
# Create .env.production file:

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# Security Settings
VITE_BYPASS_AUTH=false
VITE_APP_ENV=production
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_EMAIL_VERIFICATION=true

# Optional Features
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME=true
VITE_MAX_FILE_SIZE=10485760
```

#### 2.2 Platform-Specific Configuration

**For Vercel:**

```bash
# Add in Vercel dashboard > Settings > Environment Variables
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
# ... other variables
```

**For Netlify:**

```bash
# Add in Netlify dashboard > Site settings > Environment variables
# Same variables as above
```

**For Custom Server:**

```bash
# Create .env file on server
# Same variables as above
# Ensure proper file permissions (600)
chmod 600 .env
```

### 3. Database Security (RLS Policies)

#### 3.1 Essential RLS Policies

```sql
-- Run in Supabase SQL Editor:

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_earnings ENABLE ROW LEVEL SECURITY;

-- User profile policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Course policies
CREATE POLICY "Published courses viewable by all" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Instructors can manage own courses" ON courses
  FOR ALL USING (auth.uid() = instructor_id);

CREATE POLICY "Admins can manage all courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enrollment policies
CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Instructors can view course enrollments" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_id AND instructor_id = auth.uid()
    )
  );

-- Assignment submission policies
CREATE POLICY "Students can manage own submissions" ON assignment_submissions
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Instructors can grade course submissions" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE a.id = assignment_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update submission grades" ON assignment_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN modules m ON a.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE a.id = assignment_id AND c.instructor_id = auth.uid()
    )
  );

-- Quiz attempt policies
CREATE POLICY "Students can view own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Certificate policies
CREATE POLICY "Students can view own certificates" ON certificates
  FOR SELECT USING (auth.uid() = student_id);

-- Order policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Teacher earnings policies
CREATE POLICY "Instructors can view own earnings" ON teacher_earnings
  FOR SELECT USING (auth.uid() = instructor_id);
```

### 4. Security Headers Configuration

#### 4.1 Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

#### 4.2 Netlify (\_headers file)

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

### 5. Build and Deploy

#### 5.1 Build for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run preview
```

#### 5.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GOOGLE_CLIENT_ID
# ... add all other variables

# Deploy to production
vercel --prod
```

#### 5.3 Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### 6. Post-Deployment Security Verification

#### 6.1 Security Tests

```bash
# Test authentication flows:
✅ Email/password registration
✅ Email/password login
✅ Google OAuth login
✅ Password reset flow
✅ Role-based access control
✅ Session management
✅ Rate limiting

# Test security features:
✅ HTTPS enforcement
✅ Security headers
✅ RLS policies
✅ Error handling
✅ Session timeout
```

#### 6.2 Performance Tests

```bash
# Load testing tools:
- Lighthouse audit
- WebPageTest
- GTmetrix
- Load testing with Artillery/k6
```

## 🔑 Google OAuth Setup Details

### Step 1: Google Cloud Console

1. **Create Project**:

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click "New Project"
   - Name: "Course Antik Production"
   - Click "Create"

2. **Enable APIs**:

   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - Google+ API
     - Google People API (optional, for profile data)

3. **Create OAuth Credentials**:

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Course Antik Production"

4. **Configure OAuth**:

   - **Authorized JavaScript origins**:
     ```
     https://your-domain.com
     https://www.your-domain.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```

5. **Get Credentials**:
   - Copy **Client ID** (starts with numbers, ends with .googleusercontent.com)
   - Copy **Client Secret** (keep this secure!)

### Step 2: Supabase Google OAuth Setup

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to configure
4. Toggle **Enable sign in with Google**
5. Enter your **Google Client ID**
6. Enter your **Google Client Secret**
7. Click **Save**

## 🛡️ Security Best Practices

### Environment Security

```bash
# NEVER commit these to version control:
.env
.env.local
.env.production

# Add to .gitignore:
.env*
!.env.example
```

### API Key Security

```bash
# Supabase Keys:
# ✅ anon/public key: Safe for client-side use
# ❌ service_role key: NEVER use on client-side
# ❌ JWT secret: Server-side only

# Google OAuth:
# ✅ Client ID: Safe for client-side use
# ❌ Client Secret: Server-side only (but Supabase handles this)
```

### Database Security

```sql
-- Regular security maintenance:

-- 1. Review RLS policies monthly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- 2. Check for unauthorized access patterns
SELECT * FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 3. Monitor failed login attempts
SELECT * FROM auth.audit_log_entries
WHERE payload->>'action' = 'login'
AND payload->>'error' IS NOT NULL
ORDER BY created_at DESC;
```

## 🔧 Environment Variables Reference

### Required Variables

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (Required for Google login)
VITE_GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
```

### Optional Variables

```bash
# Security
VITE_BYPASS_AUTH=false                    # MUST be false in production
VITE_APP_ENV=production
VITE_JWT_SECRET=your-jwt-secret

# Features
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_EMAIL_VERIFICATION=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME=true

# File Uploads
VITE_MAX_FILE_SIZE=10485760              # 10MB
VITE_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Payment (if using SSLCommerz)
VITE_SSLCOMMERZ_STORE_ID=your-store-id
VITE_SSLCOMMERZ_STORE_PASSWORD=your-store-password

# Analytics
VITE_GA_TRACKING_ID=GA-XXXXXXXXX
```

## 🚨 Security Warnings

### ⚠️ Critical Security Rules

1. **NEVER** commit environment files:

   ```bash
   # ❌ NEVER do this:
   git add .env
   git add .env.production

   # ✅ Always ensure .gitignore contains:
   .env*
   !.env.example
   ```

2. **NEVER** use service_role key on client-side:

   ```javascript
   // ❌ NEVER do this:
   const supabase = createClient(url, SERVICE_ROLE_KEY);

   // ✅ Always use anon key:
   const supabase = createClient(url, ANON_KEY);
   ```

3. **ALWAYS** use HTTPS in production:

   ```bash
   # ✅ Correct:
   https://your-domain.com

   # ❌ Never use HTTP in production:
   http://your-domain.com
   ```

## 📊 Monitoring and Maintenance

### Security Monitoring

```bash
# Set up monitoring for:
- Failed login attempts
- Unusual access patterns
- API rate limit violations
- Database query errors
- Authentication errors
```

### Regular Maintenance Tasks

```bash
# Weekly:
- Review auth logs
- Check error rates
- Monitor performance

# Monthly:
- Rotate secrets
- Review user roles
- Update dependencies
- Security audit

# Quarterly:
- Full security review
- Penetration testing
- Backup verification
- Disaster recovery test
```

## 🆘 Troubleshooting

### Common Issues

1. **Google OAuth not working**:

   ```bash
   # Check:
   - Client ID is correct
   - Redirect URLs match exactly
   - Google+ API is enabled
   - No trailing slashes in URLs
   ```

2. **Environment variables not loading**:

   ```bash
   # Solutions:
   - Restart development server
   - Check variable names (must start with VITE_)
   - Verify .env.local file location
   - Clear browser cache
   ```

3. **RLS blocking queries**:

   ```sql
   -- Check policies:
   SELECT * FROM pg_policies WHERE tablename = 'your_table';

   -- Test policy:
   SELECT auth.uid(), auth.role();
   ```

4. **Session issues**:
   ```javascript
   // Debug session:
   const { data: session } = await supabase.auth.getSession();
   console.log("Current session:", session);
   ```

## 📞 Support and Resources

### Documentation Links

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

### Emergency Contacts

- Supabase Support: support@supabase.com
- Google Cloud Support: Through Google Cloud Console

---

**Remember**: Test everything in a staging environment before deploying to production!
