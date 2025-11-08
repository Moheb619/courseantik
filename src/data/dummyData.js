// Dummy data for development - will be replaced with Supabase data later

export const dummyCourses = [
  {
    id: '1',
    slug: 'react-masterclass',
    title: 'React Masterclass 2024',
    subtitle: 'Complete React Development Course',
    description: 'Learn React from scratch to advanced concepts including hooks, context, and modern patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    priceCents: 9900,
    isFree: false,
    isFeatured: true,
    instructorNames: 'John Doe',
    lessonsCount: 24,
    modulesCount: 6,
    rating: 4.8,
    enrolledCount: 1250,
    createdAt: '2024-01-15T10:00:00Z',
    includesCertificate: true
  },
  {
    id: '2',
    slug: 'nodejs-backend',
    title: 'Node.js Backend Development',
    subtitle: 'Build Scalable APIs with Node.js',
    description: 'Master backend development with Node.js, Express, and MongoDB.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    priceCents: 0,
    isFree: true,
    isFeatured: false,
    instructorNames: 'Jane Smith',
    lessonsCount: 18,
    modulesCount: 4,
    rating: 4.6,
    enrolledCount: 890,
    createdAt: '2024-01-10T10:00:00Z',
    includesCertificate: true
  },
  {
    id: '3',
    slug: 'fullstack-javascript',
    title: 'Full Stack JavaScript',
    subtitle: 'Complete Web Development Bootcamp',
    description: 'Learn both frontend and backend development with JavaScript technologies.',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    priceCents: 14900,
    isFree: false,
    isFeatured: true,
    instructorNames: 'Mike Johnson',
    lessonsCount: 32,
    modulesCount: 8,
    rating: 4.9,
    enrolledCount: 2100,
    createdAt: '2024-01-05T10:00:00Z',
    includesCertificate: true
  },
  {
    id: '4',
    slug: 'python-data-science',
    title: 'Python for Data Science',
    subtitle: 'Data Analysis and Machine Learning',
    description: 'Learn Python programming for data analysis, visualization, and machine learning.',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop',
    priceCents: 12900,
    isFree: false,
    isFeatured: false,
    instructorNames: 'Sarah Wilson',
    lessonsCount: 28,
    modulesCount: 7,
    rating: 4.7,
    enrolledCount: 1560,
    createdAt: '2024-01-20T10:00:00Z',
    includesCertificate: true
  }
];

export const dummyProducts = [
  {
    id: '1',
    slug: 'premium-laptop-stand',
    title: 'Premium Laptop Stand',
    description: 'Ergonomic aluminum laptop stand for better posture and cooling. Features adjustable height, non-slip rubber feet, and a sleek design that complements any workspace. Perfect for improving your posture and reducing neck strain during long work sessions.',
    shortDescription: 'Adjustable height laptop stand with ergonomic design',
    priceCents: 4500,
    salePriceCents: 3500,
    categoryId: '1',
    stockQuantity: 50,
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    reviews: 156,
    createdAt: '2024-01-15T10:00:00Z',
    sizes: ['Small (13-15")', 'Medium (15-17")', 'Large (17-19")'],
    colors: ['Silver', 'Space Gray', 'Black'],
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop'
    ],
    features: [
      'Adjustable height from 6 to 12 inches',
      'Non-slip rubber feet for stability',
      'Lightweight aluminum construction',
      'Easy to assemble and disassemble',
      'Compatible with all laptop sizes',
      'Improves airflow and cooling'
    ],
    includes: [
      'Laptop stand base',
      'Adjustable height mechanism',
      'Assembly instructions',
      'Rubber feet set'
    ],
    specifications: [
      { name: 'Material', value: 'Premium Aluminum' },
      { name: 'Weight', value: '1.2 kg' },
      { name: 'Dimensions', value: '30 x 20 x 5 cm' },
      { name: 'Height Range', value: '6-12 inches' },
      { name: 'Max Load', value: '15 kg' },
      { name: 'Warranty', value: '2 Years' }
    ],
    reviewsList: [
      {
        author: 'Sarah Johnson',
        rating: 5,
        comment: 'Excellent laptop stand! Really improved my posture and the build quality is outstanding.',
        date: '2024-01-15'
      },
      {
        author: 'Mike Chen',
        rating: 4,
        comment: 'Great product, easy to adjust and very stable. Would recommend to anyone working from home.',
        date: '2024-01-10'
      }
    ],
    category: { name: 'Accessories' }
  },
  {
    id: '2',
    slug: 'wireless-keyboard',
    title: 'Wireless Mechanical Keyboard',
    description: 'Premium mechanical keyboard with wireless connectivity',
    shortDescription: 'Mechanical wireless keyboard',
    priceCents: 8900,
    createdAt: '2024-01-20T14:30:00Z',
    salePriceCents: null,
    categoryId: '1',
    stockQuantity: 25,
    isActive: true,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop'
    ],
    category: { name: 'Accessories' }
  },
  {
    id: '3',
    slug: 'coding-books-bundle',
    title: 'Coding Books Bundle',
    description: 'Complete collection of programming books for web development',
    shortDescription: 'Programming books collection',
    priceCents: 2500,
    createdAt: '2024-02-01T09:15:00Z',
    salePriceCents: 2000,
    categoryId: '2',
    stockQuantity: 100,
    isActive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
    ],
    category: { name: 'Books' }
  },
  {
    id: '4',
    slug: 'developer-t-shirt',
    title: 'Developer T-Shirt',
    description: 'Comfortable cotton t-shirt with programming humor',
    shortDescription: 'Programming themed t-shirt',
    priceCents: 1200,
    createdAt: '2024-02-10T16:45:00Z',
    salePriceCents: null,
    categoryId: '3',
    stockQuantity: 75,
    isActive: true,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop'
    ],
    category: { name: 'Merchandise' }
  }
];

