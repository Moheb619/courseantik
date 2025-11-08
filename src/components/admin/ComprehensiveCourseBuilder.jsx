import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Settings,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  courseManagementService,
  categoryManagementService,
  instructorManagementService,
} from "../../services/courseManagementService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ModuleBuilder from "./ModuleBuilder";
import ImageUpload from "../ui/ImageUpload";

// Validation schema for comprehensive course - simplified for better UX
const courseBuilderSchema = yup.object({
  // Course basic info - only required fields
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
  thumbnail: yup.string().nullable(),
  price_cents: yup.number().min(0).default(0),
  is_free: yup.boolean().default(false),
  is_featured: yup.boolean().default(false),
  is_published: yup.boolean().default(false),
  instructor_id: yup.string().required("Please select an instructor"),
  category_id: yup.string().required("Please select a category"),
  estimated_duration: yup
    .number()
    .min(1, "Duration must be at least 1 minute")
    .required("Duration is required"),
  difficulty_level: yup
    .string()
    .oneOf(["beginner", "intermediate", "advanced"])
    .default("beginner"),
  includes_certificate: yup.boolean().default(false),

  // Modules - make structure more flexible
  modules: yup.array().default([]),
});

const ComprehensiveCourseBuilder = ({ course, onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm({
    resolver: yupResolver(courseBuilderSchema),
    mode: "onBlur",
    defaultValues: {
      title: "Complete Web Development Bootcamp 2024",
      subtitle:
        "Master Modern Web Development from Scratch - HTML, CSS, JavaScript, React, Node.js & More",
      description: `# Course Overview

This comprehensive course will take you from absolute beginner to professional web developer.

## What You'll Learn

- **HTML5 & CSS3**: Build beautiful, responsive websites
- **JavaScript ES6+**: Master modern JavaScript programming
- **React**: Create dynamic single-page applications
- **Node.js & Express**: Build scalable backend APIs
- **MongoDB**: Work with NoSQL databases
- **Full-Stack Projects**: Deploy real-world applications

## Who This Course Is For

- Complete beginners with no programming experience
- Career changers looking to break into tech
- Developers wanting to update their skills
- Anyone wanting to build web applications

## Requirements

- A computer with internet connection
- No prior programming experience required
- Willingness to learn and practice

Perfect for career changers and aspiring developers who want to break into tech!`,
      thumbnail:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      price_cents: 99,
      is_free: false,
      is_featured: true,
      is_published: false,
      instructor_id: "",
      category_id: "",
      estimated_duration: 480,
      difficulty_level: "beginner",
      includes_certificate: true,
      modules: [],
    },
  });

  const {
    fields: moduleFields,
    append: appendModule,
    remove: removeModule,
    move: moveModule,
  } = useFieldArray({
    control,
    name: "modules",
  });

  // Fetch categories and instructors
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryManagementService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: instructors, isLoading: instructorsLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: instructorManagementService.getInstructors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Initialize form with course data
  useEffect(() => {
    if (course) {
      reset({
        ...course,
        price_cents: course.price_cents ? course.price_cents / 100 : 0, // Convert cents to BDT for form
        modules: course.modules || [],
      });
    }
  }, [course, reset]);

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);
    try {
      // Sanitize and prepare modules data
      const sanitizedModules = (data.modules || []).map((module, index) => {
        // Check if this is an existing module (has a real UUID id) or new (has react-hook-form's temp id)
        const moduleId = module.id;
        const isExistingModule = moduleId && moduleId.length > 20; // UUID is longer than react-hook-form's id

        const { id: _formId, ...moduleData } = module;
        return {
          ...(isExistingModule && { id: moduleId }), // Preserve ID if editing existing module
          ...moduleData,
          module_order: moduleData.module_order || index + 1, // Ensure module_order is set
          pass_marks: moduleData.pass_marks || 70,
          is_required: moduleData.is_required !== false,
          // Sanitize lessons
          lessons: (moduleData.lessons || []).map((lesson, lessonIndex) => {
            const { id: lessonId, resources, ...lessonData } = lesson;
            const isExistingLesson = lessonId && lessonId.length > 20; // UUID check

            // Move resources into content JSONB field if they exist
            const content = lessonData.content || {};
            if (resources && resources.length > 0) {
              content.resources = resources;
            }

            // Generate slug if not provided
            const slug =
              lessonData.slug ||
              lessonData.title
                ?.toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") ||
              `lesson-${lessonIndex + 1}`;

            return {
              ...(isExistingLesson && { id: lessonId }), // Preserve ID if editing existing lesson
              ...lessonData,
              slug,
              lesson_order: lessonData.lesson_order || lessonIndex + 1,
              duration: lessonData.duration || 0,
              video_type: lessonData.video_type || "youtube",
              is_free_preview: lessonData.is_free_preview || false,
              content: content, // Ensure content is always set
            };
          }),
          // Sanitize quiz data
          quiz: moduleData.quiz
            ? {
                ...(moduleData.quiz.id && { id: moduleData.quiz.id }), // Preserve ID if editing
                title: moduleData.quiz.title,
                description: moduleData.quiz.description,
                pass_marks:
                  moduleData.quiz.pass_marks || moduleData.quiz.passMarks || 70,
                time_limit:
                  moduleData.quiz.time_limit ||
                  moduleData.quiz.timeLimit ||
                  null,
                is_required:
                  moduleData.quiz.is_required !== undefined
                    ? moduleData.quiz.is_required
                    : moduleData.quiz.isRequired !== undefined
                    ? moduleData.quiz.isRequired
                    : true,
                max_attempts:
                  moduleData.quiz.max_attempts ||
                  moduleData.quiz.maxAttempts ||
                  null,
                questions: moduleData.quiz.questions || [],
              }
            : null,
          // Sanitize assignment data
          assignment: moduleData.assignment
            ? {
                ...(moduleData.assignment.id && {
                  id: moduleData.assignment.id,
                }), // Preserve ID if editing
                title: moduleData.assignment.title,
                description: moduleData.assignment.description,
                requirements: moduleData.assignment.requirements,
                submission_type:
                  moduleData.assignment.submission_type ||
                  moduleData.assignment.submissionType ||
                  "file",
                allowed_file_types:
                  moduleData.assignment.allowed_file_types ||
                  moduleData.assignment.allowedFileTypes ||
                  [],
                max_file_size:
                  moduleData.assignment.max_file_size ||
                  moduleData.assignment.maxFileSize ||
                  10,
                pass_marks:
                  moduleData.assignment.pass_marks ||
                  moduleData.assignment.passMarks ||
                  70,
                is_required:
                  moduleData.assignment.is_required !== undefined
                    ? moduleData.assignment.is_required
                    : moduleData.assignment.isRequired !== undefined
                    ? moduleData.assignment.isRequired
                    : true,
                due_date:
                  moduleData.assignment.due_date ||
                  moduleData.assignment.dueDate ||
                  null,
                rubric: moduleData.assignment.rubric || [],
              }
            : null,
        };
      });

      // Convert BDT amount to cents and prepare final data
      const formData = {
        ...data,
        price_cents: data.is_free ? 0 : Math.round(data.price_cents * 100),
        modules: sanitizedModules,
      };

      console.log("Processed form data:", formData);
      console.log("Sanitized modules:", sanitizedModules);

      // Log detailed structure for debugging
      if (sanitizedModules.length > 0) {
        console.log("Sample module structure:", sanitizedModules[0]);
        if (sanitizedModules[0].lessons?.length > 0) {
          console.log(
            "Sample lesson structure:",
            sanitizedModules[0].lessons[0]
          );
        }
        if (sanitizedModules[0].quiz) {
          console.log("Sample quiz structure:", sanitizedModules[0].quiz);
          console.log("Quiz keys:", Object.keys(sanitizedModules[0].quiz));
        }
        if (sanitizedModules[0].assignment) {
          console.log(
            "Sample assignment structure:",
            sanitizedModules[0].assignment
          );
        }
      }

      if (course) {
        await courseManagementService.updateCourseWithStructure(
          course.id,
          formData
        );
      } else {
        await courseManagementService.createCourseWithStructure(formData);
      }

      toast.success(
        course ? "Course updated successfully" : "Course created successfully"
      );
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save course: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors) => {
    console.error("Form validation errors:", errors);
    toast.error("Please fix the form errors before submitting");

    // Show specific error messages
    if (errors.title) toast.error("Title: " + errors.title.message);
    if (errors.subtitle) toast.error("Subtitle: " + errors.subtitle.message);
    if (errors.description)
      toast.error("Description: " + errors.description.message);
    if (errors.instructor_id)
      toast.error("Instructor: " + errors.instructor_id.message);
    if (errors.category_id)
      toast.error("Category: " + errors.category_id.message);
    if (errors.estimated_duration)
      toast.error("Duration: " + errors.estimated_duration.message);
  };

  const addModule = () => {
    const currentModuleCount = moduleFields.length;
    console.log("Adding new module. Current module count:", currentModuleCount);
    const newModule = {
      title: `Module ${
        currentModuleCount + 1
      }: Introduction to Web Development`,
      description: `In this module, you'll learn the fundamentals of web development including HTML, CSS, and JavaScript basics. You'll build your first web page and understand how the web works.`,
      module_order: currentModuleCount + 1,
      estimated_time: "2 hours",
      pass_marks: 70,
      is_required: true,
      lessons: [],
      quiz: null,
      assignment: null,
    };
    appendModule(newModule);
    console.log("Module appended. Setting edit index to:", currentModuleCount);
    // Use the index where it will be added (current length becomes the new index)
    setEditingModule({
      ...newModule,
      moduleIndex: currentModuleCount,
      isNew: true,
    });
    setShowModuleModal(true);
  };

  const handleSaveModule = () => {
    const moduleData = watch(`modules.${editingModule?.moduleIndex}`);
    console.log("Saving module at index:", editingModule?.moduleIndex);
    console.log("Module data:", moduleData);
    console.log("Is new module:", editingModule?.isNew);
    console.log("Total modules after save:", moduleFields.length);

    // Validate that the module has required data
    if (editingModule?.isNew && !moduleData?.title) {
      toast.error("Please provide a module title");
      return;
    }

    if (editingModule?.isNew) {
      toast.success("Module added successfully");
    } else {
      toast.success("Module updated successfully");
    }

    setShowModuleModal(false);
    setEditingModule(null);
  };

  const handleCancelModule = () => {
    console.log("Canceling module. Is new:", editingModule?.isNew);
    console.log("Module index to remove:", editingModule?.moduleIndex);
    // If it was a new module and user cancels, remove it
    if (editingModule?.isNew) {
      removeModule(editingModule.moduleIndex);
      console.log("Removed module. Remaining count:", moduleFields.length - 1);
    }
    setShowModuleModal(false);
    setEditingModule(null);
  };

  const steps = [
    { id: 1, name: "Basic Info", icon: Settings },
    { id: 2, name: "Modules", icon: BookOpen },
    { id: 3, name: "Review", icon: Eye },
  ];

  return (
    <div className="space-y-6 text-black">
      {/* Progress Steps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <nav className="flex items-center justify-between">
          {steps.map((step, stepIdx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? "text-blue-600" : "text-gray-600"
                }`}
              >
                {step.name}
              </span>
              {stepIdx < steps.length - 1 && (
                <div
                  className={`ml-4 w-16 h-0.5 ${
                    currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {currentStep === 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Course Basic Information
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <p className="mt-1 text-sm text-red-600">
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subtitle.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description * (Markdown Supported)
                  </label>
                  <textarea
                    {...register("description")}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter detailed course description using Markdown...

# Main heading
## Subheading
- Bullet point
- Another point

**Bold text** and *italic text*

[Link text](https://example.com)"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Tip: Use Markdown formatting for better presentation.
                    Supports headings, lists, bold, italic, and links.
                  </p>
                </div>

                <div>
                  <ImageUpload
                    label="Course Thumbnail"
                    helperText="Recommended size: 1280x720px (16:9 aspect ratio)"
                    aspectRatio="16/9"
                    uploadType="course-thumbnail"
                    entityId={course?.id}
                    existingImageUrl={watch("thumbnail")}
                    maxSizeMB={5}
                    onUploadComplete={(publicUrl, path) => {
                      setValue("thumbnail", publicUrl, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    onRemove={() => {
                      setValue("thumbnail", null, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />
                  {errors.thumbnail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.thumbnail.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor *
                  </label>
                  <select
                    {...register("instructor_id")}
                    disabled={instructorsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {instructorsLoading
                        ? "Loading instructors..."
                        : "Select an instructor"}
                    </option>
                    {Array.isArray(instructors) &&
                      instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.full_name}
                        </option>
                      ))}
                  </select>
                  {errors.instructor_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.instructor_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register("category_id")}
                    disabled={categoriesLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "Select a category"}
                    </option>
                    {Array.isArray(categories) &&
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category_id.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.difficulty_level.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.estimated_duration.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (BDT)
                  </label>
                  <input
                    {...register("price_cents", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={watch("is_free")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="e.g., 99.00"
                  />
                  {errors.price_cents && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.price_cents.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...register("is_free")}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue("price_cents", 0);
                      }
                    }}
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    This is a free course
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...register("is_featured")}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Featured course
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...register("is_published")}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Publish course
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    {...register("includes_certificate")}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Includes certificate
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Course Modules & Content
              </h3>
              <Button
                type="button"
                onClick={addModule}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Module
              </Button>
            </div>

            {moduleFields.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No modules yet
                </h4>
                <p className="text-gray-600 mb-4">
                  Add your first module to start building your course content.
                </p>
                <Button
                  type="button"
                  onClick={addModule}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  console.log(
                    "Rendering modules. Total count:",
                    moduleFields.length
                  );
                  console.log(
                    "Module fields:",
                    moduleFields.map((m) => ({
                      id: m.id,
                      title: watch(`modules.${moduleFields.indexOf(m)}.title`),
                    }))
                  );
                  return null;
                })()}
                {moduleFields.map((module, moduleIndex) => (
                  <div
                    key={module.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          Module {moduleIndex + 1}
                        </span>
                        <h4 className="text-lg font-medium text-gray-900">
                          {watch(`modules.${moduleIndex}.title`) ||
                            "Untitled Module"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingModule({
                              ...module,
                              moduleIndex,
                              isNew: false,
                            });
                            setShowModuleModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeModule(moduleIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Video className="w-4 h-4" />
                        <span>
                          {watch(`modules.${moduleIndex}.lessons`)?.length || 0}{" "}
                          lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HelpCircle className="w-4 h-4" />
                        <span>
                          {watch(`modules.${moduleIndex}.quiz`)
                            ? "Quiz included"
                            : "No quiz"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>
                          {watch(`modules.${moduleIndex}.assignment`)
                            ? "Assignment included"
                            : "No assignment"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Review & Publish
            </h3>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Course Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Title:</span>{" "}
                    {watch("title") || "Not set"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Subtitle:</span>{" "}
                    {watch("subtitle") || "Not set"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Category:</span>{" "}
                    {categories?.find((c) => c.id === watch("category_id"))
                      ?.name || "Not selected"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Instructor:</span>{" "}
                    {instructors?.find((i) => i.id === watch("instructor_id"))
                      ?.full_name || "Not selected"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Duration:</span>{" "}
                    {watch("estimated_duration") || 0} minutes
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Modules:</span>{" "}
                    {moduleFields.length}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Difficulty:</span>{" "}
                    {watch("difficulty_level") || "beginner"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Price:</span>{" "}
                    {watch("is_free")
                      ? "Free"
                      : `${watch("price_cents") || 0} BDT`}
                  </p>
                </div>
              </div>

              {/* Show validation errors if any */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Please fix the following errors:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {errors.title && <li>Title: {errors.title.message}</li>}
                    {errors.subtitle && (
                      <li>Subtitle: {errors.subtitle.message}</li>
                    )}
                    {errors.description && (
                      <li>Description: {errors.description.message}</li>
                    )}
                    {errors.instructor_id && (
                      <li>Instructor: {errors.instructor_id.message}</li>
                    )}
                    {errors.category_id && (
                      <li>Category: {errors.category_id.message}</li>
                    )}
                    {errors.estimated_duration && (
                      <li>Duration: {errors.estimated_duration.message}</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <input
                      {...register("is_published")}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">
                      Publish immediately
                    </label>
                  </div>
                </div>

                {/* Debug button for development */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const formData = watch();
                    console.log("Current form data:", formData);
                    console.log("Form errors:", errors);
                    toast.success("Form data logged to console");
                  }}
                >
                  Debug: Log Form Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                onCancel();
              }
            }}
          >
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>

          <div className="flex gap-3">
            {currentStep < 3 && (
              <Button
                type="button"
                variant="primary"
                onClick={async () => {
                  // Validate current step before proceeding
                  if (currentStep === 1) {
                    const isStepValid = await trigger([
                      "title",
                      "subtitle",
                      "description",
                      "instructor_id",
                      "category_id",
                      "estimated_duration",
                      "difficulty_level",
                    ]);
                    if (!isStepValid) {
                      toast.error(
                        "Please fill in all required fields in step 1"
                      );
                      return;
                    }
                  }
                  setCurrentStep(currentStep + 1);
                }}
              >
                Next
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {course ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {course ? "Update Course" : "Create Course"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Module Builder Modal */}
      <ModuleBuilder
        isOpen={showModuleModal}
        onClose={handleCancelModule}
        module={editingModule}
        onSave={handleSaveModule}
        control={control}
        moduleIndex={editingModule?.moduleIndex || 0}
        register={register}
        setValue={setValue}
        watch={watch}
        courseId={course?.id}
      />
    </div>
  );
};

export default ComprehensiveCourseBuilder;
