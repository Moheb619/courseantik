import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import {
  Video,
  Link,
  FileText,
  Upload,
  Eye,
  Clock,
  Play,
  Save,
  AlertCircle,
  File,
  Image,
  Trash2,
  Plus,
} from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import storageService from "../../services/storageService";

const lessonSchema = yup.object({
  title: yup.string().required("Lesson title is required").min(3),
  slug: yup.string(),
  description: yup.string(),
  lesson_order: yup.number().required().min(1),
  duration: yup.number().min(0).default(0),
  video_file: yup.string(), // Will store the uploaded file path
  video_url: yup.string(), // Keep for backward compatibility
  video_type: yup
    .string()
    .oneOf(["youtube", "vimeo", "direct", "uploaded"])
    .default("uploaded"),
  is_free_preview: yup.boolean().default(false),
  resources: yup
    .array()
    .of(
      yup.object({
        id: yup.string(),
        type: yup.string().oneOf(["text", "file"]).required(),
        title: yup.string().required(),
        content: yup.string(), // For text resources
        file_path: yup.string(), // For file resources
        file_name: yup.string(),
        file_size: yup.number(),
        file_type: yup.string(),
      })
    )
    .default([]),
});

const LessonBuilder = ({
  isOpen,
  onClose,
  lesson,
  onSave,
  courseId = null,
  moduleId = null,
  lessonId = null,
}) => {
  const [videoType, setVideoType] = useState("uploaded");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [resources, setResources] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(lessonSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      lesson_order: 1,
      duration: 0,
      video_file: "",
      video_url: "",
      video_type: "uploaded",
      is_free_preview: false,
      resources: [],
    },
  });

  const watchedVideoUrl = watch("video_url");
  const watchedVideoType = watch("video_type");

  useEffect(() => {
    if (lesson) {
      // Extract resources from content JSONB field
      let lessonResources = [];

      if (lesson.content) {
        // Add file resources from content.resources
        if (
          lesson.content.resources &&
          Array.isArray(lesson.content.resources)
        ) {
          lessonResources = [...lesson.content.resources];
        }

        // Add text resources from content.materials
        if (
          lesson.content.materials &&
          Array.isArray(lesson.content.materials)
        ) {
          lesson.content.materials.forEach((material, index) => {
            lessonResources.push({
              id: `text-${index}`,
              type: "text",
              title: `Material ${index + 1}`,
              content: material,
            });
          });
        }
      }

      // Fallback to resources array if it exists
      if (
        lesson.resources &&
        Array.isArray(lesson.resources) &&
        lesson.resources.length > 0
      ) {
        lessonResources = lesson.resources;
      }

      reset({
        title: lesson.title || "",
        slug: lesson.slug || "",
        description: lesson.description || "",
        lesson_order: lesson.lesson_order || 1,
        duration: lesson.duration || 0,
        video_file: lesson.video_file || "",
        video_url: lesson.video_url || "",
        video_type: lesson.video_type || "youtube",
        is_free_preview: lesson.is_free_preview || false,
        content: lesson.content || {},
      });
      setVideoType(lesson.video_type || "youtube");
      setResources(lessonResources);

      // Set uploaded video info if exists
      if (lesson.video_file || lesson.video_url) {
        const videoPath = lesson.video_file || lesson.video_url;
        setUploadedVideo({
          name: videoPath.split("/").pop(),
          path: lesson.video_file,
          url: lesson.video_url,
        });
      }
    }
  }, [lesson, reset]);

  useEffect(() => {
    setVideoType(watchedVideoType);
  }, [watchedVideoType]);

  const onSubmit = (data) => {
    // Generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Store resources in content JSONB field as per schema
    const content = {
      ...(data.content || {}),
      materials: resources
        .filter((r) => r.type === "text")
        .map((r) => r.content || r.title),
      resources: resources
        .filter((r) => r.type === "file")
        .map((r) => ({
          id: r.id,
          title: r.title,
          file_path: r.file_path,
          file_name: r.file_name,
          file_size: r.file_size,
          file_type: r.file_type,
        })),
      notes: data.content?.notes || "",
    };

    // Prepare final lesson data
    const lessonData = {
      title: data.title,
      slug: data.slug,
      description: data.description || "",
      lesson_order: data.lesson_order,
      duration: data.duration || 0,
      video_url: data.video_url || "",
      video_file: data.video_file || null,
      video_type: data.video_type || "youtube",
      is_free_preview: data.is_free_preview || false,
      content: content,
    };

    onSave(lessonData);
  };

  // Video file upload handler
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = storageService.validateFile(
      file,
      storageService.getSupportedVideoFormats(),
      500 // 500MB max for videos
    );

    if (!validation.isValid) {
      toast.error(validation.errors.join(", "));
      return;
    }

    setIsUploading(true);
    try {
      // Use provided IDs or temp folder for new courses
      const uploadCourseId = courseId || "temp";
      const uploadModuleId = moduleId || "temp";
      const uploadLessonId = lessonId || `temp-${Date.now()}`;

      const result = await storageService.uploadCourseVideo(
        file,
        uploadCourseId,
        uploadModuleId,
        uploadLessonId
      );

      setValue("video_file", result.path);
      setValue("video_url", result.publicUrl);
      setValue("video_type", "uploaded");
      setUploadedVideo({
        name: file.name,
        path: result.path,
        url: result.publicUrl,
      });

      toast.success("Video uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload video: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Resource file upload handler
  const handleResourceFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = storageService.validateFile(
      file,
      [
        ...storageService.getSupportedDocumentFormats(),
        ...storageService.getSupportedImageFormats(),
      ],
      50 // 50MB max for resources
    );

    if (!validation.isValid) {
      toast.error(validation.errors.join(", "));
      return;
    }

    try {
      // Use provided IDs or temp folder for new courses
      const uploadCourseId = courseId || "temp";
      const uploadModuleId = moduleId || "temp";
      const uploadLessonId = lessonId || `temp-${Date.now()}`;

      const result = await storageService.uploadCourseResource(
        file,
        uploadCourseId,
        uploadModuleId,
        uploadLessonId,
        "documents" // Default resource type
      );

      const newResource = {
        id: Date.now().toString(),
        type: "file",
        title: file.name,
        file_path: result.path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      };

      setResources((prev) => [...prev, newResource]);
      toast.success("Resource uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload resource: " + error.message);
    }
  };

  // Add text resource
  const addTextResource = () => {
    const newResource = {
      id: Date.now().toString(),
      type: "text",
      title: "New Text Resource",
      content: "",
    };

    setResources((prev) => [...prev, newResource]);
  };

  // Update resource
  const updateResource = (id, updates) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === id ? { ...resource, ...updates } : resource
      )
    );
  };

  // Remove resource
  const removeResource = (id) => {
    setResources((prev) => prev.filter((resource) => resource.id !== id));
  };

  const getVideoEmbedUrl = (url, type) => {
    if (!url) return null;

    try {
      switch (type) {
        case "youtube":
          const youtubeId = url.includes("youtube.com/watch?v=")
            ? url.split("v=")[1]?.split("&")[0]
            : url.includes("youtu.be/")
            ? url.split("youtu.be/")[1]?.split("?")[0]
            : null;
          return youtubeId
            ? `https://www.youtube.com/embed/${youtubeId}`
            : null;

        case "vimeo":
          const vimeoId = url.includes("vimeo.com/")
            ? url.split("vimeo.com/")[1]?.split("?")[0]
            : null;
          return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;

        case "direct":
          return url;

        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const embedUrl = getVideoEmbedUrl(watchedVideoUrl, watchedVideoType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lesson ? "Edit Lesson" : "Create Lesson"}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title *
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter lesson title"
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
              Lesson Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter lesson description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (minutes)
              </label>
              <input
                {...register("duration", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {watch("duration") > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {formatDuration(watch("duration"))}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Order
              </label>
              <input
                {...register("lesson_order", { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              {...register("is_free_preview")}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Make this lesson available as free preview
            </label>
          </div>
        </div>

        {/* Video Content */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Content
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Type
              </label>
              <select
                {...register("video_type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="uploaded">Upload Video File</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="direct">Direct URL</option>
              </select>
            </div>

            {videoType === "uploaded" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Upload Video File
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isUploading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Uploading video...
                    </div>
                  )}
                  {uploadedVideo && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {uploadedVideo.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadedVideo(null);
                            setValue("video_file", "");
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Supported formats: MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV
                    (Max 500MB)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="w-4 h-4 inline mr-1" />
                  Video URL
                </label>
                <input
                  {...register("video_url")}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    videoType === "youtube"
                      ? "https://www.youtube.com/watch?v=..."
                      : videoType === "vimeo"
                      ? "https://vimeo.com/..."
                      : "https://example.com/video.mp4"
                  }
                />
                {errors.video_url && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.video_url.message}
                  </p>
                )}
              </div>
            )}

            {/* Video Preview */}
            {(embedUrl || uploadedVideo) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">Video Preview</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="flex items-center gap-2"
                  >
                    {isPreviewMode ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {isPreviewMode ? "Hide Preview" : "Show Preview"}
                  </Button>
                </div>

                {isPreviewMode && (
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    {uploadedVideo ? (
                      <video
                        src={uploadedVideo.url}
                        controls
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                      />
                    ) : (
                      <iframe
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resources Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lesson Resources
            </h4>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTextResource}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Text
              </Button>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                <Upload className="w-4 h-4" />
                Upload File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleResourceFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No resources added yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Add text content or upload files to provide additional resources
                for this lesson
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <div
                  key={resource.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {resource.type === "file" ? (
                        <File className="w-4 h-4 text-blue-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {resource.type === "file"
                          ? "File Resource"
                          : "Text Resource"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeResource(resource.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Title
                      </label>
                      <input
                        type="text"
                        value={resource.title}
                        onChange={(e) =>
                          updateResource(resource.id, { title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter resource title"
                      />
                    </div>

                    {resource.type === "text" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={resource.content || ""}
                          onChange={(e) =>
                            updateResource(resource.id, {
                              content: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter text content..."
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              {resource.file_name}
                            </p>
                            <p className="text-xs text-blue-600">
                              {(resource.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Supported file types:</strong> PDF, DOC, DOCX, TXT, CSV,
              JPG, PNG, GIF, WebP (Max 50MB)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Lesson
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LessonBuilder;
