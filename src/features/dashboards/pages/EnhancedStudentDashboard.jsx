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
  Settings,
  Bell,
  Download,
  Eye,
  Loader,
  Star,
  Calendar,
  MessageSquare,
  FileText,
  Video,
  Users,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Bookmark,
  Share,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ProgressTracker from "../../../components/student/ProgressTracker";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../../courses/services/courseService";
import { comprehensiveStudentService } from "../../../services/comprehensiveStudentService";
import { useAuth } from "../../../hooks/useAuth";

// Course Progress Component
const CourseProgressCard = ({ course }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center relative">
        <Play className="w-12 h-12 text-white opacity-80" />
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {course.progress}%
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-neutral-900 mb-2">{course.title}</h4>
        <p className="text-sm text-neutral-600 mb-3">{course.instructor}</p>

        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-neutral-600">Progress</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-1 text-neutral-600">
            <Video className="w-4 h-4" />
            <span>
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
          </div>
          <div className="flex items-center gap-1 text-neutral-600">
            <Clock className="w-4 h-4" />
            <span>{course.timeLeft}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/course/${course.slug}/learn`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Continue Learning
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const EnhancedStudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch comprehensive student data from database
  const { data: enrolledCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["student-enrolled-courses", user?.id],
    queryFn: () => comprehensiveStudentService.getEnrolledCourses(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: progressSummary, isLoading: progressLoading } = useQuery({
    queryKey: ["student-progress-summary", user?.id],
    queryFn: () => comprehensiveStudentService.getProgressSummary(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: certificates = [], isLoading: isLoadingCertificates } =
    useQuery({
      queryKey: ["student-certificates", user?.id],
      queryFn: () => comprehensiveStudentService.getCertificates(user.id),
      enabled: !!user?.id,
      staleTime: 10 * 60 * 1000,
    });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["student-orders", user?.id],
    queryFn: () => comprehensiveStudentService.getOrderHistory(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["student-notifications", user?.id],
    queryFn: () =>
      comprehensiveStudentService.getNotifications(user.id, { limit: 10 }),
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000,
  });

  // Enhanced mock data for better demo
  const mockEnrolledCourses = [
    {
      id: 1,
      title: "React Masterclass 2024",
      slug: "react-masterclass-2024",
      instructor: "John Smith",
      progress: 75,
      completedLessons: 12,
      totalLessons: 16,
      timeLeft: "2h 30m",
      lastAccessed: "2 hours ago",
      nextLesson: "State Management with Redux",
    },
    {
      id: 2,
      title: "Node.js Backend Development",
      slug: "nodejs-backend-development",
      instructor: "Sarah Johnson",
      progress: 45,
      completedLessons: 6,
      totalLessons: 14,
      timeLeft: "4h 15m",
      lastAccessed: "1 day ago",
      nextLesson: "Express Middleware",
    },
    {
      id: 3,
      title: "Full Stack JavaScript",
      slug: "full-stack-javascript",
      instructor: "Mike Chen",
      progress: 20,
      completedLessons: 3,
      totalLessons: 25,
      timeLeft: "8h 45m",
      lastAccessed: "3 days ago",
      nextLesson: "Database Design",
    },
  ];

  const tabs = [
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Welcome back, {user?.full_name?.split(" ")[0] || "Student"}! 👋
              </h1>
              <p className="text-neutral-600 mt-1">
                Ready to continue your learning journey?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNotificationOpen(true)}
                className="relative"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button variant="primary" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Find Courses
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
            {/* My Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    My Courses
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <select className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                      <option>All Courses</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Not Started</option>
                    </select>
                    <Link to="/courses">
                      <Button variant="primary" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockEnrolledCourses.map((course) => (
                    <CourseProgressCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === "progress" && <ProgressTracker />}

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

                {certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                            <Award className="w-8 h-8 text-white" />
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
                              <Button variant="outline" size="sm">
                                <Share className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-neutral-50 rounded-xl">
                    <Award className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-neutral-900 mb-2">
                      No certificates yet
                    </h4>
                    <p className="text-neutral-600 mb-4">
                      Complete courses to earn certificates and showcase your
                      achievements.
                    </p>
                    <Link to="/courses">
                      <Button variant="primary">Browse Courses</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Order History
                </h3>
                <div className="space-y-4">
                  {orders.length > 0 ? (
                    orders.map((order) => (
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
                    ))
                  ) : (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl">
                      <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-neutral-900 mb-2">
                        No orders yet
                      </h4>
                      <p className="text-neutral-600 mb-4">
                        Start shopping for courses and products to see your
                        order history here.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <Link to="/courses">
                          <Button variant="primary">Browse Courses</Button>
                        </Link>
                        <Link to="/shop">
                          <Button variant="outline">Shop Products</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <Modal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        title="Your Notifications"
      >
        <div className="space-y-4">
          {[
            {
              message: "New lesson available in React Masterclass",
              time: "5 min ago",
              type: "info",
            },
            {
              message: "Quiz deadline approaching for Node.js course",
              time: "1 hour ago",
              type: "warning",
            },
            {
              message: "Congratulations! You've earned a new achievement",
              time: "2 hours ago",
              type: "success",
            },
            {
              message: "Course discount: 30% off Full Stack JavaScript",
              time: "1 day ago",
              type: "info",
            },
          ].map((notification, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                notification.type === "warning"
                  ? "bg-yellow-50 border-yellow-400"
                  : notification.type === "success"
                  ? "bg-green-50 border-green-400"
                  : "bg-blue-50 border-blue-400"
              }`}
            >
              <p className="text-sm text-neutral-900">{notification.message}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {notification.time}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedStudentDashboard;
