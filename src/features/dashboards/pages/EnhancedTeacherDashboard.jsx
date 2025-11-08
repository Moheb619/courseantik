import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Star,
  Calendar,
  Bell,
  Download,
  Upload,
  Play,
  FileText,
  Video,
  PieChart,
  Target,
  Zap,
  Mail,
  Settings,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery } from "@tanstack/react-query";
import { dummyCourses } from "../../../data/dummyData";
import { comprehensiveTeacherService } from "../../../services/comprehensiveTeacherService";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import AssignmentGradingCenter from "../../../components/teacher/AssignmentGradingCenter";
import { useAuth } from "../../../hooks/useAuth";

// Course Analytics Component
const CourseAnalytics = ({ course }) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-neutral-900">{course.title}</h4>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900">
            {course.enrolledCount}
          </p>
          <p className="text-sm text-neutral-600">Students</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900">{course.rating}</p>
          <p className="text-sm text-neutral-600">Rating</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(
              (course.priceCents * course.enrolledCount * 0.7) / 100
            )}
          </p>
          <p className="text-sm text-neutral-600">Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900">87%</p>
          <p className="text-sm text-neutral-600">Completion</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Progress</span>
          <span className="text-neutral-900">87%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-brand-500 h-2 rounded-full"
            style={{ width: "87%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Student Management Component
const StudentManagement = () => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const mockStudents = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      course: "React Masterclass",
      progress: 75,
      lastActive: "2 days ago",
      status: "active",
      assignments: 3,
      completedAssignments: 2,
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@example.com",
      course: "Node.js Backend",
      progress: 45,
      lastActive: "1 week ago",
      status: "inactive",
      assignments: 2,
      completedAssignments: 1,
    },
    {
      id: 3,
      name: "Carol Williams",
      email: "carol@example.com",
      course: "Full Stack JavaScript",
      progress: 100,
      lastActive: "1 day ago",
      status: "completed",
      assignments: 4,
      completedAssignments: 4,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Student Management
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
          <Button variant="primary" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Student
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Course
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Progress
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Assignments
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Last Active
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50"
                >
                  <td className="py-4 px-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900">
                          {student.name}
                        </h4>
                        <p className="text-sm text-neutral-600">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-neutral-900">{student.course}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-neutral-200 rounded-full">
                        <div
                          className="h-2 bg-brand-500 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-neutral-900">
                        {student.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-neutral-900">
                      {student.completedAssignments}/{student.assignments}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-neutral-600">
                      {student.lastActive}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Assignment Management Component
const AssignmentManagement = () => {
  const [assignments] = useState([
    {
      id: 1,
      title: "Build a React Component",
      course: "React Masterclass",
      dueDate: "2024-04-15",
      submissions: 12,
      pending: 3,
      graded: 9,
    },
    {
      id: 2,
      title: "API Integration Project",
      course: "Node.js Backend",
      dueDate: "2024-04-20",
      submissions: 8,
      pending: 2,
      graded: 6,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Assignment Management
        </h3>
        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white border border-neutral-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-neutral-900">
                {assignment.title}
              </h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Course:</span>
                <span className="text-neutral-900">{assignment.course}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Due Date:</span>
                <span className="text-neutral-900">{assignment.dueDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Submissions:</span>
                <span className="text-neutral-900">
                  {assignment.submissions}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Pending Review:</span>
                <span className="text-orange-600 font-medium">
                  {assignment.pending}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Graded:</span>
                <span className="text-green-600 font-medium">
                  {assignment.graded}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200">
              <Button variant="primary" size="sm" className="w-full">
                Review Submissions ({assignment.pending})
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EnhancedTeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch teacher's courses with real data
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["teacher-courses", user?.id],
    queryFn: () => comprehensiveTeacherService.getTeacherCourses(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch teacher's students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["teacher-students", user?.id],
    queryFn: () => comprehensiveTeacherService.getTeacherStudents(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch pending assignments
  const { data: pendingAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["teacher-pending-assignments", user?.id],
    queryFn: () => comprehensiveTeacherService.getPendingAssignments(user.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch earnings summary
  const { data: earningsSummary } = useQuery({
    queryKey: ["teacher-earnings-summary", user?.id],
    queryFn: () => comprehensiveTeacherService.getEarningsSummary(user.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const courses = coursesData?.courses || dummyCourses.slice(0, 3);

  // Calculate teacher stats from real data
  const totalCourses = courses.length;
  const totalStudents = studentsData?.length || 0;
  const totalEarnings = (earningsSummary?.totalEarnings || 0) / 100;
  const pendingSubmissions = pendingAssignments?.length || 0;
  const completionRate =
    courses.length > 0
      ? Math.round(
          (courses.reduce((sum, course) => {
            const completions =
              course.enrollments?.filter((e) => e.completed_at).length || 0;
            const total = course.enrollments?.length || 1;
            return sum + completions / total;
          }, 0) /
            courses.length) *
            100
        )
      : 0;
  const avgRating =
    courses.length > 0
      ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) /
        courses.length
      : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Teacher Dashboard
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage your courses and track your teaching progress
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
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  My Courses
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {totalCourses}
                </p>
                <p className="text-sm text-green-600">+1 this month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {totalStudents}
                </p>
                <p className="text-sm text-green-600">+25 this month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Earnings
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(totalEarnings)}
                </p>
                <p className="text-sm text-green-600">+15% this month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Avg Rating
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {avgRating}
                </p>
                <p className="text-sm text-green-600">Excellent</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {completionRate}%
                </p>
                <p className="text-sm text-green-600">Above average</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Pending Reviews
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {pendingSubmissions}
                </p>
                <p className="text-sm text-orange-600">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

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
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Course Performance Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Course Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <CourseAnalytics key={course.id} course={course} />
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        action: "New enrollment",
                        details: "Sarah J. enrolled in your React course",
                        time: "1 hour ago",
                        icon: Users,
                        color: "green",
                      },
                      {
                        action: "Assignment submitted",
                        details: "Mike C. submitted React project",
                        time: "3 hours ago",
                        icon: FileText,
                        color: "blue",
                      },
                      {
                        action: "New review",
                        details: "5-star review from Alex R.",
                        time: "1 day ago",
                        icon: Star,
                        color: "yellow",
                      },
                      {
                        action: "Course milestone",
                        details: "Node.js course reached 100 students",
                        time: "2 days ago",
                        icon: Award,
                        color: "purple",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl"
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            activity.color === "green"
                              ? "bg-green-100"
                              : activity.color === "blue"
                              ? "bg-blue-100"
                              : activity.color === "yellow"
                              ? "bg-yellow-100"
                              : "bg-purple-100"
                          }`}
                        >
                          <activity.icon
                            className={`w-6 h-6 ${
                              activity.color === "green"
                                ? "text-green-600"
                                : activity.color === "blue"
                                ? "text-blue-600"
                                : activity.color === "yellow"
                                ? "text-yellow-600"
                                : "text-purple-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">
                            {activity.action}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {activity.details}
                          </p>
                        </div>
                        <div className="text-sm text-neutral-500">
                          {activity.time}
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <Upload className="w-8 h-8 text-brand-600" />
                      <span className="font-medium">Upload Content</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2"
                    >
                      <MessageSquare className="w-8 h-8 text-brand-600" />
                      <span className="font-medium">Message Students</span>
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

            {/* My Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    My Courses
                  </h3>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="primary" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center relative">
                        <Play className="w-16 h-16 text-white opacity-80" />
                        <div className="absolute top-4 right-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              course.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="font-semibold text-neutral-900 mb-2">
                          {course.title}
                        </h4>
                        <div className="text-sm text-neutral-600 mb-4 line-clamp-2 prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {course.description}
                          </ReactMarkdown>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-neutral-900">
                              {course.enrolledCount}
                            </p>
                            <p className="text-xs text-neutral-600">Students</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-neutral-900 flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {course.rating}
                            </p>
                            <p className="text-xs text-neutral-600">Rating</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Revenue</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(
                                (course.priceCents *
                                  course.enrolledCount *
                                  0.7) /
                                  100
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Price</span>
                            <span className="font-medium">
                              {formatCurrency(course.priceCents / 100)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && <StudentManagement />}

            {/* Assignments Tab */}
            {activeTab === "assignments" && <AssignmentGradingCenter />}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Earnings Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h4 className="font-medium text-neutral-900 mb-4">
                      This Month
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Gross Earnings</span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(3500)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          Platform Fee (30%)
                        </span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(1050)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-neutral-600">Net Earnings</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(2450)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h4 className="font-medium text-neutral-900 mb-4">
                      All Time
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Total Sales</span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(45000)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Total Earnings</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(31500)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Courses Sold</span>
                        <span className="font-semibold text-neutral-900">
                          {courses.reduce(
                            (total, course) => total + course.enrolledCount,
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h4 className="font-medium text-neutral-900 mb-4">
                      Performance
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          Avg. Course Price
                        </span>
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(
                            courses.reduce(
                              (total, course) => total + course.priceCents,
                              0
                            ) /
                              courses.length /
                              100
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">
                          Conversion Rate
                        </span>
                        <span className="font-semibold text-green-600">
                          12.5%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Refund Rate</span>
                        <span className="font-semibold text-neutral-900">
                          2.1%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-neutral-900">
                      Recent Transactions
                    </h4>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-3 px-4 font-medium text-neutral-900">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-900">
                            Course
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-900">
                            Student
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-900">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-900">
                            Your Share
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            date: "2024-03-15",
                            course: "React Masterclass",
                            student: "John D.",
                            amount: 99,
                            share: 69.3,
                          },
                          {
                            date: "2024-03-14",
                            course: "Node.js Backend",
                            student: "Sarah M.",
                            amount: 79,
                            share: 55.3,
                          },
                          {
                            date: "2024-03-13",
                            course: "Full Stack JS",
                            student: "Mike R.",
                            amount: 149,
                            share: 104.3,
                          },
                        ].map((transaction, index) => (
                          <tr
                            key={index}
                            className="border-b border-neutral-100"
                          >
                            <td className="py-3 px-4 text-neutral-900">
                              {transaction.date}
                            </td>
                            <td className="py-3 px-4 text-neutral-900">
                              {transaction.course}
                            </td>
                            <td className="py-3 px-4 text-neutral-900">
                              {transaction.student}
                            </td>
                            <td className="py-3 px-4 text-neutral-900">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="py-3 px-4 text-green-600 font-medium">
                              {formatCurrency(transaction.share)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Teaching Analytics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white border border-neutral-200 rounded-xl p-6"
                    >
                      <h4 className="font-medium text-neutral-900 mb-4">
                        {course.title}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">
                            Completion Rate
                          </span>
                          <span className="font-medium text-neutral-900">
                            78%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">
                            Avg. Progress
                          </span>
                          <span className="font-medium text-neutral-900">
                            65%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">
                            Drop-off Rate
                          </span>
                          <span className="font-medium text-red-600">15%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Engagement</span>
                          <span className="font-medium text-green-600">
                            High
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Student Feedback */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <h4 className="font-medium text-neutral-900 mb-4">
                    Recent Student Feedback
                  </h4>
                  <div className="space-y-4">
                    {[
                      {
                        student: "Alice J.",
                        course: "React Masterclass",
                        rating: 5,
                        comment: "Excellent course! Very clear explanations.",
                        date: "2 days ago",
                      },
                      {
                        student: "Bob S.",
                        course: "Node.js Backend",
                        rating: 4,
                        comment: "Good content, could use more examples.",
                        date: "1 week ago",
                      },
                      {
                        student: "Carol W.",
                        course: "Full Stack JS",
                        rating: 5,
                        comment: "Amazing course, learned so much!",
                        date: "1 week ago",
                      },
                    ].map((feedback, index) => (
                      <div key={index} className="p-4 bg-neutral-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">
                              {feedback.student}
                            </span>
                            <span className="text-sm text-neutral-600">
                              • {feedback.course}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < feedback.rating
                                    ? "text-yellow-500 fill-current"
                                    : "text-neutral-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-700 mb-1">
                          {feedback.comment}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {feedback.date}
                        </p>
                      </div>
                    ))}
                  </div>
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
        title="Teacher Notifications"
      >
        <div className="space-y-4">
          {[
            {
              message: "New student enrolled in React Masterclass",
              time: "5 min ago",
              type: "success",
            },
            {
              message: "Assignment submission from Mike Chen",
              time: "1 hour ago",
              type: "info",
            },
            {
              message: "New 5-star review on Node.js course",
              time: "2 hours ago",
              type: "success",
            },
            {
              message: "Course analytics report is ready",
              time: "1 day ago",
              type: "info",
            },
          ].map((notification, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                notification.type === "success"
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

export default EnhancedTeacherDashboard;
