import { useState, useEffect } from "react";
import {
  Bell,
  BookOpen,
  CreditCard,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationApi } from "@/services/supabase/notificationApi";
import { useAuth } from "@/hooks/useAuth";

const iconMap = {
  enrollment: BookOpen,
  assignment_graded: CheckCircle2,
  payment_success: CreditCard,
  course_complete: Trophy,
  admin_action: ShieldCheck,
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const data = await notificationApi.getNotifications(user.id);
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await notificationApi.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive font-semibold">{error}</p>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Notifications 🔔</h1>
          <p className="text-muted-foreground">Stay updated on your activity</p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="rounded-xl"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No notifications</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border-[2px] transition-colors ${
                  notif.read
                    ? "bg-white border-foreground/10"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.read ? "bg-muted" : "gradient-primary"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${notif.read ? "text-muted-foreground" : "text-white"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {new Date(notif.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
