import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Download,
  Upload,
  MoreHorizontal,
  Calendar,
  Award,
  BookOpen,
} from "lucide-react";
import { comprehensiveAdminService } from "../../services/comprehensiveAdminService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import UserCreationForm from "./UserCreationForm";
import UserDetailsModal from "./UserDetailsModal";

const ComprehensiveUserManager = () => {
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users with real data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", { filter: userFilter, search: searchTerm }],
    queryFn: () =>
      comprehensiveAdminService.getUsers({
        role: userFilter === "all" ? null : userFilter,
        search: searchTerm || null,
        limit: 50,
      }),
    staleTime: 2 * 60 * 1000,
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }) =>
      comprehensiveAdminService.updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      setIsEditModalOpen(false);
      setEditingUser(null);
    },
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: (notificationData) =>
      comprehensiveAdminService.sendNotification(notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
    },
  });

  const users = usersData?.users || [];

  const handleUserAction = (action, userId) => {
    const user = users.find((u) => u.id === userId);

    switch (action) {
      case "view":
        setSelectedUser(user);
        setShowUserDetails(true);
        break;
      case "edit":
        setEditingUser(user);
        setIsEditModalOpen(true);
        break;
      case "approve":
        updateUserMutation.mutate({
          userId,
          updates: { role: "instructor" },
        });
        break;
      case "block":
        updateUserMutation.mutate({
          userId,
          updates: { role: "blocked" },
        });
        break;
      case "message":
        sendNotificationMutation.mutate({
          title: "Message from Admin",
          message: "Please check your account settings.",
          userIds: [userId],
          notification_type: "system",
        });
        break;
      default:
        console.log(`${action} user ${userId}`);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;

    switch (action) {
      case "message":
        sendNotificationMutation.mutate({
          title: "Bulk Message from Admin",
          message: "Important platform update notification.",
          userIds: selectedUsers,
          notification_type: "system",
        });
        break;
      case "export":
        // Export selected users
        break;
      default:
        console.log(`Bulk ${action} for users:`, selectedUsers);
    }

    setSelectedUsers([]);
    setIsBulkActionOpen(false);
  };

  const getUserStatusColor = (user) => {
    if (user.role === "blocked") return "bg-red-100 text-red-800";
    if (user.enrollments?.length > 0) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getUserStatusText = (user) => {
    if (user.role === "blocked") return "Blocked";
    if (user.enrollments?.length > 0) return "Active";
    return "Inactive";
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            User Management
          </h3>
          <p className="text-sm text-neutral-600">
            Manage all platform users and their permissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">
                {selectedUsers.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkActionOpen(true)}
              >
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          )}
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
              console.log(
                "Add User button clicked in ComprehensiveUserManager"
              );
              setShowCreateModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(
                        selectedUsers.filter((id) => id !== user.id)
                      );
                    }
                  }}
                  className="rounded mt-1"
                />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-lg">
                    {user.full_name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-neutral-900 truncate">
                    {user.full_name || "Unnamed User"}
                  </h4>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUserStatusColor(
                      user
                    )}`}
                  >
                    {getUserStatusText(user)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 truncate mb-2">
                  {user.email || "No email"}
                </p>
                <div className="flex items-center gap-2">
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
                <span className="text-neutral-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              {user.role === "instructor" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Courses</span>
                    <span className="text-neutral-900">
                      {user.courses_taught?.[0]?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Students</span>
                    <span className="text-neutral-900">
                      {user.enrollments?.[0]?.count || 0}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Enrolled</span>
                    <span className="text-neutral-900">
                      {user.enrollments?.[0]?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Certificates</span>
                    <span className="text-neutral-900">
                      {user.certificates?.[0]?.count || 0}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUserAction("message", user.id)}
              >
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {usersData?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {users.length} of {usersData.totalCount} users
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={usersData.page === 1}>
              Previous
            </Button>
            <span className="text-sm text-neutral-600">
              Page {usersData.page} of {usersData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={usersData.page === usersData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        title="Edit User"
      >
        {editingUser && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              updateUserMutation.mutate({
                userId: editingUser.id,
                updates: {
                  full_name: formData.get("full_name"),
                  email: formData.get("email"),
                  bio: formData.get("bio"),
                  role: formData.get("role"),
                },
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                defaultValue={editingUser.full_name || ""}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={editingUser.email || ""}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Role
              </label>
              <select
                name="role"
                defaultValue={editingUser.role}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                defaultValue={editingUser.bio || ""}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        isOpen={isBulkActionOpen}
        onClose={() => setIsBulkActionOpen(false)}
        title="Bulk Actions"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Selected {selectedUsers.length} users
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              onClick={() => handleBulkAction("message")}
              className="justify-start"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction("export")}
              className="justify-start"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction("role-change")}
              className="justify-start"
            >
              <Shield className="w-4 h-4 mr-2" />
              Change Role
            </Button>
          </div>
        </div>
      </Modal>

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
            queryClient.invalidateQueries(["admin-users"]);
          }}
          onCancel={() => {
            console.log("User creation cancelled");
            setShowCreateModal(false);
          }}
        />
      </Modal>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUser(null);
        }}
        onEdit={(user) => {
          setShowUserDetails(false);
          setSelectedUser(null);
          setEditingUser(user);
          setIsEditModalOpen(true);
        }}
      />
    </div>
  );
};

export default ComprehensiveUserManager;
