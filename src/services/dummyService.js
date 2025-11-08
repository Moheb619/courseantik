// Dummy service layer - mimics Supabase service but uses local data
// This will be replaced with real Supabase service later

import { 
  dummyCourses, 
  dummyProducts, 
  dummyCategories, 
  dummyUser, 
  dummyEnrolledCourses, 
  dummyCourseDetail,
  dummyOrders,
  dummyCertificates
} from '../data/dummyData';
import { formatCurrency } from '../utils/fmt';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const dummyCourseService = {
  async getCourses(filters = {}) {
    await delay();
    
    let filteredCourses = [...dummyCourses];
    
    if (filters.featured) {
      filteredCourses = filteredCourses.filter(course => course.isFeatured);
    }
    
    if (filters.free) {
      filteredCourses = filteredCourses.filter(course => course.isFree);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredCourses;
  },

  async getCourseBySlug(slug) {
    await delay();
    
    const course = dummyCourses.find(c => c.slug === slug);
    if (!course) {
      throw new Error('Course not found');
    }
    
    return dummyCourseDetail;
  },

  async checkEnrollment(courseId, userId) {
    await delay();
    
    const enrollment = dummyEnrolledCourses.find(e => 
      e.courseId === courseId && e.userId === userId
    );
    
    return !!enrollment;
  },

  async enrollInCourse(courseId, userId) {
    await delay();
    
    // Simulate enrollment
    const enrollment = {
      id: Date.now().toString(),
      courseId,
      userId,
      enrolledAt: new Date().toISOString()
    };
    
    return enrollment;
  },

  async getEnrolledCourses(userId) {
    await delay();
    return dummyEnrolledCourses;
  }
};

export const dummyProductService = {
  async getProducts(filters = {}) {
    await delay();
    
    let filteredProducts = [...dummyProducts];
    
    if (filters.category) {
      filteredProducts = filteredProducts.filter(product => 
        product.categoryId === filters.category
      );
    }
    
    if (filters.featured) {
      filteredProducts = filteredProducts.filter(product => product.isFeatured);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredProducts;
  },

  async getProductBySlug(slug) {
    await delay();
    
    const product = dummyProducts.find(p => p.slug === slug);
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  },

  async getCategories() {
    await delay();
    return dummyCategories;
  }
};

export const dummyAuthService = {
  async getCurrentUser() {
    await delay();
    // Return admin user for development - allows access to all routes
    return {
      ...dummyUser,
      role: 'admin',
      full_name: 'Admin User',
      email: 'admin@antik.com'
    };
  },

  async signUp(email, password, userData = {}) {
    await delay();
    // Return admin user for development
    const adminUser = {
      ...dummyUser,
      role: 'admin',
      full_name: userData.full_name || 'Admin User',
      email: email
    };
    return { user: adminUser, error: null };
  },

  async signIn(email, password) {
    await delay();
    // Return admin user for development
    const adminUser = {
      ...dummyUser,
      role: 'admin',
      full_name: 'Admin User',
      email: email
    };
    return { user: adminUser, error: null };
  },

  async signInWithGoogle() {
    await delay();
    // Return admin user for development
    const adminUser = {
      ...dummyUser,
      role: 'admin',
      full_name: 'Admin User',
      email: 'admin@antik.com'
    };
    return { user: adminUser, error: null };
  },

  async signOut() {
    await delay();
    return { error: null };
  }
};

export const dummyOrderService = {
  async getOrders(userId) {
    await delay();
    return dummyOrders;
  },

  async createOrder(orderData) {
    await delay();
    
    const order = {
      id: Date.now().toString(),
      orderNumber: `ORD-${Date.now()}`,
      ...orderData,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    
    return order;
  }
};

export const dummyCertificateService = {
  async getCertificates(userId) {
    await delay();
    return dummyCertificates;
  },

  async verifyCertificate(code) {
    await delay();
    
    const certificate = dummyCertificates.find(c => c.certificateCode === code);
    if (!certificate) {
      throw new Error('Certificate not found');
    }
    
    return certificate;
  }
};
