import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Settings,
  Play,
  Loader,
} from "lucide-react";
import Button from "../ui/Button";
import { config } from "../../lib/supabase";
import setupSupabase from "../../lib/setupSupabase";

const SupabaseConfig = () => {
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus("checking");
    const result = await config.checkConnection();
    setConnectionStatus(result.connected ? "connected" : "disconnected");
  };

  const runTests = async () => {
    setIsRunningTests(true);
    const results = await setupSupabase.runTests();
    setTestResults(results);
    setIsRunningTests(false);
  };

  const initializeSupabase = async () => {
    setIsRunningTests(true);
    const result = await setupSupabase.initialize();
    if (result.success) {
      await checkConnection();
      await runTests();
    }
    setIsRunningTests(false);
  };

  const copyEnvTemplate = () => {
    const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration  
VITE_APP_NAME=Course Antik
VITE_APP_URL=http://localhost:5173`;

    navigator.clipboard.writeText(envTemplate);
    alert("Environment template copied to clipboard!");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "disconnected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "checking":
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "text-green-600 bg-green-50 border-green-200";
      case "disconnected":
        return "text-red-600 bg-red-50 border-red-200";
      case "checking":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-brand-600" />
            <h1 className="text-2xl font-bold text-neutral-900">
              Supabase Configuration
            </h1>
          </div>
          <p className="text-neutral-600">
            Configure and test your Supabase database connection for Course
            Antik.
          </p>
        </div>

        {/* Connection Status */}
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Connection Status
          </h2>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(
              connectionStatus
            )}`}
          >
            {getStatusIcon(connectionStatus)}
            <span className="font-medium capitalize">
              {connectionStatus === "checking"
                ? "Checking..."
                : connectionStatus === "connected"
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={checkConnection}>
              Recheck Connection
            </Button>
            <Button
              variant="primary"
              onClick={initializeSupabase}
              disabled={isRunningTests}
            >
              {isRunningTests ? "Initializing..." : "Initialize Supabase"}
            </Button>
          </div>
        </div>

        {/* Configuration Steps */}
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Setup Instructions
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 mb-1">
                  Create Supabase Project
                </h3>
                <p className="text-sm text-neutral-600 mb-2">
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    supabase.com
                  </a>{" "}
                  and create a new project.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("https://supabase.com/dashboard", "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Supabase Dashboard
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 mb-1">
                  Run Database Schema
                </h3>
                <p className="text-sm text-neutral-600 mb-2">
                  Copy and run the SQL schema from{" "}
                  <code className="bg-neutral-100 px-1 rounded">
                    supabase_schema.sql
                  </code>{" "}
                  in your Supabase SQL Editor.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/supabase_schema.sql", "_blank")}
                >
                  <Database className="w-4 h-4 mr-1" />
                  View Schema File
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 mb-1">
                  Set Environment Variables
                </h3>
                <p className="text-sm text-neutral-600 mb-2">
                  Create a{" "}
                  <code className="bg-neutral-100 px-1 rounded">.env</code> file
                  with your Supabase credentials.
                </p>
                <Button variant="outline" size="sm" onClick={copyEnvTemplate}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy .env Template
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900 mb-1">
                  Test Integration
                </h3>
                <p className="text-sm text-neutral-600 mb-2">
                  Run tests to verify all components work with the database.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={runTests}
                  disabled={isRunningTests}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {isRunningTests ? "Running Tests..." : "Run Tests"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Test Results
            </h2>
            <div className="space-y-2">
              {Object.entries(testResults).map(([test, result]) => (
                <div
                  key={test}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <span className="font-medium text-neutral-900">{test}</span>
                  <span
                    className={`text-sm ${
                      result.includes("PASS")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Configuration */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Current Configuration
          </h2>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-neutral-700">
                  Supabase URL:
                </span>
                <p className="text-neutral-600 font-mono break-all">
                  {config.url}
                </p>
              </div>
              <div>
                <span className="font-medium text-neutral-700">
                  Environment:
                </span>
                <p className="text-neutral-600">
                  {config.isDevelopment ? "Development" : "Production"}
                </p>
              </div>
              <div>
                <span className="font-medium text-neutral-700">
                  Configuration Status:
                </span>
                <p
                  className={`font-medium ${
                    config.isConfigured ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {config.isConfigured ? "Configured" : "Not Configured"}
                </p>
              </div>
              <div>
                <span className="font-medium text-neutral-700">
                  Client Mode:
                </span>
                <p className="text-neutral-600">
                  {config.isConfigured ? "Real Supabase" : "Mock Client"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {config.isConfigured && connectionStatus === "connected" && (
          <div className="p-6 bg-green-50 border-t border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Ready to Go!</h3>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Your Supabase database is configured and ready. You can now:
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Create courses with quizzes and assignments</li>
              <li>• Test the complete student learning flow</li>
              <li>• Use admin interfaces for grading</li>
              <li>• Verify module progression gating works</li>
            </ul>
          </div>
        )}

        {/* Configuration Issues */}
        {(!config.isConfigured || connectionStatus === "disconnected") && (
          <div className="p-6 bg-red-50 border-t border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">
                Configuration Required
              </h3>
            </div>
            <p className="text-sm text-red-800 mb-3">
              Please complete the setup steps above to enable database
              functionality.
            </p>
            {!config.isConfigured && (
              <p className="text-sm text-red-800">
                <strong>Missing:</strong> Environment variables
                (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseConfig;
