import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  BookOpen,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { courseManagementService } from "../../services/courseManagementService";
import { userService } from "../../services/userService";
import { storageService } from "../../services/storageService";
import Button from "../ui/Button";
import InstructorSelector from "./InstructorSelector";
import DynamicCategorySelector from "./DynamicCategorySelector";

// Validation schema
const courseSchema = yup.object({
  title: yup
    .string()
    .required("Course title is required")
    .min(3, "Title must be at least 3 characters"),
  subtitle: yup
    .string()
    .required("Course subtitle is required")
    .min(10, "Subtitle must be at least 10 characters"),
  description: yup
    .string()
    .required("Course description is required")
    .min(50, "Description must be at least 50 characters"),
  thumbnail: yup.string().url("Please enter a valid URL"),
  price_cents: yup.number().min(0, "Price cannot be negative"),
  is_free: yup.boolean(),
  is_featured: yup.boolean(),
  is_published: yup.boolean(),
  instructor_id: yup.string().required("Please select an instructor"),
  category_id: yup.string().required("Please select a category"),
  estimated_duration: yup.number().min(1, "Duration must be at least 1 minute"),
  difficulty_level: yup
    .string()
    .oneOf(
      ["beginner", "intermediate", "advanced"],
      "Please select a difficulty level"
    ),
  includes_certificate: yup.boolean(),
});

const CourseForm = ({ course, onSuccess, onCancel }) => {
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      thumbnail: "",
      price_cents: 0,
      is_free: false,
      is_featured: false,
      is_published: false,
      instructor_id: "",
      category_id: "",
      estimated_duration: 0,
      difficulty_level: "beginner",
      includes_certificate: false,
    },
  });

  const isFree = watch("is_free");
  const thumbnail = watch("thumbnail");

  // Fetch instructors

  const {
    data: instructors,
    isLoading: instructorsLoading,
    error: instructorsError,
  } = useQuery({
    queryKey: ["instructors"],
    queryFn: userService.getInstructors,
  });

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: courseManagementService.createCourse,
    onSuccess: () => {
      toast.success("Course created successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to create course: " + error.message);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }) =>
      courseManagementService.updateCourse(id, data),
    onSuccess: () => {
      toast.success("Course updated successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error("Failed to update course: " + error.message);
    },
  });

  // Initialize form with course data
  useEffect(() => {
    if (course) {
      reset({
        title: course.title || "",
        subtitle: course.subtitle || "",
        description: course.description || "",
        thumbnail: course.thumbnail || "",
        price_cents: course.price_cents
          ? Math.round(course.price_cents / 100)
          : 0,
        is_free: course.is_free || false,
        is_featured: course.is_featured || false,
        is_published: course.is_published || false,
        instructor_id: course.instructor_id || "",
        category_id: course.category_id || "",
        estimated_duration: course.estimated_duration || 0,
        difficulty_level: course.difficulty_level || "beginner",
        includes_certificate: course.includes_certificate || false,
      });
      setThumbnailPreview(course.thumbnail || "");
    }
  }, [course, reset]);

  // Update thumbnail preview
  useEffect(() => {
    if (thumbnail) {
      setThumbnailPreview(thumbnail);
    }
  }, [thumbnail]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert BDT amount to cents for database storage
      const formData = {
        ...data,
        price_cents: data.is_free ? 0 : Math.round(data.price_cents * 100),
      };

      if (course) {
        await updateCourseMutation.mutateAsync({
          id: course.id,
          data: formData,
        });
      } else {
        const result = await createCourseMutation.mutateAsync(formData);

        // If thumbnail is a temporary file, move it to permanent location
        if (
          data.thumbnail &&
          data.thumbnail.includes("course-thumbnails/temp/")
        ) {
          try {
            const tempPath = data.thumbnail.split("/").slice(-2).join("/"); // Get temp path
            const { data: moveResult, error: moveError } =
              await storageService.moveTempThumbnailToPermanent(
                `course-thumbnails/temp/${tempPath}`,
                result.id
              );

            if (!moveError && moveResult) {
              // Update the course with the permanent thumbnail URL
              await courseManagementService.updateCourse(result.id, {
                ...formData,
                thumbnail: moveResult.url,
              });
            }
          } catch (error) {
            console.warn(
              "Failed to move temp thumbnail to permanent location:",
              error
            );
          }
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setIsUploadingThumbnail(true);

      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          setThumbnailPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase storage
        const { data, error } = await storageService.uploadCourseThumbnail(
          file,
          course?.id
        );

        if (error) {
          console.error("Upload error:", error);
          toast.error(
            `Failed to upload image: ${error.message || "Please try again."}`
          );
          setThumbnailPreview("");
          setValue("thumbnail", "");
          return;
        }

        // Set the public URL as the thumbnail value
        setValue("thumbnail", data.url);
        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload image. Please try again.");
        setThumbnailPreview("");
        setValue("thumbnail", "");
      } finally {
        setIsUploadingThumbnail(false);
      }
    }
  };

  const formatPrice = (priceInBDT) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(priceInBDT);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
                  Course Title *
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Subtitle *
                </label>
                <input
                  {...register("subtitle")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course subtitle"
                />
                {errors.subtitle && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.subtitle.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter detailed course description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Course Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Course Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <InstructorSelector
                  selectedInstructor={watch("instructor_id")}
                  onInstructorSelect={(instructor) => {
                    setValue("instructor_id", instructor.id);
                  }}
                />
                {errors.instructor_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.instructor_id.message}
                  </p>
                )}
              </div>

              <div>
                <DynamicCategorySelector
                  selectedCategoryId={watch("category_id")}
                  onCategorySelect={(categoryId) => {
                    setValue("category_id", categoryId);
                  }}
                  error={errors.category_id?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  {...register("difficulty_level")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.difficulty_level && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.difficulty_level.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (minutes) *
                </label>
                <input
                  {...register("estimated_duration", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 120"
                />
                {errors.estimated_duration && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.estimated_duration.message}
                  </p>
                )}
                {watch("estimated_duration") > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDuration(watch("estimated_duration"))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register("is_free")}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  This is a free course
                </label>
              </div>

              {!isFree && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Price (BDT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ৳
                    </span>
                    <input
                      {...register("price_cents", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="1"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setValue("price_cents", value);
                      }}
                    />
                  </div>
                  {watch("price_cents") > 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      {formatPrice(watch("price_cents"))}
                    </p>
                  )}
                  {errors.price_cents && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.price_cents.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Course Thumbnail
            </h3>

            <div className="space-y-4">
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Course thumbnail"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {isUploadingThumbnail && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview("");
                      setValue("thumbnail", "");
                    }}
                    disabled={isUploadingThumbnail}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload thumbnail</p>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={isUploadingThumbnail}
                />
                <label
                  htmlFor="thumbnail-upload"
                  className={`w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
                    isUploadingThumbnail ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploadingThumbnail ? "Uploading..." : "Choose Image"}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter image URL
                </label>
                <input
                  {...register("thumbnail")}
                  type="url"
                  disabled={isUploadingThumbnail}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isUploadingThumbnail ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.thumbnail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.thumbnail.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Course Options */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Course Options
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register("is_featured")}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  Featured course
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register("is_published")}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <Eye className="w-4 h-4 mr-1 text-green-500" />
                  Publish course
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register("includes_certificate")}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <BookOpen className="w-4 h-4 mr-1 text-blue-500" />
                  Includes certificate
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
                    {course ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {course ? "Update Course" : "Create Course"}
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

export default CourseForm;
