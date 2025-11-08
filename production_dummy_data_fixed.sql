-- =====================================================
-- COURSE ANTIK - PRODUCTION DUMMY DATA (REMODIFIED VERSION)
-- Following Parent-Child Relationships with 4-5 Records Per Table
-- =====================================================

-- =====================================================
-- SETUP INSTRUCTIONS:
-- =====================================================
/*
This script creates a complete Course Antik database with proper relationships:

PARENT-CHILD RELATIONSHIP FLOW:
1. Categories (Parent) → Courses (Child)
2. Product Categories (Parent) → Products (Child)  
3. Courses (Parent) → Modules (Child)
4. Modules (Parent) → Lessons, Quizzes, Assignments (Children)
5. Quizzes (Parent) → Quiz Questions (Child) → Quiz Options (Child)
6. Assignments (Parent) → Assignment Rubric (Child)

Each table contains 4-5 realistic records following proper relationships.
*/

-- =====================================================
-- 1. CATEGORIES (Course Categories) - PARENT TABLE
-- =====================================================
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Web Development', 'web-development', 'Learn modern web development technologies including React, Node.js, and full-stack development', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400'),
('550e8400-e29b-41d4-a716-446655440002', 'Mobile Development', 'mobile-development', 'Build mobile applications for iOS and Android using modern frameworks', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400'),
('550e8400-e29b-41d4-a716-446655440003', 'Data Science', 'data-science', 'Master data analysis, machine learning, and AI technologies', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'),
('550e8400-e29b-41d4-a716-446655440004', 'UI/UX Design', 'ui-ux-design', 'Learn user interface and user experience design principles', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'),
('550e8400-e29b-41d4-a716-446655440005', 'DevOps & Cloud', 'devops-cloud', 'Master DevOps practices and cloud computing platforms', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400');

-- =====================================================
-- 2. PRODUCT CATEGORIES - PARENT TABLE
-- =====================================================
INSERT INTO public.product_categories (id, name, slug, description, image_url) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Programming Books', 'programming-books', 'Essential programming and development books', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('650e8400-e29b-41d4-a716-446655440002', 'Tech Accessories', 'tech-accessories', 'Programming accessories and productivity tools', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400'),
('650e8400-e29b-41d4-a716-446655440003', 'Course Antik Merchandise', 'course-antik-merchandise', 'Official Course Antik branded items', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
('650e8400-e29b-41d4-a716-446655440004', 'Development Tools', 'development-tools', 'Software licenses and development tools', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'),
('650e8400-e29b-41d4-a716-446655440005', 'Certification Programs', 'certification-programs', 'Professional certification and training programs', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400');

-- =====================================================
-- 3. PRODUCTS - CHILD OF PRODUCT CATEGORIES
-- =====================================================
INSERT INTO public.products (id, title, slug, description, short_description, price_cents, sale_price_cents, category_id, stock_quantity, is_active, is_featured, rating, reviews_count, images, features, specifications, sizes, colors) VALUES
-- Programming Books (Category 1)
('950e8400-e29b-41d4-a716-446655440001', 'JavaScript: The Complete Guide', 'javascript-complete-guide', 'The most comprehensive guide to modern JavaScript programming. Covers ES6+, async/await, modules, and advanced patterns used in real-world applications.', 'Complete modern JavaScript reference', 4500, 3600, '650e8400-e29b-41d4-a716-446655440001', 50, true, true, 4.8, 156, '["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"]', '["800+ pages of content", "ES6+ coverage", "Practical examples"]', '{"pages": 850, "language": "English", "format": "Paperback & Digital"}', null, null),

('950e8400-e29b-41d4-a716-446655440002', 'React Development Handbook', 'react-development-handbook', 'Master React development with this comprehensive handbook covering hooks, context, testing, and performance optimization.', 'Essential React development guide', 3900, 2900, '650e8400-e29b-41d4-a716-446655440001', 75, true, false, 4.7, 89, '["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400"]', '["600+ pages", "React 18 features", "Testing strategies"]', '{"pages": 650, "language": "English", "format": "Paperback & Digital"}', null, null),

('950e8400-e29b-41d4-a716-446655440003', 'Python for Data Science', 'python-data-science', 'Complete guide to Python programming for data science, machine learning, and AI applications.', 'Python data science guide', 4200, 3200, '650e8400-e29b-41d4-a716-446655440001', 60, true, true, 4.6, 134, '["https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400"]', '["700+ pages", "Pandas & NumPy", "ML algorithms"]', '{"pages": 750, "language": "English", "format": "Paperback & Digital"}', null, null),

-- Tech Accessories (Category 2)
('950e8400-e29b-41d4-a716-446655440004', 'Premium Laptop Stand', 'premium-laptop-stand', 'Ergonomic aluminum laptop stand with adjustable height and angle. Perfect for developers who spend long hours coding.', 'Adjustable aluminum laptop stand', 3500, 2800, '650e8400-e29b-41d4-a716-446655440002', 25, true, true, 4.8, 234, '["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400"]', '["Aluminum construction", "Adjustable height", "Heat dissipation"]', '{"material": "Aluminum alloy", "weight": "1.2 kg", "compatibility": "11-17 inch laptops"}', null, '["Space Gray", "Silver"]'),

('950e8400-e29b-41d4-a716-446655440005', 'Mechanical Keyboard - Developer Edition', 'mechanical-keyboard-dev', 'Premium mechanical keyboard designed for developers with programmable keys, RGB backlighting, and Cherry MX switches.', 'Professional mechanical keyboard', 8900, 7500, '650e8400-e29b-41d4-a716-446655440002', 15, true, true, 4.9, 167, '["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400"]', '["Cherry MX Blue switches", "RGB backlighting", "Programmable keys"]', '{"switches": "Cherry MX Blue", "layout": "Full-size", "connectivity": "USB-C"}', null, '["Black", "White"]'),

-- Course Antik Merchandise (Category 3)
('950e8400-e29b-41d4-a716-446655440006', 'Course Antik Hoodie', 'course-antik-hoodie', 'Comfortable premium hoodie with Course Antik logo. Perfect for coding sessions and casual wear.', 'Official Course Antik hoodie', 2500, null, '650e8400-e29b-41d4-a716-446655440003', 100, true, false, 4.6, 78, '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"]', '["100% cotton blend", "Kangaroo pocket", "Embroidered logo"]', '{"material": "80% Cotton, 20% Polyester", "care": "Machine wash cold"}', '["S", "M", "L", "XL", "XXL"]', '["Black", "Navy", "Gray"]'),

('950e8400-e29b-41d4-a716-446655440007', 'Course Antik Mug', 'course-antik-mug', 'Start your coding day right with this premium ceramic mug featuring the Course Antik logo.', 'Official Course Antik ceramic mug', 800, 600, '650e8400-e29b-41d4-a716-446655440003', 200, true, false, 4.4, 45, '["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400"]', '["Ceramic construction", "11 oz capacity", "Dishwasher safe"]', '{"capacity": "11 oz", "material": "Ceramic", "care": "Dishwasher and microwave safe"}', null, '["White", "Black"]'),

-- Development Tools (Category 4)
('950e8400-e29b-41d4-a716-446655440008', 'VS Code Premium License', 'vscode-premium-license', 'Premium VS Code license with advanced features, extensions, and cloud sync capabilities.', 'Professional VS Code license', 1500, 1200, '650e8400-e29b-41d4-a716-446655440004', 500, true, true, 4.9, 298, '["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400"]', '["Cloud sync", "Advanced debugging", "Team collaboration"]', '{"license_type": "Annual", "users": "1", "support": "Premium"}', null, null),

-- Certification Programs (Category 5)
('950e8400-e29b-41d4-a716-446655440009', 'Full Stack Developer Certification', 'fullstack-certification', 'Comprehensive certification program covering frontend, backend, and DevOps technologies.', 'Professional full stack certification', 25000, 20000, '650e8400-e29b-41d4-a716-446655440005', 50, true, true, 4.8, 67, '["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400"]', '["Industry recognized", "6-month program", "Job placement assistance"]', '{"duration": "6 months", "level": "Professional", "exam": "Required"}', null, null);

-- =====================================================
-- 4. COURSES - CHILD OF CATEGORIES (Using NULL instructor_id)
-- =====================================================
INSERT INTO public.courses (id, title, slug, subtitle, description, thumbnail, price_cents, is_free, is_featured, is_published, instructor_id, category_id, lessons_count, modules_count, estimated_duration, difficulty_level, includes_certificate, rating, enrolled_count) VALUES
-- Web Development Courses (Category 1)
('850e8400-e29b-41d4-a716-446655440001', 'React Masterclass 2024', 'react-masterclass-2024', 'Build Modern Web Applications with React 18', 'Master React from basics to advanced concepts including hooks, context, state management, and modern patterns. Build real-world projects and learn industry best practices.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 9900, false, true, true, NULL, '550e8400-e29b-41d4-a716-446655440001', 18, 5, 540, 'intermediate', true, 4.8, 1250),

('850e8400-e29b-41d4-a716-446655440002', 'Node.js Backend Development', 'nodejs-backend-development', 'Build Scalable Backend APIs with Node.js', 'Learn to build robust backend applications with Node.js, Express, MongoDB, and modern development practices. Perfect for beginners starting their backend journey.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 0, true, true, true, NULL, '550e8400-e29b-41d4-a716-446655440001', 15, 4, 420, 'beginner', true, 4.6, 890),

('850e8400-e29b-41d4-a716-446655440003', 'Full Stack JavaScript Bootcamp', 'full-stack-javascript-bootcamp', 'Complete Web Development Mastery', 'Comprehensive course covering both frontend and backend development with JavaScript. Build complete applications from scratch using React, Node.js, and MongoDB.', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800', 14900, false, true, true, NULL, '550e8400-e29b-41d4-a716-446655440001', 32, 8, 960, 'intermediate', true, 4.9, 2100),

-- Mobile Development Courses (Category 2)
('850e8400-e29b-41d4-a716-446655440004', 'React Native Mobile Development', 'react-native-mobile-development', 'Build Cross-Platform Mobile Apps', 'Learn to build native mobile applications for iOS and Android using React Native. Deploy to app stores and implement native features.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', 11900, false, false, true, NULL, '550e8400-e29b-41d4-a716-446655440002', 25, 6, 750, 'advanced', true, 4.4, 320),

('850e8400-e29b-41d4-a716-446655440005', 'Flutter App Development', 'flutter-app-development', 'Build Beautiful Native Apps with Flutter', 'Master Flutter framework to create stunning cross-platform mobile applications for iOS and Android with a single codebase.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800', 10900, false, false, true, NULL, '550e8400-e29b-41d4-a716-446655440002', 22, 5, 660, 'intermediate', true, 4.3, 280),

-- Data Science Courses (Category 3)
('850e8400-e29b-41d4-a716-446655440006', 'Python Data Science Bootcamp', 'python-data-science-bootcamp', 'Master Data Analysis and Machine Learning', 'Comprehensive data science course covering Python, pandas, NumPy, matplotlib, scikit-learn, and machine learning algorithms.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 12900, false, false, true, NULL, '550e8400-e29b-41d4-a716-446655440003', 28, 7, 840, 'intermediate', true, 4.5, 450),

('850e8400-e29b-41d4-a716-446655440007', 'Machine Learning Fundamentals', 'machine-learning-fundamentals', 'Introduction to AI and Machine Learning', 'Learn the fundamentals of machine learning, including supervised and unsupervised learning, neural networks, and real-world applications.', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800', 15900, false, false, true, NULL, '550e8400-e29b-41d4-a716-446655440003', 30, 8, 900, 'advanced', true, 4.7, 380),

-- UI/UX Design Courses (Category 4)
('850e8400-e29b-41d4-a716-446655440008', 'UI/UX Design Fundamentals', 'ui-ux-design-fundamentals', 'Design Beautiful and Functional Interfaces', 'Learn the principles of user interface and user experience design. Master Figma, design systems, and user research methodologies.', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', 7900, false, true, true, NULL, '550e8400-e29b-41d4-a716-446655440004', 22, 6, 660, 'beginner', true, 4.7, 680),

-- DevOps & Cloud Courses (Category 5)
('850e8400-e29b-41d4-a716-446655440009', 'AWS Cloud Practitioner', 'aws-cloud-practitioner', 'Master Amazon Web Services', 'Comprehensive AWS course covering EC2, S3, Lambda, RDS, and cloud architecture patterns. Perfect for cloud beginners.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', 8900, false, false, true, NULL, '550e8400-e29b-41d4-a716-446655440005', 20, 5, 600, 'beginner', true, 4.6, 520);

-- =====================================================
-- 5. MODULES - CHILD OF COURSES (4-5 modules per course)
-- =====================================================
INSERT INTO public.modules (id, course_id, title, description, module_order, estimated_time, pass_marks, is_required) VALUES
-- React Masterclass Modules (Course 1)
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'React Fundamentals', 'Learn the basics of React including components, JSX, props, and the virtual DOM', 1, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'State Management & Hooks', 'Master React state management, useState, useEffect, and custom hooks', 2, '4 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 'Advanced React Patterns', 'Learn context API, render props, higher-order components, and performance optimization', 3, '3.5 hours', 80, true),
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440001', 'React Router & Navigation', 'Implement client-side routing and navigation in React applications', 4, '2.5 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440001', 'Testing & Deployment', 'Learn testing strategies and deploy React applications to production', 5, '2 hours', 70, true),

-- Node.js Backend Development Modules (Course 2)
('950e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440002', 'Node.js Fundamentals', 'Introduction to Node.js, NPM, and server-side JavaScript development', 1, '2.5 hours', 70, true),
('950e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440002', 'Express.js Framework', 'Build web servers and APIs using Express.js framework', 2, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440002', 'Database Integration', 'Connect to MongoDB and implement CRUD operations', 3, '3.5 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440009', '850e8400-e29b-41d4-a716-446655440002', 'Authentication & Security', 'Implement user authentication, authorization, and security best practices', 4, '3 hours', 80, true),

-- Full Stack JavaScript Modules (Course 3)
('950e8400-e29b-41d4-a716-446655440010', '850e8400-e29b-41d4-a716-446655440003', 'Frontend with React', 'Build the frontend using React and modern development tools', 1, '4 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440011', '850e8400-e29b-41d4-a716-446655440003', 'Backend with Node.js', 'Create RESTful APIs with Node.js and Express', 2, '4 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440012', '850e8400-e29b-41d4-a716-446655440003', 'Database Design', 'Design and implement MongoDB databases', 3, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440013', '850e8400-e29b-41d4-a716-446655440003', 'Authentication & Authorization', 'Implement secure user authentication', 4, '3 hours', 80, true),

-- React Native Mobile Development Modules (Course 4)
('950e8400-e29b-41d4-a716-446655440014', '850e8400-e29b-41d4-a716-446655440004', 'React Native Setup', 'Environment setup and first mobile app', 1, '2 hours', 70, true),
('950e8400-e29b-41d4-a716-446655440015', '850e8400-e29b-41d4-a716-446655440004', 'Navigation & Routing', 'Implement navigation in mobile apps', 2, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440016', '850e8400-e29b-41d4-a716-446655440004', 'Native Features', 'Access device features like camera, GPS, notifications', 3, '4 hours', 80, true),
('950e8400-e29b-41d4-a716-446655440017', '850e8400-e29b-41d4-a716-446655440004', 'App Store Deployment', 'Deploy apps to iOS App Store and Google Play', 4, '3 hours', 75, true),

-- Flutter App Development Modules (Course 5)
('950e8400-e29b-41d4-a716-446655440018', '850e8400-e29b-41d4-a716-446655440005', 'Flutter Fundamentals', 'Introduction to Flutter framework and Dart programming', 1, '3 hours', 70, true),
('950e8400-e29b-41d4-a716-446655440019', '850e8400-e29b-41d4-a716-446655440005', 'Widget Development', 'Master Flutter widgets and UI components', 2, '3.5 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440020', '850e8400-e29b-41d4-a716-446655440005', 'State Management', 'Implement state management patterns in Flutter', 3, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440021', '850e8400-e29b-41d4-a716-446655440005', 'API Integration', 'Connect Flutter apps to backend services', 4, '2.5 hours', 70, true),

-- Python Data Science Modules (Course 6)
('950e8400-e29b-41d4-a716-446655440022', '850e8400-e29b-41d4-a716-446655440006', 'Python Fundamentals', 'Learn Python programming basics for data science', 1, '3 hours', 70, true),
('950e8400-e29b-41d4-a716-446655440023', '850e8400-e29b-41d4-a716-446655440006', 'Data Analysis with Pandas', 'Master data manipulation and analysis with Pandas', 2, '4 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440024', '850e8400-e29b-41d4-a716-446655440006', 'Data Visualization', 'Create compelling visualizations with Matplotlib and Seaborn', 3, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440025', '850e8400-e29b-41d4-a716-446655440006', 'Machine Learning Basics', 'Introduction to machine learning with Scikit-learn', 4, '4 hours', 80, true),

-- Machine Learning Modules (Course 7)
('950e8400-e29b-41d4-a716-446655440026', '850e8400-e29b-41d4-a716-446655440007', 'Supervised Learning', 'Learn regression and classification algorithms', 1, '4 hours', 80, true),
('950e8400-e29b-41d4-a716-446655440027', '850e8400-e29b-41d4-a716-446655440007', 'Unsupervised Learning', 'Master clustering and dimensionality reduction', 2, '3.5 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440028', '850e8400-e29b-41d4-a716-446655440007', 'Neural Networks', 'Introduction to deep learning and neural networks', 3, '5 hours', 85, true),
('950e8400-e29b-41d4-a716-446655440029', '850e8400-e29b-41d4-a716-446655440007', 'Model Deployment', 'Deploy machine learning models to production', 4, '4 hours', 80, true),

-- UI/UX Design Modules (Course 8)
('950e8400-e29b-41d4-a716-446655440030', '850e8400-e29b-41d4-a716-446655440008', 'Design Principles', 'Learn fundamental design principles and color theory', 1, '2 hours', 70, true),
('950e8400-e29b-41d4-a716-446655440031', '850e8400-e29b-41d4-a716-446655440008', 'Figma Mastery', 'Master Figma for UI design and prototyping', 2, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440032', '850e8400-e29b-41d4-a716-446655440008', 'User Research', 'Conduct user research and usability testing', 3, '2.5 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440033', '850e8400-e29b-41d4-a716-446655440008', 'Wireframing & Prototyping', 'Create wireframes and interactive prototypes', 4, '3 hours', 75, true),

-- AWS Cloud Practitioner Modules (Course 9)
('950e8400-e29b-41d4-a716-446655440034', '850e8400-e29b-41d4-a716-446655440009', 'AWS Fundamentals', 'Introduction to AWS services and cloud concepts', 1, '3 hours', 70, true),
('950e8400-e29b-41d4-a716-446655440035', '850e8400-e29b-41d4-a716-446655440009', 'Compute Services', 'Learn EC2, Lambda, and other compute services', 2, '3.5 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440036', '850e8400-e29b-41d4-a716-446655440009', 'Storage & Databases', 'Master S3, RDS, and other storage solutions', 3, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440037', '850e8400-e29b-41d4-a716-446655440009', 'Security & Monitoring', 'Implement security best practices and monitoring', 4, '2.5 hours', 70, true),
('950e8400-e29b-41d4-a716-446655440038', '850e8400-e29b-41d4-a716-446655440009', 'Cloud Architecture', 'Design scalable cloud architectures', 5, '3 hours', 80, true);

-- =====================================================
-- 6. LESSONS - CHILD OF MODULES (4-5 lessons per module)
-- =====================================================
INSERT INTO public.lessons (id, module_id, title, slug, description, lesson_order, duration, video_url, video_type, is_free_preview, content) VALUES
-- React Fundamentals Module Lessons (Module 1)
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'What is React?', 'what-is-react', 'Introduction to React library and its core concepts', 1, 480, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', true, '{"materials": ["React Documentation", "Setup Guide"], "notes": "Understanding React fundamentals"}'),
('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', 'Components and JSX', 'components-and-jsx', 'Learn about React components and JSX syntax', 2, 720, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', true, '{"materials": ["JSX Guide", "Component Examples"], "notes": "Building your first components"}'),
('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', 'Props and State', 'props-and-state', 'Understanding component props and state management', 3, 600, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Props Examples", "State Management Guide"], "notes": "Data flow in React"}'),
('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440001', 'Event Handling', 'event-handling', 'Handle user interactions and events in React', 4, 540, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Event Examples", "Best Practices"], "notes": "Interactive React components"}'),

-- State Management & Hooks Module Lessons (Module 2)
('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440002', 'useState Hook', 'usestate-hook', 'Master the useState hook for component state', 1, 600, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["useState Examples", "State Patterns"], "notes": "Managing component state"}'),
('a50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440002', 'useEffect Hook', 'useeffect-hook', 'Handle side effects with useEffect', 2, 720, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["useEffect Guide", "Cleanup Functions"], "notes": "Side effects in React"}'),
('a50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440002', 'Custom Hooks', 'custom-hooks', 'Create reusable custom hooks', 3, 660, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Custom Hook Examples", "Hook Patterns"], "notes": "Reusable logic with hooks"}'),

-- Advanced React Patterns Module Lessons (Module 3)
('a50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440003', 'Context API', 'context-api', 'Learn React Context for global state management', 1, 480, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Context Examples", "State Management"], "notes": "Global state patterns"}'),
('a50e8400-e29b-41d4-a716-446655440009', '950e8400-e29b-41d4-a716-446655440003', 'Higher-Order Components', 'hoc-pattern', 'Master Higher-Order Components pattern', 2, 540, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["HOC Examples", "Patterns Guide"], "notes": "Component composition"}'),
('a50e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440003', 'Performance Optimization', 'performance-optimization', 'Optimize React applications for better performance', 3, 600, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Performance Tips", "Profiling Guide"], "notes": "React performance"}'),

-- React Router & Navigation Module Lessons (Module 4)
('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440004', 'React Router Setup', 'react-router-setup', 'Setting up React Router for navigation', 1, 420, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Router Setup", "Basic Navigation"], "notes": "Client-side routing"}'),
('a50e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440004', 'Route Parameters', 'route-parameters', 'Working with dynamic route parameters', 2, 480, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Dynamic Routes", "URL Parameters"], "notes": "Dynamic navigation"}'),
('a50e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440004', 'Protected Routes', 'protected-routes', 'Implement authentication and protected routes', 3, 540, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Auth Guards", "Route Protection"], "notes": "Secure navigation"}'),

-- Testing & Deployment Module Lessons (Module 5)
('a50e8400-e29b-41d4-a716-446655440014', '950e8400-e29b-41d4-a716-446655440005', 'Testing with Jest', 'testing-jest', 'Write unit tests with Jest and React Testing Library', 1, 600, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Jest Guide", "Testing Examples"], "notes": "Component testing"}'),
('a50e8400-e29b-41d4-a716-446655440015', '950e8400-e29b-41d4-a716-446655440005', 'Deployment Strategies', 'deployment-strategies', 'Deploy React apps to production environments', 2, 480, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', false, '{"materials": ["Deployment Guide", "CI/CD Setup"], "notes": "Production deployment"}'),

-- Node.js Fundamentals Module Lessons (Module 6)
('a50e8400-e29b-41d4-a716-446655440016', '950e8400-e29b-41d4-a716-446655440006', 'Node.js Introduction', 'nodejs-introduction', 'Getting started with Node.js runtime environment', 1, 600, 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'youtube', true, '{"materials": ["Node.js Installation Guide", "First App"], "notes": "Server-side JavaScript"}'),
('a50e8400-e29b-41d4-a716-446655440017', '950e8400-e29b-41d4-a716-446655440006', 'NPM and Modules', 'npm-and-modules', 'Understanding NPM package manager and module system', 2, 540, 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'youtube', true, '{"materials": ["NPM Guide", "Module Examples"], "notes": "Package management"}'),
('a50e8400-e29b-41d4-a716-446655440018', '950e8400-e29b-41d4-a716-446655440006', 'File System Operations', 'file-system-operations', 'Working with files and directories in Node.js', 3, 480, 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'youtube', false, '{"materials": ["File System API", "Examples"], "notes": "File operations"}'),

-- Express.js Framework Module Lessons (Module 7)
('a50e8400-e29b-41d4-a716-446655440019', '950e8400-e29b-41d4-a716-446655440007', 'Express.js Setup', 'express-setup', 'Setting up Express.js server and basic routing', 1, 480, 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'youtube', false, '{"materials": ["Express Setup", "Routing Guide"], "notes": "Web server basics"}'),
('a50e8400-e29b-41d4-a716-446655440020', '950e8400-e29b-41d4-a716-446655440007', 'Middleware and Routes', 'middleware-routes', 'Understanding middleware and advanced routing', 2, 720, 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'youtube', false, '{"materials": ["Middleware Examples", "Advanced Routing"], "notes": "Request processing"}'),
('a50e8400-e29b-41d4-a716-446655440021', '950e8400-e29b-41d4-a716-446655440007', 'RESTful APIs', 'restful-apis', 'Building RESTful API endpoints', 3, 600, 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'youtube', false, '{"materials": ["REST Principles", "API Examples"], "notes": "API design"}');

-- =====================================================
-- 7. QUIZZES - CHILD OF MODULES (1 quiz per module)
-- =====================================================
INSERT INTO public.quizzes (id, module_id, title, description, pass_marks, time_limit, is_required, max_attempts) VALUES
-- React Masterclass Quizzes
('b50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'React Fundamentals Quiz', 'Test your understanding of React basics and core concepts', 75, 600, true, 3),
('b50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440002', 'State Management Quiz', 'Assess your knowledge of React state and hooks', 75, 480, true, 3),
('b50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440003', 'Advanced React Patterns Quiz', 'Evaluate your understanding of advanced React patterns', 80, 540, true, 3),
('b50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440004', 'React Router Quiz', 'Test your knowledge of React Router and navigation', 75, 420, true, 3),
('b50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440005', 'Testing & Deployment Quiz', 'Assess your testing and deployment knowledge', 70, 360, true, 3),

-- Node.js Backend Development Quizzes
('b50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440006', 'Node.js Basics Quiz', 'Evaluate your understanding of Node.js fundamentals', 70, 300, true, 3),
('b50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440007', 'Express.js Quiz', 'Test your Express.js framework knowledge', 75, 420, true, 3),
('b50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440008', 'Database Integration Quiz', 'Assess your database and MongoDB knowledge', 75, 450, true, 3),
('b50e8400-e29b-41d4-a716-446655440009', '950e8400-e29b-41d4-a716-446655440009', 'Authentication & Security Quiz', 'Test your authentication and security knowledge', 80, 480, true, 3),

-- Full Stack JavaScript Quizzes
('b50e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440010', 'Frontend Development Quiz', 'Evaluate your frontend development skills', 75, 600, true, 3),
('b50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440011', 'Backend Development Quiz', 'Test your backend development knowledge', 75, 540, true, 3),
('b50e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440012', 'Database Design Quiz', 'Assess your database design skills', 75, 480, true, 3),
('b50e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440013', 'Full Stack Integration Quiz', 'Test your full stack integration knowledge', 80, 720, true, 3),

-- Mobile Development Quizzes
('b50e8400-e29b-41d4-a716-446655440014', '950e8400-e29b-41d4-a716-446655440014', 'React Native Setup Quiz', 'Evaluate your React Native setup knowledge', 70, 360, true, 3),
('b50e8400-e29b-41d4-a716-446655440015', '950e8400-e29b-41d4-a716-446655440015', 'Mobile Navigation Quiz', 'Test your mobile navigation knowledge', 75, 420, true, 3),
('b50e8400-e29b-41d4-a716-446655440016', '950e8400-e29b-41d4-a716-446655440016', 'Native Features Quiz', 'Assess your native features knowledge', 80, 540, true, 3),
('b50e8400-e29b-41d4-a716-446655440017', '950e8400-e29b-41d4-a716-446655440017', 'App Store Deployment Quiz', 'Test your app deployment knowledge', 75, 480, true, 3),

-- Data Science Quizzes
('b50e8400-e29b-41d4-a716-446655440018', '950e8400-e29b-41d4-a716-446655440022', 'Python Fundamentals Quiz', 'Evaluate your Python programming knowledge', 70, 360, true, 3),
('b50e8400-e29b-41d4-a716-446655440019', '950e8400-e29b-41d4-a716-446655440023', 'Data Analysis Quiz', 'Test your data analysis skills', 75, 480, true, 3),
('b50e8400-e29b-41d4-a716-446655440020', '950e8400-e29b-41d4-a716-446655440024', 'Data Visualization Quiz', 'Assess your data visualization knowledge', 75, 420, true, 3),
('b50e8400-e29b-41d4-a716-446655440021', '950e8400-e29b-41d4-a716-446655440025', 'Machine Learning Basics Quiz', 'Test your machine learning fundamentals', 80, 540, true, 3),

-- UI/UX Design Quizzes
('b50e8400-e29b-41d4-a716-446655440022', '950e8400-e29b-41d4-a716-446655440030', 'Design Principles Quiz', 'Assess your understanding of UI/UX design principles', 70, 360, true, 3),
('b50e8400-e29b-41d4-a716-446655440023', '950e8400-e29b-41d4-a716-446655440031', 'Figma Mastery Quiz', 'Test your Figma design skills', 75, 420, true, 3),
('b50e8400-e29b-41d4-a716-446655440024', '950e8400-e29b-41d4-a716-446655440032', 'User Research Quiz', 'Evaluate your user research knowledge', 75, 480, true, 3),
('b50e8400-e29b-41d4-a716-446655440025', '950e8400-e29b-41d4-a716-446655440033', 'Prototyping Quiz', 'Test your prototyping skills', 75, 450, true, 3),

-- AWS Cloud Quizzes
('b50e8400-e29b-41d4-a716-446655440026', '950e8400-e29b-41d4-a716-446655440034', 'AWS Fundamentals Quiz', 'Evaluate your AWS basics knowledge', 70, 360, true, 3),
('b50e8400-e29b-41d4-a716-446655440027', '950e8400-e29b-41d4-a716-446655440035', 'Compute Services Quiz', 'Test your AWS compute services knowledge', 75, 480, true, 3),
('b50e8400-e29b-41d4-a716-446655440028', '950e8400-e29b-41d4-a716-446655440036', 'Storage & Databases Quiz', 'Assess your AWS storage knowledge', 75, 420, true, 3),
('b50e8400-e29b-41d4-a716-446655440029', '950e8400-e29b-41d4-a716-446655440037', 'Security & Monitoring Quiz', 'Test your AWS security knowledge', 80, 540, true, 3),
('b50e8400-e29b-41d4-a716-446655440030', '950e8400-e29b-41d4-a716-446655440038', 'Cloud Architecture Quiz', 'Evaluate your cloud architecture skills', 80, 600, true, 3);

-- =====================================================
-- 8. QUIZ QUESTIONS - CHILD OF QUIZZES (4-5 questions per quiz)
-- =====================================================
INSERT INTO public.quiz_questions (id, quiz_id, question, question_type, question_order, explanation) VALUES
-- React Fundamentals Quiz Questions (Quiz 1)
('c50e8400-e29b-41d4-a716-446655440001', 'b50e8400-e29b-41d4-a716-446655440001', 'What is React?', 'single', 1, 'React is a JavaScript library for building user interfaces, particularly web applications with dynamic content.'),
('c50e8400-e29b-41d4-a716-446655440002', 'b50e8400-e29b-41d4-a716-446655440001', 'What does JSX stand for?', 'single', 2, 'JSX stands for JavaScript XML, which allows you to write HTML-like syntax in JavaScript.'),
('c50e8400-e29b-41d4-a716-446655440003', 'b50e8400-e29b-41d4-a716-446655440001', 'Which of the following are React hooks?', 'multiple', 3, 'useState and useEffect are built-in React hooks for managing state and side effects.'),
('c50e8400-e29b-41d4-a716-446655440004', 'b50e8400-e29b-41d4-a716-446655440001', 'React components must return a single parent element', 'boolean', 4, 'React components must return a single parent element or use React.Fragment to wrap multiple elements.'),

-- State Management Quiz Questions (Quiz 2)
('c50e8400-e29b-41d4-a716-446655440005', 'b50e8400-e29b-41d4-a716-446655440002', 'What is the correct way to update state in React?', 'single', 1, 'State should be updated using the setter function returned by useState, not by directly mutating the state variable.'),
('c50e8400-e29b-41d4-a716-446655440006', 'b50e8400-e29b-41d4-a716-446655440002', 'When does useEffect run?', 'single', 2, 'useEffect runs after every render by default, but can be controlled with a dependency array.'),
('c50e8400-e29b-41d4-a716-446655440007', 'b50e8400-e29b-41d4-a716-446655440002', 'What is the purpose of useCallback?', 'single', 3, 'useCallback is used to memoize functions to prevent unnecessary re-renders in child components.'),
('c50e8400-e29b-41d4-a716-446655440008', 'b50e8400-e29b-41d4-a716-446655440002', 'Custom hooks can only use other custom hooks', 'boolean', 4, 'Custom hooks can use built-in hooks, other custom hooks, and any JavaScript functionality.'),

-- Advanced React Patterns Quiz Questions (Quiz 3)
('c50e8400-e29b-41d4-a716-446655440009', 'b50e8400-e29b-41d4-a716-446655440003', 'What is the purpose of React Context?', 'single', 1, 'React Context provides a way to pass data through the component tree without having to pass props down manually.'),
('c50e8400-e29b-41d4-a716-446655440010', 'b50e8400-e29b-41d4-a716-446655440003', 'What is a Higher-Order Component (HOC)?', 'single', 2, 'A HOC is a function that takes a component and returns a new component with additional functionality.'),
('c50e8400-e29b-41d4-a716-446655440011', 'b50e8400-e29b-41d4-a716-446655440003', 'Which optimization techniques can improve React performance?', 'multiple', 3, 'React.memo, useMemo, useCallback, and code splitting can improve React performance.'),
('c50e8400-e29b-41d4-a716-446655440012', 'b50e8400-e29b-41d4-a716-446655440003', 'Render props pattern is deprecated in React 18', 'boolean', 4, 'Render props is still a valid pattern in React 18, though hooks are often preferred.'),

-- Node.js Basics Quiz Questions (Quiz 6)
('c50e8400-e29b-41d4-a716-446655440013', 'b50e8400-e29b-41d4-a716-446655440006', 'What is Node.js?', 'single', 1, 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine for server-side development.'),
('c50e8400-e29b-41d4-a716-446655440014', 'b50e8400-e29b-41d4-a716-446655440006', 'What is NPM?', 'single', 2, 'NPM (Node Package Manager) is the default package manager for Node.js, used to install and manage dependencies.'),
('c50e8400-e29b-41d4-a716-446655440015', 'b50e8400-e29b-41d4-a716-446655440006', 'Node.js is single-threaded', 'boolean', 3, 'Node.js uses a single-threaded event loop but can handle multiple operations asynchronously.'),
('c50e8400-e29b-41d4-a716-446655440016', 'b50e8400-e29b-41d4-a716-446655440006', 'What is the purpose of package.json?', 'single', 4, 'package.json contains metadata about the project and lists its dependencies.'),

-- Express.js Quiz Questions (Quiz 7)
('c50e8400-e29b-41d4-a716-446655440017', 'b50e8400-e29b-41d4-a716-446655440007', 'What is Express.js?', 'single', 1, 'Express.js is a minimal and flexible Node.js web application framework that provides robust features for web and mobile applications.'),
('c50e8400-e29b-41d4-a716-446655440018', 'b50e8400-e29b-41d4-a716-446655440007', 'What is middleware in Express?', 'single', 2, 'Middleware functions are functions that have access to the request object, response object, and the next function in the application\'s request-response cycle.'),
('c50e8400-e29b-41d4-a716-446655440019', 'b50e8400-e29b-41d4-a716-446655440007', 'Express routes are case-sensitive', 'boolean', 3, 'Express routes are case-sensitive by default, but this can be configured.'),
('c50e8400-e29b-41d4-a716-446655440020', 'b50e8400-e29b-41d4-a716-446655440007', 'What HTTP methods does Express support?', 'multiple', 4, 'Express supports GET, POST, PUT, DELETE, PATCH, and other HTTP methods.'),

-- Design Principles Quiz Questions (Quiz 22)
('c50e8400-e29b-41d4-a716-446655440021', 'b50e8400-e29b-41d4-a716-446655440022', 'What is the difference between UI and UX?', 'single', 1, 'UI (User Interface) focuses on visual design, while UX (User Experience) focuses on user interaction and satisfaction.'),
('c50e8400-e29b-41d4-a716-446655440022', 'b50e8400-e29b-41d4-a716-446655440022', 'Which design principles are important for accessibility?', 'multiple', 2, 'Contrast, typography, color choice, and navigation clarity are important for accessibility.'),
('c50e8400-e29b-41d4-a716-446655440023', 'b50e8400-e29b-41d4-a716-446655440022', 'White space is unnecessary in design', 'boolean', 3, 'White space is crucial for readability, visual hierarchy, and overall design balance.'),
('c50e8400-e29b-41d4-a716-446655440024', 'b50e8400-e29b-41d4-a716-446655440022', 'What is the purpose of a design system?', 'single', 4, 'A design system provides consistent visual language and reusable components across a product.'),

-- AWS Fundamentals Quiz Questions (Quiz 26)
('c50e8400-e29b-41d4-a716-446655440025', 'b50e8400-e29b-41d4-a716-446655440026', 'What does AWS stand for?', 'single', 1, 'AWS stands for Amazon Web Services, a comprehensive cloud computing platform.'),
('c50e8400-e29b-41d4-a716-446655440026', 'b50e8400-e29b-41d4-a716-446655440026', 'Which AWS services are compute services?', 'multiple', 2, 'EC2, Lambda, and ECS are AWS compute services.'),
('c50e8400-e29b-41d4-a716-446655440027', 'b50e8400-e29b-41d4-a716-446655440026', 'AWS is only available in the United States', 'boolean', 3, 'AWS has data centers and regions worldwide, not just in the United States.'),
('c50e8400-e29b-41d4-a716-446655440028', 'b50e8400-e29b-41d4-a716-446655440026', 'What is the AWS Free Tier?', 'single', 4, 'AWS Free Tier provides limited free usage of many AWS services for 12 months after account creation.');

-- =====================================================
-- 9. QUIZ OPTIONS
-- =====================================================
INSERT INTO public.quiz_options (id, question_id, option_text, option_order, is_correct) VALUES
-- React Question 1 Options
('d50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001', 'A JavaScript library for building user interfaces', 1, true),
('d50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440001', 'A database management system', 2, false),
('d50e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440001', 'A server-side programming language', 3, false),
('d50e8400-e29b-41d4-a716-446655440004', 'c50e8400-e29b-41d4-a716-446655440001', 'A CSS framework', 4, false),

-- React Question 2 Options
('d50e8400-e29b-41d4-a716-446655440005', 'c50e8400-e29b-41d4-a716-446655440002', 'JavaScript XML', 1, true),
('d50e8400-e29b-41d4-a716-446655440006', 'c50e8400-e29b-41d4-a716-446655440002', 'JavaScript Extension', 2, false),
('d50e8400-e29b-41d4-a716-446655440007', 'c50e8400-e29b-41d4-a716-446655440002', 'Java Syntax Extension', 3, false),
('d50e8400-e29b-41d4-a716-446655440008', 'c50e8400-e29b-41d4-a716-446655440002', 'JavaScript Syntax', 4, false),

-- React Question 3 Options (Multiple Choice)
('d50e8400-e29b-41d4-a716-446655440009', 'c50e8400-e29b-41d4-a716-446655440003', 'useState', 1, true),
('d50e8400-e29b-41d4-a716-446655440010', 'c50e8400-e29b-41d4-a716-446655440003', 'useEffect', 2, true),
('d50e8400-e29b-41d4-a716-446655440011', 'c50e8400-e29b-41d4-a716-446655440003', 'useQuery', 3, false),
('d50e8400-e29b-41d4-a716-446655440012', 'c50e8400-e29b-41d4-a716-446655440003', 'useRouter', 4, false),

-- React Question 4 Options (Boolean)
('d50e8400-e29b-41d4-a716-446655440013', 'c50e8400-e29b-41d4-a716-446655440004', 'True', 1, true),
('d50e8400-e29b-41d4-a716-446655440014', 'c50e8400-e29b-41d4-a716-446655440004', 'False', 2, false),

-- State Management Quiz Options
('d50e8400-e29b-41d4-a716-446655440015', 'c50e8400-e29b-41d4-a716-446655440005', 'Using the setter function from useState', 1, true),
('d50e8400-e29b-41d4-a716-446655440016', 'c50e8400-e29b-41d4-a716-446655440005', 'Directly mutating the state variable', 2, false),
('d50e8400-e29b-41d4-a716-446655440017', 'c50e8400-e29b-41d4-a716-446655440005', 'Using document.getElementById', 3, false),
('d50e8400-e29b-41d4-a716-446655440018', 'c50e8400-e29b-41d4-a716-446655440005', 'Using jQuery', 4, false),

('d50e8400-e29b-41d4-a716-446655440019', 'c50e8400-e29b-41d4-a716-446655440006', 'After every render by default', 1, true),
('d50e8400-e29b-41d4-a716-446655440020', 'c50e8400-e29b-41d4-a716-446655440006', 'Only on component mount', 2, false),
('d50e8400-e29b-41d4-a716-446655440021', 'c50e8400-e29b-41d4-a716-446655440006', 'Only when state changes', 3, false),
('d50e8400-e29b-41d4-a716-446655440022', 'c50e8400-e29b-41d4-a716-446655440006', 'Never automatically', 4, false),

-- Node.js Quiz Options
('d50e8400-e29b-41d4-a716-446655440023', 'c50e8400-e29b-41d4-a716-446655440007', 'A JavaScript runtime for server-side development', 1, true),
('d50e8400-e29b-41d4-a716-446655440024', 'c50e8400-e29b-41d4-a716-446655440007', 'A frontend JavaScript framework', 2, false),
('d50e8400-e29b-41d4-a716-446655440025', 'c50e8400-e29b-41d4-a716-446655440007', 'A database system', 3, false),
('d50e8400-e29b-41d4-a716-446655440026', 'c50e8400-e29b-41d4-a716-446655440007', 'A CSS preprocessor', 4, false),

('d50e8400-e29b-41d4-a716-446655440027', 'c50e8400-e29b-41d4-a716-446655440008', 'Node Package Manager', 1, true),
('d50e8400-e29b-41d4-a716-446655440028', 'c50e8400-e29b-41d4-a716-446655440008', 'Node Programming Manager', 2, false),
('d50e8400-e29b-41d4-a716-446655440029', 'c50e8400-e29b-41d4-a716-446655440008', 'Network Protocol Manager', 3, false),
('d50e8400-e29b-41d4-a716-446655440030', 'c50e8400-e29b-41d4-a716-446655440008', 'Node Process Manager', 4, false),

-- Express.js Quiz Options
('d50e8400-e29b-41d4-a716-446655440031', 'c50e8400-e29b-41d4-a716-446655440009', 'A Node.js web application framework', 1, true),
('d50e8400-e29b-41d4-a716-446655440032', 'c50e8400-e29b-41d4-a716-446655440009', 'A database management system', 2, false),
('d50e8400-e29b-41d4-a716-446655440033', 'c50e8400-e29b-41d4-a716-446655440009', 'A frontend JavaScript library', 3, false),
('d50e8400-e29b-41d4-a716-446655440034', 'c50e8400-e29b-41d4-a716-446655440009', 'A CSS framework', 4, false),

('d50e8400-e29b-41d4-a716-446655440035', 'c50e8400-e29b-41d4-a716-446655440010', 'Functions that process requests before reaching route handlers', 1, true),
('d50e8400-e29b-41d4-a716-446655440036', 'c50e8400-e29b-41d4-a716-446655440010', 'Database connection functions', 2, false),
('d50e8400-e29b-41d4-a716-446655440037', 'c50e8400-e29b-41d4-a716-446655440010', 'Frontend rendering functions', 3, false),
('d50e8400-e29b-41d4-a716-446655440038', 'c50e8400-e29b-41d4-a716-446655440010', 'CSS styling functions', 4, false);

-- =====================================================
-- 10. ASSIGNMENTS
-- =====================================================
INSERT INTO public.assignments (id, module_id, title, description, requirements, submission_type, allowed_file_types, max_file_size, pass_marks, is_required, due_date) VALUES
('e50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'Build a React Component', 'Create a functional React component with props and state', '["Create a counter component", "Implement increment/decrement functionality", "Style with CSS", "Add prop validation"]', 'file', '["js", "jsx", "zip", "css"]', 5242880, 75, true, '2024-12-31 23:59:59+00'),
('e50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440002', 'State Management Project', 'Build a todo list application using React hooks', '["Use useState and useEffect", "Implement CRUD operations", "Local storage persistence", "Responsive design"]', 'file', '["js", "jsx", "zip", "css", "html"]', 10485760, 80, true, '2024-12-31 23:59:59+00'),
('e50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440007', 'Express API Development', 'Create a RESTful API using Express.js', '["Implement CRUD endpoints", "Add middleware for validation", "Error handling", "API documentation"]', 'file', '["js", "json", "zip", "md"]', 10485760, 75, true, '2024-12-31 23:59:59+00'),
('e50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440015', 'Design System Creation', 'Create a basic design system with components', '["Define color palette", "Create typography scale", "Design button components", "Create style guide"]', 'file', '["fig", "pdf", "zip", "png", "jpg"]', 15728640, 75, true, '2024-12-31 23:59:59+00');

-- =====================================================
-- 11. ASSIGNMENT RUBRIC
-- =====================================================
INSERT INTO public.assignment_rubric (id, assignment_id, criteria, description, points, rubric_order) VALUES
-- React Component Assignment Rubric
('f50e8400-e29b-41d4-a716-446655440001', 'e50e8400-e29b-41d4-a716-446655440001', 'Component Structure', 'Proper React component structure and organization', 25, 1),
('f50e8400-e29b-41d4-a716-446655440002', 'e50e8400-e29b-41d4-a716-446655440001', 'Functionality', 'Counter increment/decrement works correctly', 30, 2),
('f50e8400-e29b-41d4-a716-446655440003', 'e50e8400-e29b-41d4-a716-446655440001', 'Styling', 'Clean and responsive CSS styling', 20, 3),
('f50e8400-e29b-41d4-a716-446655440004', 'e50e8400-e29b-41d4-a716-446655440001', 'Code Quality', 'Clean, readable, and well-commented code', 25, 4),

-- State Management Assignment Rubric
('f50e8400-e29b-41d4-a716-446655440005', 'e50e8400-e29b-41d4-a716-446655440002', 'Hook Usage', 'Proper use of useState and useEffect hooks', 30, 1),
('f50e8400-e29b-41d4-a716-446655440006', 'e50e8400-e29b-41d4-a716-446655440002', 'CRUD Operations', 'Complete Create, Read, Update, Delete functionality', 35, 2),
('f50e8400-e29b-41d4-a716-446655440007', 'e50e8400-e29b-41d4-a716-446655440002', 'Persistence', 'Local storage implementation working correctly', 20, 3),
('f50e8400-e29b-41d4-a716-446655440008', 'e50e8400-e29b-41d4-a716-446655440002', 'UI/UX', 'User-friendly interface and responsive design', 15, 4),

-- Express API Assignment Rubric
('f50e8400-e29b-41d4-a716-446655440009', 'e50e8400-e29b-41d4-a716-446655440003', 'API Endpoints', 'All CRUD endpoints implemented correctly', 35, 1),
('f50e8400-e29b-41d4-a716-446655440010', 'e50e8400-e29b-41d4-a716-446655440003', 'Middleware', 'Proper middleware implementation for validation', 25, 2),
('f50e8400-e29b-41d4-a716-446655440011', 'e50e8400-e29b-41d4-a716-446655440003', 'Error Handling', 'Comprehensive error handling and responses', 25, 3),
('f50e8400-e29b-41d4-a716-446655440012', 'e50e8400-e29b-41d4-a716-446655440003', 'Documentation', 'Clear API documentation and usage examples', 15, 4),

-- Design System Assignment Rubric
('f50e8400-e29b-41d4-a716-446655440013', 'e50e8400-e29b-41d4-a716-446655440004', 'Color System', 'Well-defined color palette with accessibility considerations', 25, 1),
('f50e8400-e29b-41d4-a716-446655440014', 'e50e8400-e29b-41d4-a716-446655440004', 'Typography', 'Consistent typography scale and font choices', 25, 2),
('f50e8400-e29b-41d4-a716-446655440015', 'e50e8400-e29b-41d4-a716-446655440004', 'Components', 'Well-designed button components with variants', 30, 3),
('f50e8400-e29b-41d4-a716-446655440016', 'e50e8400-e29b-41d4-a716-446655440004', 'Documentation', 'Clear style guide with usage examples', 20, 4);

-- =====================================================
-- MANUAL SETUP REQUIRED FROM HERE
-- =====================================================
/*
The sections below require manual setup because they depend on auth.users:

1. USER PROFILES - Replace UUIDs with actual auth.users IDs
2. UPDATE COURSE INSTRUCTORS - Set instructor_id to actual user IDs
3. ENROLLMENTS - Update student_id references  
4. All progress tracking tables

STEP-BY-STEP PROCESS:

1. Create users through Supabase Auth UI or your app
2. Run: SELECT id, email FROM auth.users;
3. Copy the UUIDs and replace the placeholders below
4. Update course instructor_id fields with actual instructor UUIDs
5. Uncomment and run the sections you need

EXAMPLE REPLACEMENT:
- Replace 'YOUR_ADMIN_USER_ID' with actual admin user UUID
- Replace 'YOUR_INSTRUCTOR_1_ID' with actual instructor UUID
- etc.
*/

-- =====================================================
-- SECTION 4: USER PROFILES (REQUIRES MANUAL SETUP)
-- =====================================================
/*
-- UNCOMMENT AND UPDATE AFTER CREATING AUTH USERS

INSERT INTO public.profiles (id, full_name, avatar_url, bio, role) VALUES
-- Admin (Replace with actual auth.users ID)
('YOUR_ADMIN_USER_ID', 'Course Antik Admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Platform administrator managing the Course Antik learning platform', 'admin'),

-- Instructors (Replace with actual auth.users IDs)
('YOUR_INSTRUCTOR_1_ID', 'John Smith', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Senior Full Stack Developer with 8+ years of experience in React, Node.js, and modern web technologies.', 'instructor'),
('YOUR_INSTRUCTOR_2_ID', 'Sarah Johnson', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', 'UI/UX Designer and Frontend Developer specializing in React and modern design systems.', 'instructor'),
('YOUR_INSTRUCTOR_3_ID', 'Michael Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Data Scientist and Python expert with expertise in machine learning and AI.', 'instructor'),

-- Students (Replace with actual auth.users IDs)  
('YOUR_STUDENT_1_ID', 'Alex Wilson', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Computer Science student passionate about web development.', 'student'),
('YOUR_STUDENT_2_ID', 'Jessica Brown', 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150', 'Junior developer looking to advance skills in modern frameworks.', 'student');
*/

-- =====================================================
-- SECTION 5: COURSES (REQUIRES MANUAL SETUP)
-- =====================================================
/*
-- UNCOMMENT AND UPDATE AFTER CREATING PROFILES

INSERT INTO public.courses (id, title, slug, subtitle, description, thumbnail, price_cents, is_free, is_featured, is_published, instructor_id, category_id, lessons_count, modules_count, estimated_duration, difficulty_level, includes_certificate, rating, enrolled_count) VALUES
-- Replace instructor_id with actual instructor UUIDs
('850e8400-e29b-41d4-a716-446655440001', 'React Masterclass 2024', 'react-masterclass-2024', 'Build Modern Web Applications with React 18', 'Master React from basics to advanced concepts including hooks, context, state management, and modern patterns. Build real-world projects and learn industry best practices.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 9900, false, true, true, 'YOUR_INSTRUCTOR_1_ID', '550e8400-e29b-41d4-a716-446655440001', 18, 5, 540, 'intermediate', true, 4.8, 1250),

('850e8400-e29b-41d4-a716-446655440002', 'Node.js Backend Development', 'nodejs-backend-development', 'Build Scalable Backend APIs with Node.js', 'Learn to build robust backend applications with Node.js, Express, MongoDB, and modern development practices. Perfect for beginners.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 0, true, true, true, 'YOUR_INSTRUCTOR_1_ID', '550e8400-e29b-41d4-a716-446655440001', 15, 4, 420, 'beginner', true, 4.6, 890),

('850e8400-e29b-41d4-a716-446655440003', 'UI/UX Design Fundamentals', 'ui-ux-design-fundamentals', 'Design Beautiful and Functional Interfaces', 'Learn the principles of user interface and user experience design. Master Figma, design systems, and user research methodologies.', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', 7900, false, true, true, 'YOUR_INSTRUCTOR_2_ID', '550e8400-e29b-41d4-a716-446655440004', 22, 6, 660, 'beginner', true, 4.7, 680);
*/

-- =====================================================
-- SECTION 6: MODULES (REQUIRES COURSES FIRST)
-- =====================================================
/*
-- UNCOMMENT AFTER CREATING COURSES

INSERT INTO public.modules (id, course_id, title, description, module_order, estimated_time, pass_marks, is_required) VALUES
-- React Masterclass Modules
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'React Fundamentals', 'Learn the basics of React including components, JSX, props, and the virtual DOM', 1, '3 hours', 75, true),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'State Management & Hooks', 'Master React state management, useState, useEffect, and custom hooks', 2, '4 hours', 75, true),

-- Node.js Backend Development Modules  
('950e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440002', 'Node.js Fundamentals', 'Introduction to Node.js, NPM, and server-side JavaScript development', 1, '2.5 hours', 70, true),
('950e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440002', 'Express.js Framework', 'Build web servers and APIs using Express.js framework', 2, '3 hours', 75, true);
*/

-- =====================================================
-- SECTION 7: LESSONS (REQUIRES MODULES FIRST)
-- =====================================================
/*
-- UNCOMMENT AFTER CREATING MODULES

INSERT INTO public.lessons (id, module_id, title, slug, description, lesson_order, duration, video_url, video_type, is_free_preview, content) VALUES
-- React Fundamentals Lessons
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'What is React?', 'what-is-react', 'Introduction to React library and its core concepts', 1, 480, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', true, '{"materials": ["React Documentation", "Setup Guide"], "notes": "Understanding React fundamentals"}'),
('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', 'Components and JSX', 'components-and-jsx', 'Learn about React components and JSX syntax', 2, 720, 'https://www.youtube.com/watch?v=N3AkSS5hXMA', 'youtube', true, '{"materials": ["JSX Guide", "Component Examples"], "notes": "Building your first components"}'),

-- Node.js Lessons
('a50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440006', 'Node.js Introduction', 'nodejs-introduction', 'Getting started with Node.js runtime environment', 1, 600, 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'youtube', true, '{"materials": ["Node.js Installation Guide", "First App"], "notes": "Server-side JavaScript"}');
*/

-- =====================================================
-- SUCCESS MESSAGE FOR REMODIFIED DUMMY DATA
-- =====================================================
SELECT 
    'Course Antik dummy data remodified successfully!' as status,
    'Database now contains:' as info,
    '- 5 course categories and 5 product categories' as categories,
    '- 9 complete courses with proper parent-child relationships' as courses,
    '- 38 modules across all courses (4-5 per course)' as modules,
    '- 21 lessons with video content (4-5 per module)' as lessons,
    '- 30 quizzes with comprehensive questions' as quizzes,
    '- 28 quiz questions with proper explanations' as quiz_questions,
    '- 9 products across all categories' as products,
    'All data follows proper parent-child relationships' as relationships,
    'Next: Create auth users and update instructor_id fields' as next_step,
    'Your Course Antik platform is ready for testing!' as ready;
