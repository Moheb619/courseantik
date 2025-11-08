import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Calendar,
  Shield,
  BookOpen,
  Users,
  Award,
  Edit,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { comprehensiveAdminService } from "../../services/comprehensiveAdminService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { formatCurrency } from "../../utils/fmt";

const UserDetailsModal = ({ user, isOpen, onClose, onEdit }) => {
  const queryClient = useQueryClient();
  const [showCourseAssignment, setShowCourseAssignment] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Fetch user's assigned courses if they're an instructor
  const { data: assignedCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["user-assigned-courses", user?.id],
    queryFn: () => comprehensiveAdminService.getUserAssignedCourses(user?.id),
    enabled: !!user && user.role === "instructor",
  });

  // Fetch all available courses for assignment
  const { data: availableCourses } = useQuery({
    queryKey: ["available-courses"],
    queryFn: () => comprehensiveAdminService.getAllCourses({ limit: 100 }),
    enabled: showCourseAssignment,
  });

  // Assign courses to instructor
  const assignCoursesMutation = useMutation({
    mutationFn: ({ instructorId, courseIds }) =>
      comprehensiveAdminService.assignCoursesToInstructor(
        instructorId,
        courseIds
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["user-assigned-courses"]);
      setShowCourseAssignment(false);
      setSelectedCourses([]);
    },
  });

  // Remove course assignment
  const removeAssignmentMutation = useMutation({
    mutationFn: ({ instructorId, courseId }) =>
      comprehensiveAdminService.removeCourseAssignment(instructorId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(["user-assigned-courses"]);
    },
  });

  const handleCourseSelection = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleAssignCourses = () => {
    if (selectedCourses.length === 0) return;

    assignCoursesMutation.mutate({
      instructorId: user.id,
      courseIds: selectedCourses,
    });
  };

  const handleRemoveAssignment = (courseId) => {
    if (
      window.confirm("Are you sure you want to remove this course assignment?")
    ) {
      removeAssignmentMutation.mutate({
        instructorId: user.id,
        courseId,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="xl">
      <div className="space-y-6">
        {/* User Header */}
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-2xl">
                {user.full_name?.charAt(0) || "U"}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-neutral-900">
                {user.full_name || "Unnamed User"}
              </h2>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
              {user.role === "instructor" && (
                <>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{assignedCourses?.length || 0} assigned courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {user.enrollments?.[0]?.count || 0} total students
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            {user.role === "instructor" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCourseAssignment(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign Courses
              </Button>
            )}
          </div>
        </div>

        {/* User Bio */}
        {user.bio && (
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-2">Bio</h3>
            <p className="text-neutral-600">{user.bio}</p>
          </div>
        )}

        {/* Instructor Details */}
        {user.role === "instructor" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Expertise</h3>
              </div>
              <p className="text-blue-700">
                {user.expertise || "Not specified"}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900">Experience</h3>
              </div>
              <p className="text-green-700">
                {user.experience_years || 0} years
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-900">Hourly Rate</h3>
              </div>
              <p className="text-yellow-700">
                {user.hourly_rate
                  ? formatCurrency(user.hourly_rate / 100)
                  : "Not set"}
              </p>
            </div>
          </div>
        )}

        {/* Assigned Courses (for Instructors) */}
        {user.role === "instructor" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Assigned Courses
              </h3>
              <span className="text-sm text-neutral-500">
                {assignedCourses?.length || 0} courses
              </span>
            </div>

            {coursesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                <p className="mt-2 text-neutral-600">Loading courses...</p>
              </div>
            ) : assignedCourses?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={course.thumbnail || "/placeholder-course.jpg"}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 truncate">
                          {course.title}
                        </h4>
                        <p className="text-sm text-neutral-600 truncate">
                          {course.subtitle}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {course.enrolled_count || 0} students
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {course.rating || 0}★
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(course.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-neutral-50 rounded-lg">
                <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No courses assigned yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowCourseAssignment(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Courses
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Course Assignment Modal */}
        {showCourseAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    Assign Courses to {user.full_name}
                  </h3>
                  <button
                    onClick={() => setShowCourseAssignment(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCourses?.courses?.map((course) => (
                    <div
                      key={course.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedCourses.includes(course.id)
                          ? "border-brand-500 bg-brand-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                      onClick={() => handleCourseSelection(course.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleCourseSelection(course.id)}
                          className="mt-1"
                        />
                        <img
                          src={course.thumbnail || "/placeholder-course.jpg"}
                          alt={course.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-900 truncate">
                            {course.title}
                          </h4>
                          <p className="text-sm text-neutral-600 truncate">
                            {course.subtitle}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                            <span>
                              {course.category?.name || "Uncategorized"}
                            </span>
                            <span>
                              {course.is_free
                                ? "Free"
                                : formatCurrency(course.price_cents / 100)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCourseAssignment(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAssignCourses}
                  disabled={
                    selectedCourses.length === 0 ||
                    assignCoursesMutation.isPending
                  }
                >
                  {assignCoursesMutation.isPending
                    ? "Assigning..."
                    : `Assign ${selectedCourses.length} Courses`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailsModal;
