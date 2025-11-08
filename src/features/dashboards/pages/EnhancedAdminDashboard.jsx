import React, { useState } from "react";
import { Link } from "react-router-dom";
import CourseManagement from "../../../components/admin/CourseManagement";
import {
  Users,
  BookOpen,
  ShoppingBag,
  Clock,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Database,
  Upload,
  Mail,
  Shield,
  Activity,
  Calendar,
  Star,
  MessageSquare,
  FileText,
  CreditCard,
  UserCheck,
  UserX,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { comprehensiveAdminService } from "../../../services/comprehensiveAdminService";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ComprehensiveUserManager from "../../../components/admin/ComprehensiveUserManager";
import OrderManagementCenter from "../../../components/admin/OrderManagementCenter";
import UserCreationForm from "../../../components/admin/UserCreationForm";

// User Management Component
const UserManagementGrid = () => {
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch users from database
  const { data: usersData } = useQuery({
    queryKey: ["admin-users", { filter: userFilter, search: searchTerm }],
    queryFn: () =>
      comprehensiveAdminService.getUsers({
        role: userFilter === "all" ? null : userFilter,
        search: searchTerm || null,
        limit: 50,
      }),
    staleTime: 2 * 60 * 1000,
  });

  const mockUsers = usersData?.users || [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      role: "instructor",
      status: "active",
      joinedDate: "2024-01-15",
      coursesCount: 3,
      studentsCount: 245,
      avatar: null,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "student",
      status: "active",
      joinedDate: "2024-02-20",
      coursesCount: 5,
      completedCourses: 2,
      avatar: null,
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike@example.com",
      role: "instructor",
      status: "pending",
      joinedDate: "2024-03-10",
      coursesCount: 1,
      studentsCount: 67,
      avatar: null,
    },
    {
      id: 4,
      name: "Emma Davis",
      email: "emma@example.com",
      role: "student",
      status: "inactive",
      joinedDate: "2024-01-05",
      coursesCount: 2,
      completedCourses: 0,
      avatar: null,
    },
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesFilter = userFilter === "all" || user.role === userFilter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUserAction = (action, userId) => {
    console.log(`${action} user ${userId}`);
    // Implement user actions
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          User Management
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              console.log("Add User button clicked in EnhancedAdminDashboard");
              setShowCreateModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-neutral-900">{user.name}</h4>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : user.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : user.role === "instructor"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Joined</span>
                <span className="text-neutral-900">{user.joinedDate}</span>
              </div>
              {user.role === "instructor" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Courses</span>
                    <span className="text-neutral-900">
                      {user.coursesCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Students</span>
                    <span className="text-neutral-900">
                      {user.studentsCount}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Enrolled</span>
                    <span className="text-neutral-900">
                      {user.coursesCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Completed</span>
                    <span className="text-neutral-900">
                      {user.completedCourses || 0}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleUserAction("view", user.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleUserAction("edit", user.id)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              {user.status === "pending" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUserAction("approve", user.id)}
                >
                  <UserCheck className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* User Creation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="xl"
      >
        <UserCreationForm
          onSuccess={() => {
            console.log("User creation success");
            setShowCreateModal(false);
            // Refresh users data
            window.location.reload();
          }}
          onCancel={() => {
            console.log("User creation cancelled");
            setShowCreateModal(false);
          }}
        />
      </Modal>
    </div>
  );
};

const EnhancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Admin Dashboard
            </h1>
            <p className="text-neutral-600 mt-1">
              Manage your platform and monitor performance
            </p>
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
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Admin Dashboard Overview
                  </h3>
                  <p className="text-neutral-600">
                    Use the tabs above to manage courses, users, and orders.
                  </p>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && <CourseManagement />}

            {/* Users Tab */}
            {activeTab === "users" && <ComprehensiveUserManager />}

            {/* Orders Tab */}
            {activeTab === "orders" && <OrderManagementCenter />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
