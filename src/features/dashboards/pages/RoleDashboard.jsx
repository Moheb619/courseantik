import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import EnhancedStudentDashboard from "./EnhancedStudentDashboard";
import EnhancedAdminDashboard from "./EnhancedAdminDashboard";
import EnhancedTeacherDashboard from "./EnhancedTeacherDashboard";

const RoleDashboard = () => {
  const { user, isLoadingUser } = useAuth();

  // Show loading while checking user role
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case "admin":
      return <EnhancedAdminDashboard />;
    case "instructor":
    case "teacher":
      return <EnhancedTeacherDashboard />;
    case "student":
    default:
      return <EnhancedStudentDashboard />;
  }
};

export default RoleDashboard;
