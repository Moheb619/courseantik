import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed. Please try again.");
          navigate("/signin");
          return;
        }

        if (data.session) {
          toast.success("Successfully signed in!");
          // Redirect to dashboard or intended page
          const redirectTo =
            sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
          sessionStorage.removeItem("redirectAfterAuth");
          navigate(redirectTo);
        } else {
          navigate("/signin");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Authentication failed. Please try again.");
        navigate("/signin");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Completing Sign In...
        </h2>
        <p className="text-neutral-600">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