export const dummyCategories = [
  {
    id: '1',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Computer and tech accessories',
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Books',
    slug: 'books',
    description: 'Programming and tech books',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'Merchandise',
    slug: 'merchandise',
    description: 'Developer merchandise and apparel',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
  }
];

export const dummyUser = {
  id: '1',
  full_name: 'John Doe',
  email: 'john@example.com',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  role: 'student',
  bio: 'Passionate learner and developer'
};


export const dummyCourseDetail = {
  id: '1',
  slug: 'react-masterclass',
  title: 'React Masterclass 2024',
  subtitle: 'Complete React Development Course',
  description: 'Learn React from scratch to advanced concepts including hooks, context, and modern patterns. This comprehensive course covers everything you need to become a React expert.',
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
  priceCents: 9900,
  isFree: false,
  includesCertificate: true,
  instructor: {
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    bio: 'Senior React Developer with 8+ years of experience. Worked at Google, Facebook, and various startups.'
  },
  curriculum: [
    {
      moduleId: '1',
      title: 'Getting Started with React',
      description: 'Introduction to React fundamentals and core concepts. Learn the basics of React, JSX, and component architecture.',
      order: 1,
      type: 'module',
      passMarks: 70,
      estimatedTime: '2 hours',
      resources: [
        {
          id: 'res1',
          title: 'React Official Documentation',
          type: 'link',
          url: 'https://react.dev',
          description: 'Official React documentation for reference'
        },
        {
          id: 'res2',
          title: 'Getting Started Guide PDF',
          type: 'file',
          url: '/files/react-getting-started.pdf',
          description: 'Comprehensive guide to React basics'
        },
        {
          id: 'res3',
          title: 'React DevTools Guide',
          type: 'pdf',
          url: '/resources/react-devtools.pdf',
          description: 'How to use React Developer Tools effectively'
        }
      ],
      lessons: [
        {
          lessonId: '1',
          title: 'What is React?',
          slug: 'what-is-react',
          description: 'Introduction to React library and its core concepts. Learn about the virtual DOM, component-based architecture, and React ecosystem.',
          order: 1,
          isFreePreview: true,
          duration: 300,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat1',
              title: 'React Introduction Slides',
              type: 'pdf',
              url: '/materials/react-intro.pdf',
              description: 'Presentation slides for this lesson'
            },
            {
              id: 'mat2',
              title: 'React vs Other Frameworks',
              type: 'pdf',
              url: '/materials/react-comparison.pdf',
              description: 'Comparison between React and other frontend frameworks'
            }
          ]
        },
        {
          lessonId: '2',
          title: 'Setting up Development Environment',
          slug: 'setup-environment',
          description: 'Install and configure React development tools including Node.js, npm, Create React App, and VS Code extensions.',
          order: 2,
          isFreePreview: true,
          duration: 600,
          videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat3',
              title: 'Environment Setup Checklist',
              type: 'pdf',
              url: '/materials/setup-checklist.pdf',
              description: 'Step-by-step setup instructions'
            },
            {
              id: 'mat4',
              title: 'VS Code Extensions for React',
              type: 'pdf',
              url: '/materials/vscode-extensions.pdf',
              description: 'Recommended VS Code extensions for React development'
            }
          ]
        },
        {
          lessonId: '3',
          title: 'Understanding JSX',
          slug: 'understanding-jsx',
          description: 'Deep dive into JSX syntax and how it differs from regular HTML. Learn about JSX expressions, attributes, and best practices.',
          order: 3,
          isFreePreview: false,
          duration: 450,
          videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat5',
              title: 'JSX Best Practices',
              type: 'pdf',
              url: '/materials/jsx-best-practices.pdf',
              description: 'Best practices for writing clean JSX code'
            }
          ]
        },
        {
          lessonId: '4',
          title: 'React Elements vs Components',
          slug: 'elements-vs-components',
          description: 'Understand the difference between React elements and components, and learn how React renders your application.',
          order: 4,
          isFreePreview: false,
          duration: 360,
          videoUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ',
          videoType: 'youtube',
          materials: []
        }
      ],
      quiz: {
        id: 'quiz1',
        title: 'React Fundamentals Quiz',
        description: 'Test your understanding of React basics including JSX, components, and React concepts',
        questions: [
          {
            id: 'q1',
            question: 'What is JSX in React?',
            type: 'single',
            options: [
              { id: 'a', text: 'A JavaScript extension', correct: true },
              { id: 'b', text: 'A CSS framework', correct: false },
              { id: 'c', text: 'A database query language', correct: false },
              { id: 'd', text: 'A testing framework', correct: false }
            ],
            explanation: 'JSX is a JavaScript extension that allows you to write HTML-like syntax in JavaScript.'
          },
          {
            id: 'q2',
            question: 'Which of the following are React features?',
            type: 'multiple',
            options: [
              { id: 'a', text: 'Virtual DOM', correct: true },
              { id: 'b', text: 'Component-based architecture', correct: true },
              { id: 'c', text: 'Server-side rendering', correct: true },
              { id: 'd', text: 'Built-in state management', correct: false }
            ],
            explanation: 'React features include Virtual DOM, component-based architecture, and server-side rendering, but state management requires additional libraries.'
          },
          {
            id: 'q3',
            question: 'What is the purpose of the Virtual DOM?',
            type: 'single',
            options: [
              { id: 'a', text: 'To store data', correct: false },
              { id: 'b', text: 'To improve performance', correct: true },
              { id: 'c', text: 'To handle events', correct: false },
              { id: 'd', text: 'To manage state', correct: false }
            ],
            explanation: 'The Virtual DOM improves performance by minimizing direct manipulation of the real DOM.'
          }
        ],
        passMarks: 70,
        timeLimit: 600, // 10 minutes
        isRequired: true,
        attempts: []
      },
      assignment: {
        id: 'assignment1',
        title: 'Build Your First React Component',
        description: 'Create a simple React component that displays a greeting message with props. This assignment will test your understanding of component creation and prop usage.',
        requirements: [
          'Create a functional React component named "Greeting"',
          'Accept "name" and "message" as props',
          'Display the greeting in a styled format',
          'Include proper JSX structure'
        ],
        submissionType: 'file', // 'text', 'file', or 'both'
        allowedFileTypes: ['.js', '.jsx', '.zip'],
        maxFileSize: 5242880, // 5MB in bytes
        passMarks: 70,
        isRequired: true,
        dueDate: '2024-03-15T23:59:59Z',
        rubric: [
          { criteria: 'Component Structure', points: 25, description: 'Proper functional component structure' },
          { criteria: 'Props Usage', points: 25, description: 'Correct implementation of props' },
          { criteria: 'JSX Implementation', points: 25, description: 'Valid and clean JSX code' },
          { criteria: 'Code Quality', points: 25, description: 'Clean, readable, and well-commented code' }
        ],
        submissions: []
      }
    },
    {
      moduleId: '2',
      title: 'React Components',
      description: 'Learn about React components, JSX syntax, and component composition patterns. Master the art of building reusable, maintainable components.',
      order: 2,
      type: 'module',
      passMarks: 80,
      estimatedTime: '3 hours',
      resources: [
        {
          id: 'res4',
          title: 'Component Design Patterns',
          type: 'link',
          url: 'https://reactpatterns.com',
          description: 'Common React component patterns'
        },
        {
          id: 'res5',
          title: 'Props vs State Cheat Sheet',
          type: 'pdf',
          url: '/resources/props-state-cheatsheet.pdf',
          description: 'Quick reference for when to use props vs state'
        }
      ],
      lessons: [
        {
          lessonId: '5',
          title: 'Creating Your First Component',
          slug: 'first-component',
          description: 'Build your first React component and understand component structure. Learn the differences between functional and class components.',
          order: 1,
          isFreePreview: false,
          duration: 450,
          videoUrl: 'https://www.youtube.com/embed/3JZ_D3ELwOQ',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat6',
              title: 'Component Template',
              type: 'code',
              url: '/materials/component-template.jsx',
              description: 'Various examples of React components'
            }
          ]
        },
        {
          lessonId: '6',
          title: 'Understanding Props',
          slug: 'understanding-props',
          description: 'Master the concept of props and how to pass data between components. Learn about prop types, default props, and prop drilling.',
          order: 2,
          isFreePreview: false,
          duration: 540,
          videoUrl: 'https://www.youtube.com/embed/7YvAYjbSS4I',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat7',
              title: 'Props Best Practices',
              type: 'pdf',
              url: '/materials/props-best-practices.pdf',
              description: 'Best practices for using props effectively'
            }
          ]
        },
        {
          lessonId: '7',
          title: 'Component Composition',
          slug: 'component-composition',
          description: 'Learn how to compose components together to build complex UIs. Understand the children prop and component composition patterns.',
          order: 3,
          isFreePreview: false,
          duration: 600,
          videoUrl: 'https://www.youtube.com/embed/8pDm_kH4YKY',
          videoType: 'youtube',
          materials: []
        },
        {
          lessonId: '8',
          title: 'Conditional Rendering',
          slug: 'conditional-rendering',
          description: 'Master conditional rendering techniques in React. Learn about ternary operators, logical AND, and when to use each approach.',
          order: 4,
          isFreePreview: false,
          duration: 420,
          videoUrl: 'https://www.youtube.com/embed/2ZphE5HcQPQ',
          videoType: 'youtube',
          materials: []
        }
      ],
      quiz: {
        id: 'quiz2',
        title: 'Components and Props Quiz',
        description: 'Test your knowledge of React components, props, and composition patterns',
        questions: [
          {
            id: 'q4',
            question: 'How do you pass data to a component?',
            type: 'single',
            options: [
              { id: 'a', text: 'Using props', correct: true },
              { id: 'b', text: 'Using state', correct: false },
              { id: 'c', text: 'Using context', correct: false },
              { id: 'd', text: 'Using refs', correct: false }
            ],
            explanation: 'Props are the primary way to pass data from parent to child components in React.'
          },
          {
            id: 'q5',
            question: 'What is the children prop?',
            type: 'single',
            options: [
              { id: 'a', text: 'A special prop for child components', correct: true },
              { id: 'b', text: 'A prop for managing state', correct: false },
              { id: 'c', text: 'A prop for handling events', correct: false },
              { id: 'd', text: 'A prop for styling', correct: false }
            ],
            explanation: 'The children prop allows you to pass components as data to other components.'
          }
        ],
        passMarks: 80,
        timeLimit: 900, // 15 minutes
        isRequired: true,
        attempts: []
      },
      assignment: {
        id: 'assignment2',
        title: 'Component Composition Project',
        description: 'Build a reusable Card component with composition patterns. Create multiple variations using the children prop and demonstrate component reusability.',
        requirements: [
          'Create a Card component that accepts children',
          'Implement CardHeader, CardBody, and CardFooter sub-components',
          'Demonstrate composition by creating 3 different card variations',
          'Include proper prop validation with PropTypes or TypeScript'
        ],
        submissionType: 'both',
        allowedFileTypes: ['.js', '.jsx', '.ts', '.tsx', '.zip'],
        maxFileSize: 10485760, // 10MB in bytes
        passMarks: 80,
        isRequired: true,
        dueDate: '2024-03-20T23:59:59Z',
        rubric: [
          { criteria: 'Component Design', points: 30, description: 'Well-designed, reusable component structure' },
          { criteria: 'Composition Patterns', points: 30, description: 'Proper use of children prop and composition' },
          { criteria: 'Code Organization', points: 20, description: 'Clean file structure and imports' },
          { criteria: 'Documentation', points: 20, description: 'Clear comments and usage examples' }
        ],
        submissions: []
      }
    },
    {
      moduleId: '3',
      title: 'React Hooks',
      description: 'Master React hooks including useState, useEffect, and custom hooks. Learn how to manage complex application state effectively.',
      order: 3,
      type: 'module',
      passMarks: 75,
      estimatedTime: '4 hours',
      resources: [
        {
          id: 'res6',
          title: 'Hooks Reference',
          type: 'link',
          url: 'https://react.dev/reference/react',
          description: 'Official React hooks documentation'
        },
        {
          id: 'res7',
          title: 'State Management Guide',
          type: 'pdf',
          url: '/resources/state-management.pdf',
          description: 'Comprehensive guide to React state management'
        }
      ],
      lessons: [
        {
          lessonId: '9',
          title: 'useState Hook',
          slug: 'usestate-hook',
          description: 'Learn how to manage component state with useState hook. Understand state updates, functional updates, and state batching.',
          order: 1,
          isFreePreview: false,
          duration: 540,
          videoUrl: 'https://www.youtube.com/embed/O6P86uwfdR0',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat8',
              title: 'useState Examples',
              type: 'code',
              url: '/materials/usestate-examples.jsx',
              description: 'Practical examples of useState hook usage'
            }
          ]
        },
        {
          lessonId: '10',
          title: 'useEffect Hook',
          slug: 'useeffect-hook',
          description: 'Understanding side effects and lifecycle methods with useEffect. Learn about dependency arrays, cleanup functions, and common patterns.',
          order: 2,
          isFreePreview: false,
          duration: 600,
          videoUrl: 'https://www.youtube.com/embed/0ZJgIjI0yv8',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat9',
              title: 'useEffect Patterns',
              type: 'pdf',
              url: '/materials/useeffect-patterns.pdf',
              description: 'Common patterns and best practices for useEffect'
            }
          ]
        },
        {
          lessonId: '11',
          title: 'Context API',
          slug: 'context-api',
          description: 'Learn how to share state across components using Context API. Understand when to use Context vs props and how to avoid performance issues.',
          order: 3,
          isFreePreview: false,
          duration: 720,
          videoUrl: 'https://www.youtube.com/embed/35lXWvCuM8o',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat10',
              title: 'Context API Examples',
              type: 'pdf',
              url: '/materials/context-examples.pdf',
              description: 'Real-world examples of Context API usage'
            }
          ]
        },
        {
          lessonId: '12',
          title: 'Custom Hooks',
          slug: 'custom-hooks',
          description: 'Learn how to create custom hooks to extract component logic into reusable functions. Understand the rules of hooks and best practices.',
          order: 4,
          isFreePreview: false,
          duration: 480,
          videoUrl: 'https://www.youtube.com/embed/6ThXsUwLWvc',
          videoType: 'youtube',
          materials: []
        }
      ],
      quiz: {
        id: 'quiz3',
        title: 'React Hooks Quiz',
        description: 'Test your understanding of React state management, hooks, and Context API',
        questions: [
          {
            id: 'q6',
            question: 'When should you use useEffect?',
            type: 'single',
            options: [
              { id: 'a', text: 'To update component state', correct: false },
              { id: 'b', text: 'To perform side effects', correct: true },
              { id: 'c', text: 'To render JSX', correct: false },
              { id: 'd', text: 'To handle events', correct: false }
            ],
            explanation: 'useEffect is used to perform side effects like data fetching, subscriptions, or manually changing the DOM.'
          },
          {
            id: 'q7',
            question: 'What is the purpose of the dependency array in useEffect?',
            type: 'single',
            options: [
              { id: 'a', text: 'To specify which props to watch', correct: false },
              { id: 'b', text: 'To control when the effect runs', correct: true },
              { id: 'c', text: 'To pass data to the effect', correct: false },
              { id: 'd', text: 'To clean up resources', correct: false }
            ],
            explanation: 'The dependency array controls when the useEffect runs by specifying which values it depends on.'
          }
        ],
        passMarks: 75,
        timeLimit: 1200, // 20 minutes
        isRequired: true,
        attempts: []
      },
      assignment: {
        id: 'assignment3',
        title: 'Custom Hook Implementation',
        description: 'Create a custom hook for data fetching with loading states, error handling, and caching. Demonstrate advanced hook patterns and state management.',
        requirements: [
          'Create a custom hook called "useFetch" for API calls',
          'Implement loading, error, and success states',
          'Add caching mechanism to avoid duplicate requests',
          'Include proper cleanup to prevent memory leaks',
          'Create a demo component that uses the custom hook'
        ],
        submissionType: 'file',
        allowedFileTypes: ['.js', '.jsx', '.ts', '.tsx', '.zip'],
        maxFileSize: 10485760, // 10MB in bytes
        passMarks: 75,
        isRequired: true,
        dueDate: '2024-03-25T23:59:59Z',
        rubric: [
          { criteria: 'Hook Implementation', points: 40, description: 'Correct custom hook structure and logic' },
          { criteria: 'State Management', points: 30, description: 'Proper handling of loading, error, and data states' },
          { criteria: 'Performance', points: 20, description: 'Efficient caching and cleanup implementation' },
          { criteria: 'Usage Example', points: 10, description: 'Clear demonstration of hook usage' }
        ],
        submissions: []
      }
    },
    {
      moduleId: '4',
      title: 'Event Handling and Forms',
      description: 'Master event handling in React and learn how to build interactive forms with controlled components and validation.',
      order: 4,
      type: 'module',
      passMarks: 75,
      estimatedTime: '2 hours',
      resources: [
        {
          id: 'res8',
          title: 'Form Validation Guide',
          type: 'pdf',
          url: '/resources/form-validation.pdf',
          description: 'Best practices for form validation in React'
        }
      ],
      lessons: [
        {
          lessonId: '13',
          title: 'Event Handling',
          slug: 'event-handling',
          description: 'Learn how to handle events in React, including synthetic events, event delegation, and common event patterns.',
          order: 1,
          isFreePreview: false,
          duration: 360,
          videoUrl: 'https://www.youtube.com/embed/7YvAYjbSS4I',
          videoType: 'youtube',
          materials: []
        },
        {
          lessonId: '14',
          title: 'Controlled Components',
          slug: 'controlled-components',
          description: 'Understand controlled vs uncontrolled components and learn how to build forms with controlled inputs.',
          order: 2,
          isFreePreview: false,
          duration: 480,
          videoUrl: 'https://www.youtube.com/embed/8pDm_kH4YKY',
          videoType: 'youtube',
          materials: [
            {
              id: 'mat11',
              title: 'Form Examples',
              type: 'pdf',
              url: '/materials/form-examples.pdf',
              description: 'Various form examples with controlled components'
            }
          ]
        },
        {
          lessonId: '15',
          title: 'Form Validation',
          slug: 'form-validation',
          description: 'Learn how to implement form validation in React, including real-time validation and error handling.',
          order: 3,
          isFreePreview: false,
          duration: 420,
          videoUrl: 'https://www.youtube.com/embed/2ZphE5HcQPQ',
          videoType: 'youtube',
          materials: []
        }
      ],
      quiz: {
        id: 'quiz4',
        title: 'Event Handling and Forms Quiz',
        description: 'Test your knowledge of event handling and form management in React',
        questions: [
          {
            id: 'q8',
            question: 'What is a controlled component?',
            type: 'single',
            options: [
              { id: 'a', text: 'A component with state', correct: false },
              { id: 'b', text: 'A component whose value is controlled by React state', correct: true },
              { id: 'c', text: 'A component that handles events', correct: false },
              { id: 'd', text: 'A component with props', correct: false }
            ],
            explanation: 'A controlled component is one whose value is controlled by React state through props.'
          }
        ],
        passMarks: 75,
        timeLimit: 600, // 10 minutes
        isRequired: true,
        attempts: []
      },
      assignment: {
        id: 'assignment4',
        title: 'Interactive Form with Validation',
        description: 'Build a complete registration form with real-time validation, error handling, and submission. Implement advanced form patterns and user experience features.',
        requirements: [
          'Create a registration form with email, password, and confirm password fields',
          'Implement real-time validation with error messages',
          'Add form submission handling with loading states',
          'Include accessibility features (ARIA labels, focus management)',
          'Style the form with proper UX patterns'
        ],
        submissionType: 'both',
        allowedFileTypes: ['.js', '.jsx', '.css', '.scss', '.zip'],
        maxFileSize: 15728640, // 15MB in bytes
        passMarks: 75,
        isRequired: true,
        dueDate: '2024-03-30T23:59:59Z',
        rubric: [
          { criteria: 'Form Functionality', points: 35, description: 'Working form with proper controlled components' },
          { criteria: 'Validation Logic', points: 30, description: 'Comprehensive validation with clear error messages' },
          { criteria: 'User Experience', points: 25, description: 'Smooth interactions and accessibility features' },
          { criteria: 'Code Quality', points: 10, description: 'Clean, organized, and maintainable code' }
        ],
        submissions: []
      }
    },
    {
      moduleId: '5',
      title: 'Routing and Navigation',
      description: 'Learn how to implement client-side routing in React applications using React Router. Master navigation patterns and route protection.',
      order: 5,
      type: 'module',
      passMarks: 80,
      estimatedTime: '2.5 hours',
      resources: [
        {
          id: 'res9',
          title: 'React Router Guide',
          type: 'pdf',
          url: '/resources/react-router.pdf',
          description: 'Complete guide to React Router'
        }
      ],
      lessons: [
        {
          lessonId: '16',
          title: 'Introduction to React Router',
          slug: 'react-router-intro',
          description: 'Learn the basics of React Router, including BrowserRouter, Routes, and Route components.',
          order: 1,
          isFreePreview: false,
          duration: 420,
          videoUrl: 'https://www.youtube.com/embed/59IXY5IDrBA',
          videoType: 'youtube',
          materials: []
        },
        {
          lessonId: '17',
          title: 'Navigation and Links',
          slug: 'navigation-links',
          description: 'Master navigation in React Router using Link, NavLink, and programmatic navigation with useNavigate.',
          order: 2,
          isFreePreview: false,
          duration: 360,
          videoUrl: 'https://www.youtube.com/embed/Ul3y1LXxzdU',
          videoType: 'youtube',
          materials: []
        },
        {
          lessonId: '18',
          title: 'Route Parameters and Query Strings',
          slug: 'route-parameters',
          description: 'Learn how to handle dynamic routes, URL parameters, and query strings in React Router.',
          order: 3,
          isFreePreview: false,
          duration: 480,
          videoUrl: 'https://www.youtube.com/embed/7YvAYjbSS4I',
          videoType: 'youtube',
          materials: []
        },
        {
          lessonId: '19',
          title: 'Protected Routes',
          slug: 'protected-routes',
          description: 'Implement route protection and authentication guards using React Router.',
          order: 4,
          isFreePreview: false,
          duration: 420,
          videoUrl: 'https://www.youtube.com/embed/8pDm_kH4YKY',
          videoType: 'youtube',
          materials: []
        }
      ],
      quiz: {
        id: 'quiz5',
        title: 'Routing and Navigation Quiz',
        description: 'Test your understanding of React Router and navigation patterns',
        questions: [
          {
            id: 'q9',
            question: 'What is the purpose of React Router?',
            type: 'single',
            options: [
              { id: 'a', text: 'To manage component state', correct: false },
              { id: 'b', text: 'To handle client-side routing', correct: true },
              { id: 'c', text: 'To manage API calls', correct: false },
              { id: 'd', text: 'To handle form validation', correct: false }
            ],
            explanation: 'React Router is used for client-side routing in single-page applications.'
          }
        ],
        passMarks: 80,
        timeLimit: 600, // 10 minutes
        isRequired: true,
        attempts: []
      },
      assignment: {
        id: 'assignment5',
        title: 'Multi-Page Application with Routing',
        description: 'Build a complete multi-page React application with navigation, route protection, and dynamic routing. Implement advanced routing patterns and navigation features.',
        requirements: [
          'Create at least 5 different pages with React Router',
          'Implement protected routes with authentication simulation',
          'Add dynamic routing with URL parameters',
          'Include navigation with active link highlighting',
          'Implement 404 error page and error boundaries'
        ],
        submissionType: 'file',
        allowedFileTypes: ['.js', '.jsx', '.css', '.scss', '.zip'],
        maxFileSize: 20971520, // 20MB in bytes
        passMarks: 80,
        isRequired: true,
        dueDate: '2024-04-05T23:59:59Z',
        rubric: [
          { criteria: 'Routing Implementation', points: 40, description: 'Proper React Router setup and usage' },
          { criteria: 'Navigation UX', points: 25, description: 'Smooth navigation and user experience' },
          { criteria: 'Route Protection', points: 20, description: 'Working authentication and route guards' },
          { criteria: 'Error Handling', points: 15, description: '404 pages and error boundary implementation' }
        ],
        submissions: []
      }
    },
    {
      moduleId: '6',
      title: 'Advanced React Patterns',
      description: 'Explore advanced React patterns including render props, higher-order components, and modern patterns with hooks.',
      order: 6,
      type: 'module',
      passMarks: 85,
      estimatedTime: '3 hours',
      resources: [
        {
          id: 'res10',
          title: 'Advanced Patterns Guide',
          type: 'pdf',
          url: '/resources/advanced-patterns.pdf',
          description: 'Advanced React patterns and techniques'
        }
      ],
      lessons: [
        {
          lessonId: '20',
          title: 'Render Props Pattern',
          slug: 'render-props',
          description: 'Learn about the render props pattern and how to use it for sharing code between components.',
          order: 1,
          isFreePreview: false,
          duration: 480,
          videoUrl: 'https://www.youtube.com/embed/BcVAq3YFiuc',
          videoType: 'youtube',
          materials: []
        },
        {
          lessonId: '21',
          title: 'Higher-Order Components',
          slug: 'higher-order-components',
          description: 'Understand higher-order components (HOCs) and how they can be used to enhance component functionality.',
          order: 2,
          isFreePreview: false,
          duration: 540,
          videoUrl: 'https://www.youtube.com/embed/rsBQj6X7UK8',
          videoType: 'youtube',
          materials: []
        },
        {
          lessonId: '22',
          title: 'Compound Components',
          slug: 'compound-components',
          description: 'Learn about compound component patterns and how to build flexible, reusable component APIs.',
          order: 3,
          isFreePreview: false,
          duration: 420,
          videoUrl: 'https://www.youtube.com/embed/hEGg-3pIHlE',
          videoType: 'youtube',
          materials: []
        },
        {
          lessonId: '23',
          title: 'Performance Optimization',
          slug: 'performance-optimization',
          description: 'Master React performance optimization techniques including React.memo, useMemo, and useCallback.',
          order: 4,
          isFreePreview: false,
          duration: 600,
          videoUrl: 'https://www.youtube.com/embed/7YvAYjbSS4I',
          videoType: 'youtube',
          materials: []
        }
      ],
      quiz: {
        id: 'quiz6',
        title: 'Advanced React Patterns Quiz',
        description: 'Test your knowledge of advanced React patterns and optimization techniques',
        questions: [
          {
            id: 'q10',
            question: 'What is the purpose of React.memo?',
            type: 'single',
            options: [
              { id: 'a', text: 'To create memoized values', correct: false },
              { id: 'b', text: 'To prevent unnecessary re-renders', correct: true },
              { id: 'c', text: 'To manage component state', correct: false },
              { id: 'd', text: 'To handle side effects', correct: false }
            ],
            explanation: 'React.memo is used to prevent unnecessary re-renders by memoizing the component.'
          }
        ],
        passMarks: 85,
        timeLimit: 900, // 15 minutes
        isRequired: true,
        attempts: []
      },
      assignment: {
        id: 'assignment6',
        title: 'Performance-Optimized React Application',
        description: 'Build a complex React application demonstrating advanced patterns, performance optimization techniques, and scalable architecture. This is the capstone project.',
        requirements: [
          'Implement at least 3 advanced React patterns (HOC, Render Props, Compound Components)',
          'Use React.memo, useMemo, and useCallback for optimization',
          'Create a scalable component architecture with proper separation of concerns',
          'Implement code splitting and lazy loading',
          'Include comprehensive testing with Jest and React Testing Library',
          'Add proper TypeScript types (optional but recommended)'
        ],
        submissionType: 'file',
        allowedFileTypes: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.zip'],
        maxFileSize: 52428800, // 50MB in bytes
        passMarks: 85,
        isRequired: true,
        dueDate: '2024-04-15T23:59:59Z',
        rubric: [
          { criteria: 'Advanced Patterns', points: 30, description: 'Proper implementation of advanced React patterns' },
          { criteria: 'Performance Optimization', points: 25, description: 'Effective use of optimization techniques' },
          { criteria: 'Architecture', points: 20, description: 'Scalable and maintainable code structure' },
          { criteria: 'Testing', points: 15, description: 'Comprehensive test coverage' },
          { criteria: 'Documentation', points: 10, description: 'Clear documentation and README' }
        ],
        submissions: []
      }
    }
  ],
  rating: 4.8,
  enrolledCount: 1250,
  createdAt: '2024-01-15T10:00:00Z'
};



