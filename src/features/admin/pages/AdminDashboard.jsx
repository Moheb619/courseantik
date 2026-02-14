import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  ShoppingBag,
  DollarSign,
  Package,
  Trophy,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import { adminApi } from "@/services/supabase/adminApi";
import { certificateApi } from "@/services/supabase/certificateApi";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [certCount, setCertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData, certsData] = await Promise.allSettled([
          adminApi.getDashboardStats(),
          adminApi.getRecentActivity(),
          certificateApi.getAllCertificates(),
        ]);
        if (statsData.status === "fulfilled") setStats(statsData.value);
        if (activityData.status === "fulfilled")
          setActivity(activityData.value);
        if (certsData.status === "fulfilled")
          setCertCount(certsData.value?.length || 0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build recent activity list from data
  const recentActivityList = [];
  if (activity) {
    (activity.recentEnrollments || []).forEach((e) => {
      recentActivityList.push({
        text: `${e.profiles?.name || "A user"} enrolled in '${e.courses?.title || "a course"}'`,
        time: new Date(e.enrolled_at).toLocaleDateString(),
        type: "enrollment",
      });
    });
    (activity.recentOrders || []).forEach((o) => {
      recentActivityList.push({
        text: `New order #${o.id?.slice(0, 8)} placed by ${o.profiles?.name || "a user"} — ৳${o.total?.toLocaleString()}`,
        time: new Date(o.created_at).toLocaleDateString(),
        type: "order",
      });
    });
    // Sort by most recent
    recentActivityList.sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Dashboard 📊</h1>
        <p className="text-muted-foreground">
          Overview of Course Antik platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`৳${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Total Students"
          value={(stats?.totalUsers || 0).toLocaleString()}
          icon={Users}
          color="bg-secondary/10 text-secondary"
        />
        <StatCard
          label="Active Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
          color="bg-accent/10 text-accent"
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders || 0}
          icon={Package}
          color="bg-success/10 text-success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-2xl border-[2px] border-foreground/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Revenue Overview</h2>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="h-48 flex items-end gap-3 px-2">
            {[35, 55, 45, 70, 60, 85, 90, 75, 95, 80, 65, 100].map(
              (height, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-lg gradient-primary transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {
                      [
                        "J",
                        "F",
                        "M",
                        "A",
                        "M",
                        "J",
                        "J",
                        "A",
                        "S",
                        "O",
                        "N",
                        "D",
                      ][i]
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border-[2px] border-foreground/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Recent Activity</h2>
            <Activity className="w-5 h-5 text-secondary" />
          </div>
          <div className="space-y-4">
            {recentActivityList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              recentActivityList.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Certificates Issued"
          value={certCount}
          icon={Trophy}
          color="bg-primary/10 text-primary"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
