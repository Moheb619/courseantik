import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Percent,
  Database,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../../courses/services/courseService";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";
import TeacherRevenueManager from "../../../components/admin/TeacherRevenueManager";
import UserManagementSimple from "../../../components/admin/UserManagementSimple";
import CourseManagement from "../../../components/admin/CourseManagement";
import SupabaseConfig from "../../../components/dev/SupabaseConfig";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch admin dashboard data
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => courseService.getCourses(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => courseService.getAdminDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate dashboard stats
  const totalCourses = courses.length;
  const totalStudents = dashboardStats?.totalStudents || 0;
  const totalRevenue = dashboardStats?.totalRevenue || 0;
  const pendingOrders = dashboardStats?.pendingOrders || 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "revenue", label: "Teacher Revenue", icon: Percent },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "database", label: "Database Config", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Admin Dashboard
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage your platform and monitor performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Courses
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {totalCourses}
                </p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {totalStudents.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+8% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(totalRevenue / 100)}
                </p>
                <p className="text-sm text-green-600">+15% from last month</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Pending Orders
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {pendingOrders}
                </p>
                <p className="text-sm text-orange-600">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">
                          New student enrolled
                        </h4>
                        <p className="text-sm text-neutral-600">
                          John Doe enrolled in React Masterclass
                        </p>
                      </div>
                      <div className="text-sm text-neutral-500">
                        2 hours ago
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">
                          New course published
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Advanced JavaScript Patterns
                        </p>
                      </div>
                      <div className="text-sm text-neutral-500">
                        5 hours ago
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">
                          New order received
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Order #ORD-004 for ৳9,900
                        </p>
                      </div>
                      <div className="text-sm text-neutral-500">1 day ago</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2"
                    >
                      <Plus className="w-8 h-8 text-brand-600" />
                      <span className="font-medium">Create Course</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2"
                    >
                      <Users className="w-8 h-8 text-brand-600" />
                      <span className="font-medium">Manage Users</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2"
                    >
                      <BarChart3 className="w-8 h-8 text-brand-600" />
                      <span className="font-medium">View Analytics</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && <CourseManagement />}

            {/* Users Tab */}
            {activeTab === "users" && <UserManagementSimple />}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Order Management
                  </h3>
                  <div className="flex items-center gap-4">
                    <select className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                      <option>All Orders</option>
                      <option>Pending</option>
                      <option>Completed</option>
                      <option>Failed</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-neutral-200 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-brand-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-neutral-900">
                              Order #{order.id}
                            </h4>
                            <p className="text-sm text-neutral-600">
                              {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900">
                            {formatCurrency(order.total / 100)}
                          </p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-neutral-600">
                          {order.items.length} item(s)
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {order.status === "pending" && (
                            <Button variant="primary" size="sm">
                              Process
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Revenue Tab */}
            {activeTab === "revenue" && (
              <div className="space-y-6">
                <TeacherRevenueManager />
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Platform Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h4 className="font-medium text-neutral-900 mb-4">
                      Revenue Overview
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">This Month</span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(15000 / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Last Month</span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(12000 / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Growth</span>
                        <span className="font-semibold text-green-600">
                          +25%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h4 className="font-medium text-neutral-900 mb-4">
                      Student Growth
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">New This Month</span>
                        <span className="font-semibold text-neutral-900">
                          125
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Total Active</span>
                        <span className="font-semibold text-neutral-900">
                          1,250
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          Completion Rate
                        </span>
                        <span className="font-semibold text-green-600">
                          78%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div>
                <SupabaseConfig />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