// Course Assessment Data
export const dummyCourseAssessments = {
  "1": {
    id: "assessment-001",
    courseId: "1",
    title: "Is React Right for You?",
    description: "Take this quick assessment to see if this React course matches your learning goals and experience level.",
    questions: [
      {
        id: "q1",
        question: "What's your current experience level with JavaScript?",
        type: "single_choice",
        options: [
          { id: "a", text: "Beginner - I'm just starting to learn", score: 1, recommendation: "Consider starting with JavaScript basics first" },
          { id: "b", text: "Intermediate - I understand basic concepts", score: 3, recommendation: "This course is perfect for you!" },
          { id: "c", text: "Advanced - I'm comfortable with JS", score: 5, recommendation: "You might want to check our advanced React course" }
        ]
      },
      {
        id: "q2",
        question: "What's your primary goal for learning React?",
        type: "single_choice",
        options: [
          { id: "a", text: "Build personal projects", score: 2, recommendation: "Great! This course will help you build real projects" },
          { id: "b", text: "Get a job as a React developer", score: 4, recommendation: "Perfect! This course includes career-focused content" },
          { id: "c", text: "Enhance existing skills", score: 3, recommendation: "You'll find advanced patterns and best practices here" }
        ]
      },
      {
        id: "q3",
        question: "How much time can you dedicate to learning?",
        type: "single_choice",
        options: [
          { id: "a", text: "1-2 hours per week", score: 1, recommendation: "Consider our self-paced learning track" },
          { id: "b", text: "3-5 hours per week", score: 3, recommendation: "Perfect pace for this comprehensive course" },
          { id: "c", text: "5+ hours per week", score: 4, recommendation: "You'll progress quickly through this course" }
        ]
      },
      {
        id: "q4",
        question: "What type of projects interest you most?",
        type: "multiple_choice",
        options: [
          { id: "a", text: "Web applications", score: 3, recommendation: "This course focuses heavily on web app development" },
          { id: "b", text: "Mobile apps", score: 2, recommendation: "Consider our React Native course for mobile development" },
          { id: "c", text: "E-commerce sites", score: 3, recommendation: "We cover e-commerce patterns in this course" },
          { id: "d", text: "Dashboard applications", score: 3, recommendation: "Perfect! We build several dashboard projects" }
        ]
      }
    ],
    results: {
      low_score: {
        range: [0, 8],
        message: "This course might be too advanced for your current level. We recommend starting with our JavaScript Fundamentals course first.",
        recommendedCourses: ["2", "3"]
      },
      medium_score: {
        range: [9, 14],
        message: "This course is a great fit for you! You have the right foundation and goals to succeed.",
        recommendedCourses: []
      },
      high_score: {
        range: [15, 20],
        message: "You're well-prepared for this course! Consider also checking out our Advanced React Patterns course for additional challenges.",
        recommendedCourses: ["4", "5"]
      }
    }
  },
  "2": {
    id: "assessment-002",
    courseId: "2",
    title: "JavaScript Fundamentals Assessment",
    description: "Evaluate if our JavaScript course aligns with your learning objectives.",
    questions: [
      {
        id: "q1",
        question: "Have you ever written any code before?",
        type: "single_choice",
        options: [
          { id: "a", text: "No, I'm completely new to programming", score: 1, recommendation: "Perfect! This course starts from the very beginning" },
          { id: "b", text: "Yes, I know some HTML/CSS", score: 2, recommendation: "Great! You'll build on your existing knowledge" },
          { id: "c", text: "Yes, I know another programming language", score: 3, recommendation: "You'll learn JavaScript-specific concepts quickly" }
        ]
      },
      {
        id: "q2",
        question: "What do you want to build with JavaScript?",
        type: "multiple_choice",
        options: [
          { id: "a", text: "Interactive websites", score: 2, recommendation: "Perfect! We cover DOM manipulation extensively" },
          { id: "b", text: "Web applications", score: 3, recommendation: "Great foundation for React and other frameworks" },
          { id: "c", text: "Backend applications", score: 2, recommendation: "Consider our Node.js course after this one" },
          { id: "d", text: "Games", score: 1, recommendation: "We have a separate JavaScript Game Development course" }
        ]
      }
    ],
    results: {
      low_score: {
        range: [0, 3],
        message: "This course is perfect for beginners! You'll learn everything from scratch.",
        recommendedCourses: []
      },
      medium_score: {
        range: [4, 6],
        message: "Great! You have some experience and clear goals. This course will build your skills effectively.",
        recommendedCourses: ["1"]
      },
      high_score: {
        range: [7, 10],
        message: "You might find this course too basic. Consider our Intermediate JavaScript course instead.",
        recommendedCourses: ["1", "6"]
      }
    }
  }
};

