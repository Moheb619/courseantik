import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

/**
 * Enhanced Auth Callback Page
 *
 * Handles OAuth callbacks with proper error handling and user feedback
 */
const EnhancedAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Processing authentication...");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Handle OAuth errors
        if (error) {
          setStatus("error");
          setMessage(errorDescription || "Authentication failed");
          return;
        }

        // Handle successful OAuth callback
        if (accessToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setStatus("error");
            setMessage("Failed to establish session");
            return;
          }

          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          // Create profile if it doesn't exist (for OAuth users)
          if (profileError && profileError.code === "PGRST116") {
            await supabase.from("profiles").insert({
              id: data.user.id,
              full_name:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                "",
              avatar_url: data.user.user_metadata?.avatar_url || "",
              role: "student", // Default role for new OAuth users
            });
          }

          setStatus("success");
          setMessage("Authentication successful! Redirecting...");

          // Start countdown for redirect
          const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                // Redirect based on user role or intended destination
                const from =
                  localStorage.getItem("auth-redirect") || "/dashboard";
                localStorage.removeItem("auth-redirect");
                navigate(from, { replace: true });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return;
        }

        // Handle email confirmation
        const type = searchParams.get("type");
        if (type === "signup") {
          setStatus("success");
          setMessage("Email confirmed! You can now sign in.");
          setTimeout(() => navigate("/auth/signin"), 3000);
          return;
        }

        // If we get here, something unexpected happened
        setStatus("error");
        setMessage("Invalid authentication callback");
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("Authentication failed. Please try again.");
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <div className="text-center">
            <Loader className="w-16 h-16 text-brand-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Processing Authentication
            </h1>
            <p className="text-neutral-600">{message}</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Authentication Successful!
            </h1>
            <p className="text-neutral-600 mb-4">{message}</p>
            {countdown > 0 && (
              <p className="text-sm text-neutral-500">
                Redirecting in {countdown} seconds...
              </p>
            )}
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Authentication Failed
            </h1>
            <p className="text-neutral-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/auth/signin")}
                className="w-full bg-brand-500 text-white py-2 px-4 rounded-lg hover:bg-brand-600 transition-colors"
              >
                Back to Sign In
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-neutral-100 text-neutral-700 py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAuthCallback;
