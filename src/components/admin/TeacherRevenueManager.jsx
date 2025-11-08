import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import {
  Users,
  Percent,
  DollarSign,
  Edit,
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const TeacherRevenueManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    courseId: "",
    teacherId: "",
    percentage: "",
  });

  // Fetch all courses with their instructors
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(
          `
          id,
          title,
          slug,
          price_cents,
          instructor_id,
          instructor:profiles!instructor_id(id, full_name, email)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && user.role === "admin",
  });

  // Fetch all teachers
  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "teacher")
        .order("full_name");

      if (error) throw error;
      return data;
    },
    enabled: !!user && user.role === "admin",
  });

  // Fetch teacher assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_assignments")
        .select(
          `
          *,
          course:courses(title, slug, price_cents),
          teacher:profiles!teacher_id(full_name, email)
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && user.role === "admin",
  });

  // Create or update teacher assignment
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData) => {
      const { data, error } = await supabase
        .from("teacher_assignments")
        .upsert(
          {
            course_id: assignmentData.courseId,
            teacher_id: assignmentData.teacherId,
            percentage: parseFloat(assignmentData.percentage),
            is_active: true,
          },
          {
            onConflict: "course_id,teacher_id",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-assignments"]);
      setIsModalOpen(false);
      setFormData({ courseId: "", teacherId: "", percentage: "" });
      setEditingAssignment(null);
    },
  });

  // Deactivate teacher assignment
  const deactivateAssignmentMutation = useMutation({
    mutationFn: async (assignmentId) => {
      const { data, error } = await supabase
        .from("teacher_assignments")
        .update({ is_active: false })
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teacher-assignments"]);
    },
  });

  const handleOpenModal = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        courseId: assignment.course_id,
        teacherId: assignment.teacher_id,
        percentage: assignment.percentage.toString(),
      });
    } else {
      setEditingAssignment(null);
      setFormData({ courseId: "", teacherId: "", percentage: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.courseId || !formData.teacherId || !formData.percentage) {
      return;
    }

    const percentage = parseFloat(formData.percentage);
    if (percentage < 0 || percentage > 100) {
      alert("Percentage must be between 0 and 100");
      return;
    }

    createAssignmentMutation.mutate(formData);
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(cents / 100);
  };

  const calculateTeacherRevenue = (coursePrice, percentage) => {
    return Math.round((coursePrice * percentage) / 100);
  };

  if (coursesLoading || teachersLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Revenue Management
            </h1>
            <p className="mt-2 text-gray-600">
              Set revenue percentages for teachers on each course
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Teachers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {teachers?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Assignments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Teacher Assignments
          </h2>
        </div>

        {assignments && assignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.course?.title || "Unknown Course"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.course?.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.teacher?.full_name || "Unknown Teacher"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.teacher?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(assignment.course?.price_cents || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {assignment.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(
                        calculateTeacherRevenue(
                          assignment.course?.price_cents || 0,
                          assignment.percentage
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(assignment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to remove this assignment?"
                              )
                            ) {
                              deactivateAssignmentMutation.mutate(
                                assignment.id
                              );
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No assignments yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by creating teacher assignments for courses.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAssignment(null);
          setFormData({ courseId: "", teacherId: "", percentage: "" });
        }}
        title={editingAssignment ? "Edit Assignment" : "Create Assignment"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select a course</option>
              {courses?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} - {formatCurrency(course.price_cents)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) =>
                setFormData({ ...formData, teacherId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select a teacher</option>
              {teachers?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Revenue Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({ ...formData, percentage: e.target.value })
                }
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., 20"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">%</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Enter the percentage of course revenue the teacher should receive
            </p>
          </div>

          {formData.courseId && formData.percentage && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Revenue Preview
                  </p>
                  <p className="text-sm text-blue-600">
                    Teacher will receive{" "}
                    {formatCurrency(
                      calculateTeacherRevenue(
                        courses?.find((c) => c.id === formData.courseId)
                          ?.price_cents || 0,
                        parseFloat(formData.percentage) || 0
                      )
                    )}{" "}
                    per enrollment
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAssignment(null);
                setFormData({ courseId: "", teacherId: "", percentage: "" });
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createAssignmentMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createAssignmentMutation.isPending
                ? "Saving..."
                : "Save Assignment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherRevenueManager;
