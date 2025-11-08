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
  User,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Download,
  Upload,
  Award,
  BookOpen,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { instructorManagementService } from "../../services/courseManagementService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

// Validation schema for instructor
const instructorSchema = yup.object({
  full_name: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  bio: yup
    .string()
    .required("Bio is required")
    .min(50, "Bio must be at least 50 characters"),
  avatar_url: yup.string().url("Please enter a valid URL"),
  expertise: yup.string().required("Expertise area is required"),
  experience_years: yup
    .number()
    .min(0, "Experience cannot be negative")
    .required("Years of experience is required"),
  hourly_rate: yup
    .number()
    .min(0, "Hourly rate cannot be negative")
    .required("Hourly rate is required"),
  is_active: yup.boolean(),
});

const InstructorForm = ({ instructor, onSuccess, onCancel }) => {
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(instructorSchema),
    defaultValues: {
      full_name: "",
      email: "",
      bio: "",
      avatar_url: "",
      expertise: "",
      experience_years: 0,
      hourly_rate: 0,
      is_active: true,
    },
  });

  const avatar = watch("avatar_url");

  // Mutations
  const createInstructorMutation = useMutation({
    mutationFn: instructorManagementService.createInstructor,
    onSuccess: () => {
      toast.success("Instructor created successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to create instructor: " + error.message);
    },
  });

  const updateInstructorMutation = useMutation({
    mutationFn: ({ id, data }) =>
      instructorManagementService.updateInstructor(id, data),
    onSuccess: () => {
      toast.success("Instructor updated successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to update instructor: " + error.message);
    },
  });

  // Initialize form with instructor data
  React.useEffect(() => {
    if (instructor) {
      reset({
        full_name: instructor.full_name || "",
        email: instructor.email || "",
        bio: instructor.bio || "",
        avatar_url: instructor.avatar_url || "",
        expertise: instructor.expertise || "",
        experience_years: instructor.experience_years || 0,
        hourly_rate: instructor.hourly_rate || 0,
        is_active: instructor.is_active !== false,
      });
      setAvatarPreview(instructor.avatar_url || "");
    }
  }, [instructor, reset]);

  // Update avatar preview
  React.useEffect(() => {
    if (avatar) {
      setAvatarPreview(avatar);
    }
  }, [avatar]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (instructor) {
        await updateInstructorMutation.mutateAsync({
          id: instructor.id,
          data,
        });
      } else {
        await createInstructorMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setValue("avatar_url", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPrice = (priceInBDT) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(priceInBDT);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...register("full_name")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter instructor's full name"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise Area *
                </label>
                <input
                  {...register("expertise")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., React Development, UI/UX Design"
                />
                {errors.expertise && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.expertise.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio *
                </label>
                <textarea
                  {...register("bio")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter detailed bio about the instructor"
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.bio.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Professional Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  {...register("experience_years", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5"
                />
                {errors.experience_years && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.experience_years.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Hourly Rate (BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ৳
                  </span>
                  <input
                    {...register("hourly_rate", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="100"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                {watch("hourly_rate") > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {formatPrice(watch("hourly_rate"))} per hour
                  </p>
                )}
                {errors.hourly_rate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.hourly_rate.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Profile Picture
            </h3>

            <div className="space-y-4">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Instructor avatar"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview("");
                      setValue("avatar_url", "");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload avatar</p>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter image URL
                </label>
                <input
                  {...register("avatar_url")}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                {errors.avatar_url && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.avatar_url.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register("is_active")}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <Eye className="w-4 h-4 mr-1 text-green-500" />
                  Active instructor
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
                className="flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {instructor ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    {instructor ? "Update Instructor" : "Create Instructor"}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

const InstructorManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    expertise: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch instructors
  const {
    data: instructorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["instructors", searchTerm, filters, currentPage, pageSize],
    queryFn: () =>
      instructorManagementService.getInstructors({
        search: searchTerm,
        ...filters,
        page: currentPage,
        limit: pageSize,
      }),
  });

  // Fetch instructor stats
  const { data: stats } = useQuery({
    queryKey: ["instructor-stats"],
    queryFn: instructorManagementService.getInstructorStats,
  });

  // Mutations
  const deleteInstructorMutation = useMutation({
    mutationFn: instructorManagementService.deleteInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries(["instructors"]);
      queryClient.invalidateQueries(["instructor-stats"]);
      toast.success("Instructor deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete instructor: " + error.message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) =>
      instructorManagementService.toggleInstructorStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries(["instructors"]);
      queryClient.invalidateQueries(["instructor-stats"]);
      toast.success("Instructor status updated");
    },
    onError: (error) => {
      toast.error("Failed to update instructor: " + error.message);
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

  const handleSelectInstructor = (instructorId) => {
    setSelectedInstructors((prev) =>
      prev.includes(instructorId)
        ? prev.filter((id) => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInstructors.length === instructorsData?.instructors?.length) {
      setSelectedInstructors([]);
    } else {
      setSelectedInstructors(
        instructorsData?.instructors?.map((instructor) => instructor.id) || []
      );
    }
  };

  const handleToggleStatus = (instructorId, currentStatus) => {
    toggleStatusMutation.mutate({
      id: instructorId,
      is_active: !currentStatus,
    });
  };

  const handleDeleteInstructor = (instructorId) => {
    if (window.confirm("Are you sure you want to delete this instructor?")) {
      deleteInstructorMutation.mutate(instructorId);
    }
  };

  const handleEditInstructor = (instructor) => {
    setEditingInstructor(instructor);
    setShowInstructorForm(true);
  };

  const handleCreateInstructor = () => {
    setEditingInstructor(null);
    setShowInstructorForm(true);
  };

  const formatPrice = (priceCents) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(priceCents);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800">
          Error Loading Instructors
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
            Instructor Management
          </h2>
          <p className="text-gray-600">Manage instructors and their profiles</p>
        </div>
        <Button
          onClick={handleCreateInstructor}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Instructor
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Instructors
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
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCourses}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg. Hourly Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats.averageHourlyRate)}
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
                placeholder="Search instructors..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise
                </label>
                <input
                  type="text"
                  placeholder="e.g., React, Python"
                  value={filters.expertise}
                  onChange={(e) =>
                    handleFilterChange("expertise", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  <option value="full_name-asc">Name A-Z</option>
                  <option value="full_name-desc">Name Z-A</option>
                  <option value="experience_years-desc">
                    Most Experienced
                  </option>
                  <option value="hourly_rate-desc">Highest Rate</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructors Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading instructors...</p>
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
                          selectedInstructors.length ===
                            instructorsData?.instructors?.length &&
                          instructorsData?.instructors?.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expertise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hourly Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses
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
                  {instructorsData?.instructors?.map((instructor) => (
                    <tr key={instructor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedInstructors.includes(instructor.id)}
                          onChange={() => handleSelectInstructor(instructor.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={
                                instructor.avatar_url ||
                                "/placeholder-avatar.jpg"
                              }
                              alt={instructor.full_name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {instructor.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {instructor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instructor.expertise}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instructor.experience_years} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(instructor.hourly_rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {instructor.courses_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {instructor.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(
                                instructor.id,
                                instructor.is_active
                              )
                            }
                            className="text-gray-400 hover:text-gray-600"
                            title={
                              instructor.is_active ? "Deactivate" : "Activate"
                            }
                          >
                            {instructor.is_active ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditInstructor(instructor)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Edit instructor"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteInstructor(instructor.id)
                            }
                            className="text-gray-400 hover:text-red-600"
                            title="Delete instructor"
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
            {instructorsData?.totalPages > 1 && (
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
                        Math.min(prev + 1, instructorsData.totalPages)
                      )
                    }
                    disabled={currentPage === instructorsData.totalPages}
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
                        {Math.min(
                          currentPage * pageSize,
                          instructorsData.total
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {instructorsData.total}
                      </span>{" "}
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
                        { length: instructorsData.totalPages },
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
                            Math.min(prev + 1, instructorsData.totalPages)
                          )
                        }
                        disabled={currentPage === instructorsData.totalPages}
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

      {/* Instructor Form Modal */}
      <Modal
        isOpen={showInstructorForm}
        onClose={() => {
          setShowInstructorForm(false);
          setEditingInstructor(null);
        }}
        title={editingInstructor ? "Edit Instructor" : "Add New Instructor"}
        size="xl"
      >
        <InstructorForm
          instructor={editingInstructor}
          onSuccess={() => {
            setShowInstructorForm(false);
            setEditingInstructor(null);
            queryClient.invalidateQueries(["instructors"]);
            queryClient.invalidateQueries(["instructor-stats"]);
          }}
          onCancel={() => {
            setShowInstructorForm(false);
            setEditingInstructor(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default InstructorManagement;
