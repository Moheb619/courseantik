import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import Button from "../../../components/ui/Button";

const EmailVerification = () => {
  const [status, setStatus] = useState("checking"); // checking, verified, expired, error
  const [message, setMessage] = useState("Checking verification status...");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if user is already signed in and verified, redirect to dashboard
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email_confirmed_at) {
          navigate("/dashboard", { replace: true });
          return;
        }

        // First, check if we have a stored email from signup/signin
        const storedEmail = localStorage.getItem("pendingVerificationEmail");
        if (storedEmail) {
          setEmail(storedEmail);
        }

        // Check if this is a verification callback from email link
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const searchParams = new URLSearchParams(window.location.search);

        // Try hash params first, then search params
        const accessToken =
          hashParams.get("access_token") || searchParams.get("access_token");
        const refreshToken =
          hashParams.get("refresh_token") || searchParams.get("refresh_token");
        const type = hashParams.get("type") || searchParams.get("type");
        const error = hashParams.get("error") || searchParams.get("error");
        const errorDescription =
          hashParams.get("error_description") ||
          searchParams.get("error_description");

        // Handle verification errors - just show pending state
        if (error) {
          setStatus("pending");
          setMessage(
            "Please check your email and click the verification link to activate your account."
          );
          return;
        }

        // Handle successful email verification
        if (accessToken && type === "signup") {
          try {
            const { data, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (sessionError) {
              console.error("Session error:", sessionError);
              setStatus("pending");
              setMessage(
                "Please check your email and click the verification link to activate your account."
              );
              return;
            }

            if (data.user) {
              setEmail(data.user.email);
              setStatus("verified");
              setMessage("Your email has been successfully verified!");

              // Create user profile if it doesn't exist
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", data.user.id)
                .single();

              if (profileError && profileError.code === "PGRST116") {
                // Profile doesn't exist, create it
                await supabase.from("profiles").insert({
                  id: data.user.id,
                  full_name: data.user.user_metadata?.full_name || "",
                  avatar_url: data.user.user_metadata?.avatar_url || "",
                  role: "student",
                });
              }

              // Clear URL hash and localStorage to prevent re-processing
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
              localStorage.removeItem("pendingVerificationEmail");

              // Redirect to dashboard after 3 seconds
              setTimeout(() => {
                navigate("/dashboard", { replace: true });
              }, 3000);
              return;
            }
          } catch (sessionError) {
            console.error("Session setup error:", sessionError);
            setStatus("pending");
            setMessage(
              "Please check your email and click the verification link to activate your account."
            );
            return;
          }
        }

        // If no verification tokens, check current user status
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Auth error:", authError);
          setStatus("pending");
          setMessage(
            "Please check your email and click the verification link to activate your account."
          );
          return;
        }

        if (currentUser) {
          setEmail(currentUser.email);

          if (currentUser.email_confirmed_at) {
            setStatus("verified");
            setMessage("Your email has been successfully verified!");

            // Create user profile if it doesn't exist
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentUser.id)
              .single();

            if (profileError && profileError.code === "PGRST116") {
              // Profile doesn't exist, create it
              await supabase.from("profiles").insert({
                id: currentUser.id,
                full_name: currentUser.user_metadata?.full_name || "",
                avatar_url: currentUser.user_metadata?.avatar_url || "",
                role: "student",
              });
            }

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 3000);
          } else {
            setStatus("pending");
            setMessage(
              "Please check your email and click the verification link to activate your account."
            );
          }
        } else {
          // No user session - this is normal for email verification
          // Check if we have an email from localStorage (only if redirected from signup/signin)
          const storedEmail = localStorage.getItem("pendingVerificationEmail");
          if (storedEmail) {
            setEmail(storedEmail);
            setStatus("pending");
            setMessage(
              "Please check your email and click the verification link to activate your account."
            );
          } else {
            // No stored email means user accessed this page directly - redirect them away
            console.log(
              "Direct access to verify-email page without stored email - redirecting"
            );
            navigate("/auth/signin", { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error("Verification check error:", error);
        setStatus("pending");
        setMessage(
          "Please check your email and click the verification link to activate your account."
        );
      }
    };

    handleEmailVerification();
  }, [navigate]);

  const renderContent = () => {
    switch (status) {
      case "checking":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Verifying Your Account
            </h1>
            <p className="text-neutral-600">{message}</p>
          </div>
        );

      case "verified":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Email Verified Successfully!
            </h1>
            <p className="text-neutral-600 mb-6">{message}</p>
            <p className="text-sm text-neutral-500 mb-6">
              Redirecting to your dashboard in a few seconds...
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="primary"
              fullWidth
            >
              Go to Dashboard
            </Button>
          </div>
        );

      case "pending":
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              📧 Check Your Email
            </h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to complete your registration.
            </p>

            {email && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Verification email sent to:
                  </span>
                </div>
                <p className="text-lg font-semibold text-blue-900 break-all">
                  {email}
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  📧 Check your inbox and spam folder
                </p>
              </div>
            )}

            {!email && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Verification email sent to your registered email address
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  📧 Check your inbox and spam folder
                </p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Didn't receive the email?
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your spam/junk folder</li>
                      <li>Make sure the email address is correct</li>
                      <li>Wait a few minutes for delivery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => navigate("/auth/signin")}
                variant="primary"
                fullWidth
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Back to Sign In
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-500">
                Having trouble?{" "}
                <Link
                  to="/contact"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Verification Failed
            </h1>
            <p className="text-neutral-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/auth/signup")}
                variant="primary"
                fullWidth
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/auth/signin")}
                variant="outline"
                fullWidth
              >
                Sign In Instead
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="w-16 h-16 bg-brand-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
