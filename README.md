# Course Antik - Digital Courses + Physical Shop Platform

A comprehensive React-based platform for digital courses and physical products, featuring module gating, certificates, and SSLCommerz payments.

## 🚀 Features

### Core Platform

- **Digital Courses**: Video lessons with module-based progression
- **Physical Shop**: Product catalog with SSLCommerz payments
- **Module Gating**: Quiz/file submission requirements with pass marks
- **Auto Certificates**: Issued upon course completion
- **Revenue Sharing**: Teacher percentage-based earnings
- **Multi-role System**: Admin, Teacher, Student dashboards

### Technical Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: GSAP with reduced motion support
- **Sliders**: Swiper with accessibility features
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Storage)
- **Payments**: SSLCommerz integration
- **UI Components**: Headless UI for accessibility

### Design System

- **Theme**: Reddish/Orange color scheme
- **Typography**: Inter font family
- **Animations**: GSAP micro-interactions
- **Accessibility**: WCAG compliant with focus management
- **Mobile-first**: Responsive design with touch-friendly interactions

## 📁 Project Structure

```
src/
├── app/                    # App shell & routing
│   ├── App.jsx            # Main app component
│   ├── router.jsx         # Route configuration
│   ├── ProtectedRoute.jsx # Auth protection
│   └── ErrorBoundary.jsx  # Error handling
├── features/              # Domain-driven features
│   ├── courses/          # Course management
│   ├── shop/             # Product catalog
│   ├── dashboards/       # User/admin panels
│   └── auth/             # Authentication
├── components/           # Reusable UI components
│   ├── layout/          # Header, Footer, Layout
│   └── ui/              # Buttons, Modals, Sliders
├── hooks/               # Custom React hooks
├── lib/                 # External service configs
├── styles/              # CSS and design tokens
├── utils/               # Utility functions
└── assets/              # Images, icons, etc.
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- SSLCommerz merchant account

### 1. Clone and Install

```bash
git clone <repository-url>
cd course-antik
npm install
```

### 2. Environment Variables

Create `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
VITE_SITE_URL=https://yourdomain.com
VITE_CERT_VERIFY_BASE=https://yourdomain.com/certificate/verify/

# Storage Configuration
VITE_STORAGE_COURSE_MEDIA_BUCKET=course-media
VITE_STORAGE_PRODUCT_IMAGES_BUCKET=product-images
VITE_STORAGE_CERTIFICATES_BUCKET=certificates
VITE_STORAGE_SUBMISSIONS_BUCKET=submissions

# SSLCommerz Configuration
VITE_SSL_COMM_RETURN_SUCCESS=/checkout/success
VITE_SSL_COMM_RETURN_FAIL=/checkout/fail
```

### 3. Supabase Setup

#### Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  thumbnail TEXT,
  price_cents INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  includes_certificate BOOLEAN DEFAULT true,
  instructor_id UUID REFERENCES profiles(id),
  rating DECIMAL(3,2) DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order INTEGER NOT NULL,
  type TEXT CHECK (type IN ('quiz', 'file')) NOT NULL,
  pass_marks INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order INTEGER NOT NULL,
  is_free_preview BOOLEAN DEFAULT false,
  duration INTEGER, -- in seconds
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('video', 'pdf', 'link')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  module_id UUID REFERENCES modules(id),
  type TEXT CHECK (type IN ('quiz', 'file')) NOT NULL,
  answers JSONB,
  score INTEGER,
  submitted_file_url TEXT,
  status TEXT CHECK (status IN ('pending', 'passed', 'failed')) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  lesson_id UUID REFERENCES lessons(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE module_passes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  module_id UUID REFERENCES modules(id),
  passed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Certificates table
CREATE TABLE certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  download_url TEXT,
  verify_url TEXT
);

-- Product categories
CREATE TABLE product_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category_id UUID REFERENCES product_categories(id),
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  old_price INTEGER,
  image TEXT,
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')) DEFAULT 'pending',
  subtotal INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  grand_total INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  title TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  provider TEXT DEFAULT 'sslcommerz',
  transaction_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percent', 'amount')) NOT NULL,
  value INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher assignments
CREATE TABLE teacher_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  teacher_id UUID REFERENCES profiles(id),
  percentage DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, teacher_id)
);

-- Teacher earnings
CREATE TABLE teacher_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  order_id UUID REFERENCES orders(id),
  earnings_cents INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid')) DEFAULT 'pending',
  month TEXT NOT NULL, -- YYYY-MM format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_earnings ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content
CREATE POLICY "Public read published courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- Teacher policies
CREATE POLICY "Teachers can view own courses" ON courses FOR SELECT USING (instructor_id = auth.uid());
CREATE POLICY "Teachers can view course submissions" ON quiz_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN courses c ON m.course_id = c.id
    WHERE m.id = quiz_attempts.module_id AND c.instructor_id = auth.uid()
  )
);

-- Admin policies (full access)
CREATE POLICY "Admins have full access" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Teacher assignment policies
CREATE POLICY "Admins can manage teacher assignments" ON teacher_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Teachers can view own assignments" ON teacher_assignments FOR SELECT USING (
  teacher_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Teacher earnings policies
CREATE POLICY "Admins can manage teacher earnings" ON teacher_earnings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Teachers can view own earnings" ON teacher_earnings FOR SELECT USING (
  teacher_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

#### Storage Buckets

Create the following storage buckets in Supabase:

- `course-media` (private) - for course videos and files
- `product-images` (public) - for product images
- `certificates` (private) - for generated certificates
- `submissions` (private) - for student file submissions

### 4. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Key Features Implementation

### Module Gating System

- **Quiz Modules**: Auto-graded multiple choice questions
- **File Submission Modules**: Manual grading by admin/teacher
- **Pass Mark Configuration**: Admin sets minimum score to unlock next module
- **Progress Tracking**: Automatic calculation of completion percentage

### Certificate System

- **Auto Generation**: Issued when all modules are completed
- **Unique Codes**: Public verification system
- **Downloadable**: PDF format with course details
- **Verification**: Public URL for certificate validation

### Payment Integration

- **SSLCommerz**: Hosted checkout with return URLs
- **Order Management**: Complete order lifecycle
- **Coupon System**: Percentage and fixed amount discounts
- **Revenue Tracking**: Teacher earnings calculation

### Dashboard Features

- **User Dashboard**: Course progress, certificates, orders
- **Teacher Dashboard**: Course analytics, earnings, submissions
- **Admin Dashboard**: Full platform management, analytics

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your web server
```

## 🔧 Development Guidelines

### Code Style

- Use functional components with hooks
- Follow feature-based organization
- Implement proper error boundaries
- Use TypeScript-like prop validation

### Accessibility

- All interactive elements are keyboard navigable
- Proper ARIA labels and roles
- Focus management in modals and drawers
- Reduced motion support

### Performance

- Lazy loading for routes and components
- Image optimization with lazy loading
- Efficient state management with TanStack Query
- Bundle size optimization

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Email: support@antik.com
- Documentation: [docs.antik.com](https://docs.antik.com)
#   c o u r s e a n t i k  
 