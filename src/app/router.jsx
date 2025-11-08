import React from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import EnhancedProtectedRoute, {
  AdminRoute,
  InstructorRoute,
} from "./EnhancedProtectedRoute";
import ErrorBoundary from "./ErrorBoundary";

// Layout
import Layout from "../components/layout/Layout";

// Pages
import Home from "../features/home/pages/Home";
import Courses from "../features/courses/pages/Courses";
import CourseDetail from "../features/courses/pages/CourseDetail";
import StudentLearningPage from "../features/courses/pages/StudentLearningPage";
import LessonPlayer from "../features/courses/pages/LessonPlayer";
import QuizGate from "../features/courses/pages/QuizGate";

import Shop from "../features/shop/pages/Shop";
import ProductDetail from "../features/shop/pages/ProductDetail";
import Cart from "../features/shop/pages/Cart";
import Checkout from "../features/shop/pages/Checkout";
import Orders from "../features/shop/pages/Orders";

import UserDashboard from "../features/dashboards/pages/UserDashboard";
import RoleDashboard from "../features/dashboards/pages/RoleDashboard";
import EnhancedStudentDashboard from "../features/dashboards/pages/EnhancedStudentDashboard";
import EnhancedAdminDashboard from "../features/dashboards/pages/EnhancedAdminDashboard";
import ComprehensiveAdminDashboard from "../features/dashboards/pages/ComprehensiveAdminDashboard";
import EnhancedTeacherDashboard from "../features/dashboards/pages/EnhancedTeacherDashboard";
import Certificates from "../features/dashboards/pages/Certificates";
import CertificateVerify from "../features/dashboards/pages/CertificateVerify";
import AdminDashboard from "../features/dashboards/pages/AdminDashboard";
import TeacherDashboard from "../features/dashboards/pages/TeacherDashboard";
import TeacherEarnings from "../features/dashboards/pages/TeacherEarnings";

import SignIn from "../features/auth/pages/SignIn";
import SignUp from "../features/auth/pages/SignUp";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import Account from "../features/auth/pages/Account";
import AuthCallback from "../pages/AuthCallback";
import EnhancedAuthCallback from "../pages/EnhancedAuthCallback";
import EmailVerification from "../features/auth/pages/EmailVerification";
import EmailVerificationGuard from "../components/auth/EmailVerificationGuard";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        // Public routes
        {
          index: true,
          element: <Home />,
        },
        {
          path: "courses",
          element: <Courses />,
        },
        {
          path: "course/:slug",
          element: <CourseDetail />,
        },
        {
          path: "shop",
          element: <Shop />,
        },
        {
          path: "product/:slug",
          element: <ProductDetail />,
        },
        {
          path: "cart",
          element: <Cart />,
        },
        {
          path: "certificate/verify/:code",
          element: <CertificateVerify />,
        },

        // Protected routes
        {
          path: "course/:slug/learn",
          element: (
            <ProtectedRoute>
              <StudentLearningPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "course/:slug/lesson/:lessonSlug",
          element: (
            <ProtectedRoute>
              <LessonPlayer />
            </ProtectedRoute>
          ),
        },
        {
          path: "course/:slug/module/:moduleId/quiz",
          element: (
            <ProtectedRoute>
              <QuizGate />
            </ProtectedRoute>
          ),
        },
        {
          path: "checkout",
          element: (
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          ),
        },
        {
          path: "orders",
          element: (
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          ),
        },
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "admin",
          element: (
            <AdminRoute>
              <EnhancedAdminDashboard />
            </AdminRoute>
          ),
        },
        {
          path: "admin/comprehensive",
          element: (
            <AdminRoute>
              <ComprehensiveAdminDashboard />
            </AdminRoute>
          ),
        },
        {
          path: "teacher",
          element: (
            <InstructorRoute>
              <EnhancedTeacherDashboard />
            </InstructorRoute>
          ),
        },
        {
          path: "dashboard/certificates",
          element: (
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          ),
        },
        {
          path: "teacher/earnings",
          element: (
            <ProtectedRoute requiredRole="teacher">
              <TeacherEarnings />
            </ProtectedRoute>
          ),
        },
        {
          path: "account",
          element: (
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          ),
        },

        // Auth routes
        {
          path: "auth/signin",
          element: <SignIn />,
        },
        {
          path: "auth/signup",
          element: <SignUp />,
        },
        {
          path: "auth/verify-email",
          element: <EmailVerification />,
        },
        {
          path: "auth/forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "auth/reset-password",
          element: <ResetPassword />,
        },
        {
          path: "auth/callback",
          element: <EnhancedAuthCallback />,
        },
        {
          path: "auth/verify-email",
          element: (
            <EmailVerificationGuard>
              <EmailVerification />
            </EmailVerificationGuard>
          ),
        },

        // Checkout result routes
        {
          path: "checkout/success",
          element: <div>Payment successful!</div>,
        },
        {
          path: "checkout/fail",
          element: <div>Payment failed!</div>,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

export default router;