// Recommended courses for assessments
export const dummyRecommendedCourses = {
  "2": {
    id: "2",
    title: "JavaScript Fundamentals",
    subtitle: "Master the basics of JavaScript programming",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    priceCents: 0,
    isFree: true,
    rating: 4.7,
    enrolledCount: 2500,
    instructor: { name: "Mike Johnson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" }
  },
  "3": {
    id: "3",
    title: "HTML & CSS Basics",
    subtitle: "Learn web development fundamentals",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    priceCents: 0,
    isFree: true,
    rating: 4.5,
    enrolledCount: 1800,
    instructor: { name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" }
  },
  "4": {
    id: "4",
    title: "Advanced React Patterns",
    subtitle: "Master advanced React concepts and patterns",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
    priceCents: 19900,
    isFree: false,
    rating: 4.9,
    enrolledCount: 850,
    instructor: { name: "Jane Smith", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" }
  },
  "5": {
    id: "5",
    title: "React Performance Optimization",
    subtitle: "Learn to build lightning-fast React applications",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    priceCents: 14900,
    isFree: false,
    rating: 4.8,
    enrolledCount: 650,
    instructor: { name: "John Doe", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" }
  },
  "6": {
    id: "6",
    title: "Intermediate JavaScript",
    subtitle: "Take your JavaScript skills to the next level",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    priceCents: 9900,
    isFree: false,
    rating: 4.6,
    enrolledCount: 1200,
    instructor: { name: "Mike Johnson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" }
  }
};

// Dummy data for enrolled courses
export const dummyEnrolledCourses = [
  {
    id: '1',
    slug: 'react-masterclass',
    title: 'React Masterclass 2024',
    instructor: 'John Doe',
    progress: 75,
    duration: '24 lessons',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    enrolledAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    slug: 'nodejs-backend',
    title: 'Node.js Backend Development',
    instructor: 'Jane Smith',
    progress: 100,
    duration: '18 lessons',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    enrolledAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    slug: 'fullstack-javascript',
    title: 'Full Stack JavaScript',
    instructor: 'Mike Johnson',
    progress: 45,
    duration: '32 lessons',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    enrolledAt: '2024-01-20T10:00:00Z'
  }
];

// Dummy data for certificates
export const dummyCertificates = [
  {
    id: 'CERT-001',
    courseTitle: 'Node.js Backend Development',
    completedDate: '2024-02-15',
    courseId: '2',
    downloadUrl: '/certificates/CERT-001.pdf',
    verificationUrl: '/certificate/verify/CERT-001'
  },
  {
    id: 'CERT-002',
    courseTitle: 'JavaScript Fundamentals',
    completedDate: '2024-01-30',
    courseId: '4',
    downloadUrl: '/certificates/CERT-002.pdf',
    verificationUrl: '/certificate/verify/CERT-002'
  }
];

// Student Progress and Module Completion Data
export const dummyStudentProgress = {
  '1': { // courseId
    '1': { // moduleId
      isUnlocked: true,
      isCompleted: false,
      quizAttempts: [
        {
          id: 'attempt1',
          score: 65,
          passed: false,
          completedAt: '2024-02-10T14:30:00Z',
          answers: {
            'q1': 'a',
            'q2': ['a', 'b'],
            'q3': 'b'
          }
        }
      ],
      assignmentSubmissions: [
        {
          id: 'submission1',
          submittedAt: '2024-02-12T16:45:00Z',
          type: 'file',
          content: null,
          files: [
            { name: 'Greeting.jsx', url: '/uploads/greeting-component.jsx', size: 1024 }
          ],
          status: 'graded',
          score: 85,
          passed: true,
          feedback: 'Excellent work! Your component structure is clean and props are used correctly. Consider adding prop validation for better code quality.',
          gradedAt: '2024-02-13T10:20:00Z',
          gradedBy: 'instructor'
        }
      ],
      lessonsCompleted: ['1', '2', '3']
    },
    '2': {
      isUnlocked: false, // Locked because module 1 is not completed
      isCompleted: false,
      quizAttempts: [],
      assignmentSubmissions: [],
      lessonsCompleted: []
    }
  }
};

// Assignment Grading Data for Admin/Tutor Interface
export const dummyAssignmentGrading = {
  'assignment1': [
    {
      id: 'submission1',
      studentId: 'student1',
      studentName: 'John Doe',
      studentEmail: 'john@example.com',
      submittedAt: '2024-02-12T16:45:00Z',
      type: 'file',
      content: null,
      files: [
        { name: 'Greeting.jsx', url: '/uploads/greeting-component.jsx', size: 1024 }
      ],
      status: 'graded',
      score: 85,
      passed: true,
      feedback: 'Excellent work! Your component structure is clean and props are used correctly.',
      gradedAt: '2024-02-13T10:20:00Z',
      gradedBy: 'instructor',
      rubricScores: [
        { criteria: 'Component Structure', score: 22 },
        { criteria: 'Props Usage', score: 23 },
        { criteria: 'JSX Implementation', score: 21 },
        { criteria: 'Code Quality', score: 19 }
      ]
    },
    {
      id: 'submission2',
      studentId: 'student2',
      studentName: 'Jane Smith',
      studentEmail: 'jane@example.com',
      submittedAt: '2024-02-14T09:30:00Z',
      type: 'file',
      content: null,
      files: [
        { name: 'MyGreeting.jsx', url: '/uploads/my-greeting-component.jsx', size: 856 }
      ],
      status: 'pending',
      score: null,
      passed: null,
      feedback: null,
      gradedAt: null,
      gradedBy: null,
      rubricScores: []
    }
  ]
};

// Module Prerequisites and Completion Requirements
export const dummyModuleRequirements = {
  '1': {
    prerequisites: [],
    completionRequirements: {
      quizRequired: true,
      quizPassMark: 70,
      assignmentRequired: true,
      assignmentPassMark: 70,
      lessonsRequired: ['1', '2', '3', '4'] // All lessons must be completed
    }
  },
  '2': {
    prerequisites: ['1'],
    completionRequirements: {
      quizRequired: true,
      quizPassMark: 80,
      assignmentRequired: true,
      assignmentPassMark: 80,
      lessonsRequired: ['5', '6', '7', '8']
    }
  },
  '3': {
    prerequisites: ['2'],
    completionRequirements: {
      quizRequired: true,
      quizPassMark: 75,
      assignmentRequired: true,
      assignmentPassMark: 75,
      lessonsRequired: ['9', '10', '11', '12']
    }
  },
  '4': {
    prerequisites: ['3'],
    completionRequirements: {
      quizRequired: true,
      quizPassMark: 75,
      assignmentRequired: true,
      assignmentPassMark: 75,
      lessonsRequired: ['13', '14', '15']
    }
  },
  '5': {
    prerequisites: ['4'],
    completionRequirements: {
      quizRequired: true,
      quizPassMark: 80,
      assignmentRequired: true,
      assignmentPassMark: 80,
      lessonsRequired: ['16', '17', '18', '19']
    }
  },
  '6': {
    prerequisites: ['5'],
    completionRequirements: {
      quizRequired: true,
      quizPassMark: 85,
      assignmentRequired: true,
      assignmentPassMark: 85,
      lessonsRequired: ['20', '21', '22', '23']
    }
  }
};

// Dummy data for orders
export const dummyOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'completed',
    total: 9900, // in cents
    items: [
      {
        name: 'React Masterclass 2024',
        type: 'course',
        price: 9900
      }
    ]
  },
  {
    id: 'ORD-002',
    date: '2024-01-20',
    status: 'completed',
    total: 14900,
    items: [
      {
        name: 'Full Stack JavaScript',
        type: 'course',
        price: 14900
      }
    ]
  },
  {
    id: 'ORD-003',
    date: '2024-02-01',
    status: 'pending',
    total: 4500,
    items: [
      {
        name: 'Premium Laptop Stand',
        type: 'product',
        price: 4500
      }
    ]
  }
];
