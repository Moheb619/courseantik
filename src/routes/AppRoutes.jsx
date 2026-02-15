import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import InstructorLayout from "@/layouts/InstructorLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Route Guards
import {
  ProtectedRoute,
  AdminRoute,
  InstructorRoute,
  GuestRoute,
} from "@/components/guards/RouteGuards";

// Public Pages
import HomePage from "@/features/home/pages/HomePage";
import CoursesPage from "@/features/courses/pages/CoursesPage";
import CourseDetailsPage from "@/features/courses/pages/CourseDetailsPage";
import CoursePlayerPage from "@/features/courses/pages/CoursePlayerPage";
import ProductsPage from "@/features/products/pages/ProductsPage";
import ProductDetailsPage from "@/features/products/pages/ProductDetailsPage";
import CheckoutPage from "@/features/cart/pages/CheckoutPage";

// Auth Pages
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";

// Student Pages (require login)
import MyCoursesPage from "@/features/courses/pages/MyCoursesPage";
import OrderHistoryPage from "@/features/orders/pages/OrderHistoryPage";
import MyCertificatesPage from "@/features/certificates/pages/MyCertificatesPage";
import CertificateVerifyPage from "@/features/certificates/pages/CertificateVerifyPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";

// Admin Pages (require admin role)
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import AdminCoursesPage from "@/features/admin/pages/AdminCoursesPage";
import CourseEditorPage from "@/features/admin/pages/CourseEditorPage";
import AdminProductsPage from "@/features/admin/pages/AdminProductsPage";
import ProductEditorPage from "@/features/admin/pages/ProductEditorPage";
import AdminUsersPage from "@/features/admin/pages/AdminUsersPage";
import AdminOrdersPage from "@/features/admin/pages/AdminOrdersPage";
import AdminCertificatesPage from "@/features/admin/pages/AdminCertificatesPage";
import AdminSettingsPage from "@/features/admin/pages/AdminSettingsPage";

// Instructor Pages (require instructor role)
import InstructorDashboard from "@/features/instructor/pages/InstructorDashboard";
import InstructorCoursesPage from "@/features/instructor/pages/InstructorCoursesPage";
import InstructorStudentsPage from "@/features/instructor/pages/InstructorStudentsPage";
import InstructorRevenuePage from "@/features/instructor/pages/InstructorRevenuePage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ──── Public (Main Layout) ──── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route
          path="/certificates/verify"
          element={<CertificateVerifyPage />}
        />
        <Route
          path="/certificates/verify/:code"
          element={<CertificateVerifyPage />}
        />

        {/* ── Student-only (require login) ── */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <MyCertificatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect /dashboard to /my-courses (for legacy/auth consistency) */}
        <Route
          path="/dashboard"
          element={<Navigate to="/my-courses" replace />}
        />
      </Route>

      {/* ──── Course Player (require login) ──── */}
      <Route
        path="/courses/:id/learn"
        element={
          <ProtectedRoute>
            <CoursePlayerPage />
          </ProtectedRoute>
        }
      />

      {/* ──── Auth (redirect away if already logged in) ──── */}
      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* ──── Admin (require admin role) ──── */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="courses/new" element={<CourseEditorPage />} />
        <Route path="courses/:id/edit" element={<CourseEditorPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<ProductEditorPage />} />
        <Route path="products/:id/edit" element={<ProductEditorPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="certificates" element={<AdminCertificatesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* ──── Instructor (require instructor or admin role) ──── */}
      <Route
        path="/instructor"
        element={
          <InstructorRoute>
            <InstructorLayout />
          </InstructorRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="courses" element={<InstructorCoursesPage />} />
        <Route path="students" element={<InstructorStudentsPage />} />
        <Route path="revenue" element={<InstructorRevenuePage />} />
      </Route>

      {/* ──── Catch-all ──── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
