import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Award,
  ShoppingBag,
  Clock,
  TrendingUp,
  Play,
  CheckCircle,
  BarChart3,
  Settings,
  Bell,
  Download,
  Eye,
  Loader,
} from "lucide-react";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../../courses/services/courseService";
import { useAuth } from "../../../hooks/useAuth";

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch enrolled courses from database
  const { data: enrolledCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["enrolled-courses", user?.id],
    queryFn: () => courseService.getEnrolledCourses(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user certificates
  const { data: certificates = [], isLoading: isLoadingCertificates } =
    useQuery({
      queryKey: ["user-certificates", user?.id],
      queryFn: () => courseService.getUserCertificates(user.id),
      enabled: !!user?.id,
      staleTime: 10 * 60 * 1000,
    });

  // Fetch user orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: () => courseService.getUserOrders(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate dashboard stats
  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(
    (course) => course.progress === 100
  ).length;
  const totalCertificates = certificates.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
              <p className="text-neutral-600 mt-1">
                Welcome back! Here's your learning overview.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
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
                  Enrolled Courses
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {totalCourses}
                </p>
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
                  Completed
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {completedCourses}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Certificates
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {totalCertificates}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Spent
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(totalSpent / 100)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
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
                    {enrolledCourses.slice(0, 3).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl"
                      >
                        <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-brand-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">
                            {course.title}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            Progress: {course.progress}%
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link to="/courses">
                      <div className="p-4 border border-neutral-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-colors">
                        <BookOpen className="w-8 h-8 text-brand-600 mb-2" />
                        <h4 className="font-medium text-neutral-900">
                          Browse Courses
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Discover new courses
                        </p>
                      </div>
                    </Link>
                    <Link to="/shop">
                      <div className="p-4 border border-neutral-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-colors">
                        <ShoppingBag className="w-8 h-8 text-brand-600 mb-2" />
                        <h4 className="font-medium text-neutral-900">
                          Shop Products
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Enhance your learning
                        </p>
                      </div>
                    </Link>
                    <Link to="/dashboard/certificates">
                      <div className="p-4 border border-neutral-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-colors">
                        <Award className="w-8 h-8 text-brand-600 mb-2" />
                        <h4 className="font-medium text-neutral-900">
                          View Certificates
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Your achievements
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* My Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    My Courses
                  </h3>
                  <Link to="/courses">
                    <Button variant="outline" size="sm">
                      Browse All Courses
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-neutral-900 mb-2">
                          {course.title}
                        </h4>
                        <p className="text-sm text-neutral-600 mb-3">
                          {course.instructor}
                        </p>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-neutral-600">Progress</span>
                            <span className="font-medium">
                              {course.progress}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-neutral-600">
                            <Clock className="w-4 h-4" />
                            {course.duration}
                          </div>
                          <Link to={`/course/${course.slug}/learn`}>
                            <Button variant="primary" size="sm">
                              Continue
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === "certificates" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    My Certificates
                  </h3>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <Award className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900 mb-1">
                            {cert.courseTitle}
                          </h4>
                          <p className="text-sm text-neutral-600 mb-2">
                            Completed on {cert.completedDate}
                          </p>
                          <p className="text-xs text-neutral-500 mb-3">
                            Certificate ID: {cert.id}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Order History
                </h3>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-neutral-200 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-neutral-900">
                            Order #{order.id}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {order.date}
                          </p>
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
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                              {item.type === "course" ? (
                                <BookOpen className="w-4 h-4" />
                              ) : (
                                <ShoppingBag className="w-4 h-4" />
                              )}
                            </div>
                            <span className="text-neutral-900">
                              {item.name}
                            </span>
                            <span className="text-neutral-600 ml-auto">
                              {formatCurrency(item.price / 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
