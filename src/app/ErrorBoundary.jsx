import React from "react";
import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Button from "../components/ui/Button";

const ErrorBoundary = () => {
  const error = useRouteError();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-error-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-neutral-600 mb-6">
            {error?.message ||
              "An unexpected error occurred. Please try again."}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleRefresh}
            variant="primary"
            fullWidth
            className="flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Link to="/">
            <Button
              variant="outline"
              fullWidth
              className="flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {import.meta.env.DEV && error?.stack && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-neutral-600 hover:text-neutral-900">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-4 bg-neutral-100 rounded-lg text-xs text-neutral-700 overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
