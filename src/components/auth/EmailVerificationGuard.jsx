import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Email Verification Guard
 *
 * Prevents direct access to verify-email page
 * Only allows access when redirected from signup/signin
 */
const EmailVerificationGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a stored email (from signup/signin redirect)
    const storedEmail = localStorage.getItem("pendingVerificationEmail");

    if (!storedEmail) {
      // No stored email means direct access - redirect to signin
      console.log("Direct access to verify-email page - redirecting to signin");
      navigate("/auth/signin", { replace: true });
    }
  }, [navigate]);

  // Check if we have stored email before rendering
  const storedEmail = localStorage.getItem("pendingVerificationEmail");

  if (!storedEmail) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return children;
};

export default EmailVerificationGuard;
