import React from "react";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../../features/courses/services/courseService";
import VideoPlayer from "../ui/VideoPlayer";

const LessonWithAttachments = ({ lessonId }) => {
  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson-details", lessonId],
    queryFn: () => courseService.getLessonWithDetails(lessonId),
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Lesson not found</p>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAttachmentIcon = (type) => {
    const icons = {
      pdf: (
        <svg
          className="h-5 w-5 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
      document: (
        <svg
          className="h-5 w-5 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
      image: (
        <svg
          className="h-5 w-5 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      link: (
        <svg
          className="h-5 w-5 text-purple-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      default: (
        <svg
          className="h-5 w-5 text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    return icons[type] || icons.default;
  };

  const getAttachmentType = (url) => {
    if (url.includes(".pdf")) return "pdf";
    if (url.includes(".doc") || url.includes(".docx")) return "document";
    if (url.match(/\.(jpg|jpeg|png|gif)$/i)) return "image";
    if (url.startsWith("http")) return "link";
    return "default";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
          {lesson.duration && (
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {formatDuration(lesson.duration)}
            </span>
          )}
        </div>

        {lesson.description && (
          <p className="text-lg text-gray-600 mb-4">{lesson.description}</p>
        )}

        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <span>Course: {lesson.courseTitle}</span>
          <span>Module: {lesson.moduleTitle}</span>
          {lesson.is_free_preview && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              Free Preview
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Content */}
          {lesson.media_url && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Lesson Content</h2>

              {lesson.media_type === "video" && (
                <VideoPlayer url={lesson.media_url} title={lesson.title} />
              )}

              {lesson.media_type === "audio" && (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <audio controls className="w-full">
                    <source src={lesson.media_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {lesson.media_type === "link" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <svg
                      className="h-8 w-8 text-blue-500 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-blue-900">
                        External Resource
                      </h3>
                      <a
                        href={lesson.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {lesson.media_url}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          {lesson.content && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Lesson Notes</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          )}
        </div>

        {/* Sidebar - Attachments */}
        <div className="lg:col-span-1">
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resources & Attachments
              </h3>

              <div className="space-y-3">
                {lesson.attachments.map((attachment, index) => {
                  const attachmentType = getAttachmentType(
                    attachment.url || attachment
                  );
                  const attachmentName =
                    attachment.name ||
                    attachment.title ||
                    `Attachment ${index + 1}`;
                  const attachmentUrl = attachment.url || attachment;
                  const attachmentDescription =
                    attachment.description || attachment.desc;

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getAttachmentIcon(attachmentType)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {attachmentName}
                          </h4>

                          {attachmentDescription && (
                            <p className="text-xs text-gray-500 mt-1">
                              {attachmentDescription}
                            </p>
                          )}

                          <div className="mt-2">
                            <a
                              href={attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              {attachmentType === "link"
                                ? "Visit Link"
                                : "Download"}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lesson Info */}
          <div className="bg-gray-50 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lesson Information
            </h3>

            <div className="space-y-3 text-sm">
              {lesson.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {formatDuration(lesson.duration)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">
                  {lesson.media_type || "Text"}
                </span>
              </div>

              {lesson.is_free_preview && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Access:</span>
                  <span className="font-medium text-green-600">
                    Free Preview
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonWithAttachments;
