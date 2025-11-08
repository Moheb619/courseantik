import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Calendar,
  Shield,
  BookOpen,
  ShoppingCart,
  MoreHorizontal,
} from "lucide-react";
import { userService } from "../../services/userService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import UserCreationForm from "./UserCreationForm";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const queryClient = useQueryClient();

  // Temporarily disable React Query for debugging
  const usersData = [];
  const isLoading = false;
  const error = null;

  // Debug logging
  console.log("UserManagement - usersData:", usersData);
  console.log("UserManagement - isLoading:", isLoading);
  console.log("UserManagement - error:", error);

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => userService.updateUserRole(id, role),
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      toast.error("Failed to update user role: " + error.message);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: (error) => {
      toast.error("Failed to delete user: " + error.message);
    },
  });

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "instructor":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error loading users:</strong> {error.message}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              User Management
            </h2>
            <p className="text-neutral-600">Manage all users and their roles</p>
          </div>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            User Management
          </h2>
          <p className="text-neutral-600">Manage all users and their roles</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => {
            console.log("Add User button clicked!");
            console.log("Current showCreateModal state:", showCreateModal);
            setShowCreateModal(true);
            console.log("Set showCreateModal to true");
          }}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>

        {/* Simple HTML Button for Testing */}
        <button
          onClick={() => {
            console.log("Simple HTML button clicked!");
            setShowCreateModal(true);
          }}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Button
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {usersData?.data?.map((user) => (
              <div
                key={user.id}
                className="p-6 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {user.full_name || "No Name"}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-neutral-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.id} {/* Using ID as email placeholder */}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {formatDate(user.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {user.courses?.[0]?.count || 0} courses
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4" />
                          {user.enrollments?.[0]?.count || 0} enrollments
                        </div>
                      </div>

                      {user.bio && (
                        <p className="text-neutral-600 text-sm">{user.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="px-3 py-1 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={updateRoleMutation.isPending}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={deleteUserMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {usersData?.count > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <span className="px-3 py-1 text-sm text-neutral-600">
            Page 1 of 5
          </span>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-yellow-100 p-4 rounded-lg mb-4">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>showCreateModal: {showCreateModal ? "true" : "false"}</p>
        <p>usersData length: {usersData?.length || 0}</p>
        <p>isLoading: {isLoading ? "true" : "false"}</p>
        <p>error: {error ? error.message : "none"}</p>
      </div>

      {/* User Creation Modal */}
      {console.log("Rendering modal with showCreateModal:", showCreateModal)}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          console.log("Modal close clicked");
          setShowCreateModal(false);
        }}
        title="Create New User"
        size="xl"
      >
        <UserCreationForm
          onSuccess={() => {
            console.log("User creation success");
            setShowCreateModal(false);
          }}
          onCancel={() => {
            console.log("User creation cancelled");
            setShowCreateModal(false);
          }}
        />
      </Modal>

      {/* Fallback Simple Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Create New User (Fallback)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4">
                This is a fallback modal to test if the modal functionality
                works.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Close Modal
                </button>
                <button
                  onClick={() =>
                    console.log("Test button in fallback modal clicked")
                  }
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Test Button
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
