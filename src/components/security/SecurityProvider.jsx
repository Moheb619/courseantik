import React, { createContext, useContext, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useEnhancedAuth } from "../../hooks/useEnhancedAuth";
import { supabase } from "../../lib/supabase";

/**
 * Security Context for application-wide security features
 */
const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within SecurityProvider");
  }
  return context;
};

/**
 * Security Provider Component
 *
 * Provides application-wide security features:
 * - Session monitoring
 * - Suspicious activity detection
 * - Security event logging
 * - Real-time security updates
 */
export const SecurityProvider = ({ children }) => {
  const { user, isAuthenticated } = useEnhancedAuth();
  const [securityEvents, setSecurityEvents] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);

  // Monitor session activity
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastActivity = Date.now();
    let inactivityTimer;

    const updateActivity = () => {
      lastActivity = Date.now();
      clearTimeout(inactivityTimer);

      // Set inactivity timer (30 minutes)
      inactivityTimer = setTimeout(() => {
        logSecurityEvent("session_timeout", {
          userId: user?.id,
          lastActivity: new Date(lastActivity).toISOString(),
        });
      }, 30 * 60 * 1000);
    };

    // Track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    updateActivity(); // Initialize

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearTimeout(inactivityTimer);
    };
  }, [isAuthenticated, user]);

  // Monitor for suspicious login patterns
  useEffect(() => {
    if (!user) return;

    const checkSuspiciousActivity = async () => {
      try {
        // Check for multiple recent login attempts
        const { data: recentAttempts } = await supabase
          .from("auth_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("event", "signin")
          .gte(
            "created_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          )
          .order("created_at", { ascending: false });

        if (recentAttempts && recentAttempts.length > 10) {
          setSuspiciousActivity(true);
          logSecurityEvent("suspicious_login_pattern", {
            userId: user.id,
            attemptCount: recentAttempts.length,
          });
        }
      } catch (error) {
        console.error("Security check error:", error);
      }
    };

    checkSuspiciousActivity();
  }, [user]);

  // Log security events
  const logSecurityEvent = async (eventType, metadata = {}) => {
    const event = {
      id: crypto.randomUUID(),
      type: eventType,
      userId: user?.id,
      timestamp: new Date().toISOString(),
      metadata,
      userAgent: navigator.userAgent,
      ip: await getClientIP(),
    };

    setSecurityEvents((prev) => [event, ...prev.slice(0, 99)]); // Keep last 100 events

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log("🔒 Security Event:", event);
    }

    // In production, you might want to send this to a security monitoring service
    if (import.meta.env.PROD) {
      // Send to security monitoring service
      // await sendToSecurityService(event);
    }
  };

  // Get client IP (for logging purposes)
  const getClientIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch {
      return "unknown";
    }
  };

  // Security actions
  const securityActions = {
    logSecurityEvent,

    // Force logout on security breach
    forceLogout: async (reason = "security_breach") => {
      logSecurityEvent("forced_logout", { reason });
      await supabase.auth.signOut();
    },

    // Report suspicious activity
    reportSuspiciousActivity: (details) => {
      logSecurityEvent("suspicious_activity_reported", details);
      setSuspiciousActivity(true);
    },

    // Clear security alerts
    clearSecurityAlerts: () => {
      setSuspiciousActivity(false);
    },

    // Get security events
    getSecurityEvents: () => securityEvents,
  };

  const value = {
    securityEvents,
    suspiciousActivity,
    ...securityActions,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
      {/* Security Alert Modal */}
      {suspiciousActivity && (
        <SecurityAlert onDismiss={() => setSuspiciousActivity(false)} />
      )}
    </SecurityContext.Provider>
  );
};

/**
 * Security Alert Component
 */
const SecurityAlert = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Security Alert</h3>
            <p className="text-sm text-neutral-600">
              Unusual activity detected
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-neutral-700 mb-4">
            We've detected unusual activity on your account. Please review your
            recent activity and ensure your account is secure.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Recommended actions:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
              <li>Change your password</li>
              <li>Review recent login activity</li>
              <li>Enable two-factor authentication</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onDismiss();
              // Navigate to security settings
              window.location.href = "/account/security";
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Review Security
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityProvider;
