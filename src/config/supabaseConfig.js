// ============================================================
// Supabase Config — Centralized constants
// ============================================================

/** Storage bucket name (do not create additional buckets) */
export const STORAGE_BUCKET = 'course-antik-bucket';

/** Role name constants */
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
};

/** Default delivery charges (synced with delivery_settings table) */
export const DEFAULT_DELIVERY = {
  dhaka: 60,
  outside: 120,
};

/** SSLCommerz Sandbox Config */
export const SSLCOMMERZ_CONFIG = {
  store_id: import.meta.env.VITE_SSLCOMMERZ_STORE_ID || 'antik663047567f12a',
  store_passwd: import.meta.env.VITE_SSLCOMMERZ_STORE_PASSWD || 'antik663047567f12a@ssl',
  is_live: false, // Toggle to true for production
  init_url: 'https://sandbox.sslcommerz.com/gwprocess/v3/api.php',
  validation_url: 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
};

/** Storage path builders */
export const storagePaths = {
  courseTrailer: (courseId) => `courses/${courseId}/trailer`,
  moduleVideo: (courseId, moduleId) => `courses/${courseId}/modules/${moduleId}/videos`,
  moduleResources: (courseId, moduleId) => `courses/${courseId}/modules/${moduleId}/resources`,
  assignmentSubmission: (courseId, moduleId, assignmentId, studentId) =>
    `courses/${courseId}/modules/${moduleId}/assignments/${assignmentId}/submissions/${studentId}`,
  certificate: () => `certificates`,
  avatar: (role) => `avatars/${role}s`,
  product: (productId) => `products/${productId}`,
  productImages: (productId) => `products/${productId}/images`,
  productThumbnails: (productId) => `products/${productId}/thumbnails`,
  banners: () => `misc/banners`,
};
