import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  MoreVertical,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  courseManagementService,
  categoryManagementService,
  instructorManagementService,
} from "../../services/courseManagementService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ComprehensiveCourseBuilder from "./ComprehensiveCourseBuilder";
import BulkCourseAssignment from "./BulkCourseAssignment";

const CourseManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    instructor: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);

  // Fetch courses
  const {
    data: coursesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses", searchTerm, filters, currentPage, pageSize],
    queryFn: () =>
      courseManagementService.getCourses({
        search: searchTerm,
        ...filters,
        page: currentPage,
        limit: pageSize,
      }),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryManagementService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes - keep in cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch instructors
  const { data: instructors } = useQuery({
    queryKey: ["instructors"],
    queryFn: instructorManagementService.getInstructors,
    staleTime: 5 * 60 * 1000, // 5 minutes - keep in cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch course stats
  const { data: stats } = useQuery({
    queryKey: ["course-stats"],
    queryFn: courseManagementService.getCourseStats,
  });

  // Mutations
  const deleteCourseMutation = useMutation({
    mutationFn: courseManagementService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course-stats"]);
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete course: " + error.message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, field, value }) =>
      courseManagementService.toggleCourseStatus(id, field, value),
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course-stats"]);
      toast.success("Course status updated");
    },
    onError: (error) => {
      toast.error("Failed to update course: " + error.message);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, updates }) =>
      courseManagementService.bulkUpdateCourses(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course-stats"]);
      setSelectedCourses([]);
      toast.success("Courses updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update courses: " + error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: courseManagementService.bulkDeleteCourses,
    onSuccess: () => {
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course-stats"]);
      setSelectedCourses([]);
      toast.success("Courses deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete courses: " + error.message);
    },
  });

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === coursesData?.courses?.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(
        coursesData?.courses?.map((course) => course.id) || []
      );
    }
  };

  const handleToggleStatus = (courseId, field, currentValue) => {
    toggleStatusMutation.mutate({
      id: courseId,
      field,
      value: !currentValue,
    });
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const handleEditCourse = async (course) => {
    try {
      // Fetch full course structure for editing
      const fullCourse = await courseManagementService.getCourseForEdit(
        course.id
      );
      setEditingCourse(fullCourse);
      setShowCourseForm(true);
    } catch (error) {
      toast.error("Failed to load course for editing: " + error.message);
      console.error("Error loading course for edit:", error);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedCourses.length === 0) {
      toast.error("Please select courses first");
      return;
    }

    switch (action) {
      case "publish":
        bulkUpdateMutation.mutate({
          ids: selectedCourses,
          updates: { is_published: true },
        });
        break;
      case "unpublish":
        bulkUpdateMutation.mutate({
          ids: selectedCourses,
          updates: { is_published: false },
        });
        break;
      case "feature":
        bulkUpdateMutation.mutate({
          ids: selectedCourses,
          updates: { is_featured: true },
        });
        break;
      case "unfeature":
        bulkUpdateMutation.mutate({
          ids: selectedCourses,
          updates: { is_featured: false },
        });
        break;
      case "delete":
        if (
          window.confirm(
            `Are you sure you want to delete ${selectedCourses.length} courses?`
          )
        ) {
          bulkDeleteMutation.mutate(selectedCourses);
        }
        break;
      case "assign":
        setShowBulkAssignment(true);
        break;
    }
  };

  const formatPrice = (priceCents) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(priceCents / 100);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">
          Error Loading Courses
        </h3>
        <p className="text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Course Management
          </h2>
          <p className="text-gray-600">
            Manage your courses, content, and settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setEditingCourse(null);
              setShowCourseForm(true);
            }}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.published}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Enrollments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEnrollments}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.featured}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {Array.isArray(categories) &&
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor
                </label>
                <select
                  value={filters.instructor}
                  onChange={(e) =>
                    handleFilterChange("instructor", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Instructors</option>
                  {instructors?.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="enrolled_count-desc">Most Enrolled</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedCourses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-800">
              {selectedCourses.length} course
              {selectedCourses.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("publish")}
                disabled={bulkUpdateMutation.isPending}
              >
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("unpublish")}
                disabled={bulkUpdateMutation.isPending}
              >
                Unpublish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("feature")}
                disabled={bulkUpdateMutation.isPending}
              >
                Feature
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("unfeature")}
                disabled={bulkUpdateMutation.isPending}
              >
                Unfeature
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("assign")}
                disabled={bulkUpdateMutation.isPending}
              >
                <Users className="w-4 h-4 mr-1" />
                Assign to Instructor
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkAction("delete")}
                disabled={bulkDeleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading courses...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedCourses.length ===
                            coursesData?.courses?.length &&
                          coursesData?.courses?.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coursesData?.courses?.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleSelectCourse(course.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={
                                course.thumbnail || "/placeholder-course.jpg"
                              }
                              alt={course.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.subtitle}
                            </div>
                            <div className="flex items-center mt-1">
                              <Clock className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">
                                {formatDuration(course.estimated_duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={
                                course.instructor?.avatar_url ||
                                "/placeholder-avatar.jpg"
                              }
                              alt={course.instructor?.full_name}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {course.instructor?.full_name || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.category?.name || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.is_free ? (
                          <span className="text-green-600 font-medium">
                            Free
                          </span>
                        ) : (
                          formatPrice(course.price_cents)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.enrolled_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {course.is_published ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Draft
                            </span>
                          )}
                          {course.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                course.id,
                                "is_published",
                                course.is_published
                              )
                            }
                            className="text-gray-400 hover:text-gray-600"
                            title={
                              course.is_published ? "Unpublish" : "Publish"
                            }
                          >
                            {course.is_published ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                course.id,
                                "is_featured",
                                course.is_featured
                              )
                            }
                            className="text-gray-400 hover:text-yellow-600"
                            title={
                              course.is_featured
                                ? "Remove from featured"
                                : "Add to featured"
                            }
                          >
                            {course.is_featured ? (
                              <StarOff className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Edit course"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {coursesData?.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, coursesData.totalPages)
                      )
                    }
                    disabled={currentPage === coursesData.totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, coursesData.total)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{coursesData.total}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from(
                        { length: coursesData.totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, coursesData.totalPages)
                          )
                        }
                        disabled={currentPage === coursesData.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Course Form Modal */}
      <Modal
        isOpen={showCourseForm}
        onClose={() => {
          setShowCourseForm(false);
          setEditingCourse(null);
        }}
        title={editingCourse ? "Edit Course" : "Create New Course"}
        size="xl"
      >
        <ComprehensiveCourseBuilder
          course={editingCourse}
          onSuccess={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
            queryClient.invalidateQueries(["courses"]);
            queryClient.invalidateQueries(["course-stats"]);
          }}
          onCancel={() => {
            setShowCourseForm(false);
            setEditingCourse(null);
          }}
        />
      </Modal>

      {/* Bulk Course Assignment Modal */}
      <BulkCourseAssignment
        isOpen={showBulkAssignment}
        onClose={() => setShowBulkAssignment(false)}
        selectedCourses={selectedCourses}
      />
    </div>
  );
};

export default CourseManagement;
