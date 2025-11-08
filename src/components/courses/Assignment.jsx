import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  User,
  FileIcon,
  Trash2,
  Eye,
  Send,
  RotateCcw,
  MessageSquare,
  Star,
} from "lucide-react";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/fmt";

const Assignment = ({
  assignment,
  studentProgress = null,
  isEnrolled = false,
  isAdmin = false,
  onSubmit,
  onResubmit,
  className = "",
}) => {
  const [submissionType, setSubmissionType] = useState(
    assignment.submissionType === "both" ? "text" : assignment.submissionType
  );
  const [textContent, setTextContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const fileInputRef = useRef(null);

  const hasSubmission = studentProgress?.assignmentSubmissions?.length > 0;
  const latestSubmission = hasSubmission
    ? studentProgress.assignmentSubmissions[
        studentProgress.assignmentSubmissions.length - 1
      ]
    : null;
  const isOverdue = new Date() > new Date(assignment.dueDate);
  const canSubmit =
    isEnrolled &&
    (!hasSubmission ||
      (latestSubmission?.status === "graded" && !latestSubmission?.passed));

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      // Check file type
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      if (!assignment.allowedFileTypes.includes(fileExtension)) {
        errors.push(
          `${
            file.name
          }: Invalid file type. Allowed types: ${assignment.allowedFileTypes.join(
            ", "
          )}`
        );
        return;
      }

      // Check file size
      if (file.size > assignment.maxFileSize) {
        errors.push(
          `${file.name}: File too large. Maximum size: ${formatFileSize(
            assignment.maxFileSize
          )}`
        );
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert("File validation errors:\n" + errors.join("\n"));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (submissionType === "text" && !textContent.trim()) {
      alert("Please enter your assignment content.");
      return;
    }

    if (
      (submissionType === "file" || submissionType === "both") &&
      selectedFiles.length === 0
    ) {
      alert("Please select at least one file to submit.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        assignmentId: assignment.id,
        type: submissionType,
        content:
          submissionType === "text" || submissionType === "both"
            ? textContent
            : null,
        files: selectedFiles,
        submittedAt: new Date().toISOString(),
      };

      await onSubmit?.(submissionData);

      // Reset form
      setTextContent("");
      setSelectedFiles([]);
      setShowSubmissionForm(false);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "graded":
        return latestSubmission?.passed
          ? "text-green-600 bg-green-50 border-green-200"
          : "text-red-600 bg-red-50 border-red-200";
      case "submitted":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-neutral-600 bg-neutral-50 border-neutral-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "graded":
        return latestSubmission?.passed ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        );
      case "submitted":
        return <Upload className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Assignment Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">
              {assignment.title}
            </h3>
            <p className="text-neutral-600 leading-relaxed mb-4">
              {assignment.description}
            </p>
          </div>
          <div className="ml-6 flex items-center gap-2">
            {assignment.isRequired && (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Assignment Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              Pass: {assignment.passMarks}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              {assignment.submissionType === "both"
                ? "Text & File"
                : assignment.submissionType === "file"
                ? "File Only"
                : "Text Only"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">
              Max: {formatFileSize(assignment.maxFileSize)}
            </span>
          </div>
        </div>

        {isOverdue && !hasSubmission && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">
                This assignment is overdue
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Requirements */}
      <div className="p-6 border-b border-neutral-200">
        <h4 className="text-lg font-semibold text-neutral-900 mb-3">
          Requirements
        </h4>
        <ul className="space-y-2">
          {assignment.requirements.map((requirement, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-neutral-700">{requirement}</span>
            </li>
          ))}
        </ul>

        {assignment.allowedFileTypes &&
          assignment.allowedFileTypes.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Allowed file types:</strong>{" "}
                {assignment.allowedFileTypes.join(", ")}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Maximum file size:</strong>{" "}
                {formatFileSize(assignment.maxFileSize)}
              </p>
            </div>
          )}
      </div>

      {/* Submission Status */}
      {hasSubmission && (
        <div className="p-6 border-b border-neutral-200">
          <h4 className="text-lg font-semibold text-neutral-900 mb-3">
            Submission Status
          </h4>
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(
              latestSubmission.status
            )}`}
          >
            {getStatusIcon(latestSubmission.status)}
            <span className="text-sm font-medium capitalize">
              {latestSubmission.status}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Calendar className="w-4 h-4" />
              <span>
                Submitted:{" "}
                {new Date(latestSubmission.submittedAt).toLocaleString()}
              </span>
            </div>

            {latestSubmission.status === "graded" && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" />
                  <span
                    className={`font-medium ${
                      latestSubmission.passed
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Score: {latestSubmission.score}% (
                    {latestSubmission.passed ? "Passed" : "Failed"})
                  </span>
                </div>

                {latestSubmission.feedback && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-neutral-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900 mb-1">
                          Instructor Feedback:
                        </p>
                        <p className="text-sm text-neutral-700">
                          {latestSubmission.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {latestSubmission.rubricScores &&
                  latestSubmission.rubricScores.length > 0 && (
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <p className="text-sm font-medium text-neutral-900 mb-2">
                        Grading Rubric:
                      </p>
                      <div className="space-y-1">
                        {assignment.rubric.map((item, index) => {
                          const score =
                            latestSubmission.rubricScores.find(
                              (s) => s.criteria === item.criteria
                            )?.score || 0;
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-neutral-700">
                                {item.criteria}
                              </span>
                              <span className="font-medium">
                                {score}/{item.points}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </>
            )}

            {/* Show submitted files */}
            {latestSubmission.files && latestSubmission.files.length > 0 && (
              <div>
                <p className="text-sm font-medium text-neutral-900 mb-2">
                  Submitted Files:
                </p>
                <div className="space-y-1">
                  {latestSubmission.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <FileIcon className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-700">{file.name}</span>
                      <span className="text-neutral-500">
                        ({formatFileSize(file.size)})
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submission Form */}
      {canSubmit && (
        <div className="p-6">
          {!showSubmissionForm ? (
            <div className="text-center">
              <Button
                variant="primary"
                onClick={() => setShowSubmissionForm(true)}
                disabled={!isEnrolled}
              >
                {hasSubmission ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resubmit Assignment
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-neutral-900">
                  {hasSubmission ? "Resubmit Assignment" : "Submit Assignment"}
                </h4>
                <Button
                  variant="outline"
                  onClick={() => setShowSubmissionForm(false)}
                >
                  Cancel
                </Button>
              </div>

              {assignment.submissionType === "both" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Submission Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="text"
                        checked={submissionType === "text"}
                        onChange={(e) => setSubmissionType(e.target.value)}
                        className="mr-2"
                      />
                      Text Only
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="file"
                        checked={submissionType === "file"}
                        onChange={(e) => setSubmissionType(e.target.value)}
                        className="mr-2"
                      />
                      File Only
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="both"
                        checked={submissionType === "both"}
                        onChange={(e) => setSubmissionType(e.target.value)}
                        className="mr-2"
                      />
                      Text & File
                    </label>
                  </div>
                </div>
              )}

              {(submissionType === "text" || submissionType === "both") && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Assignment Content
                  </label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    rows={8}
                    placeholder="Enter your assignment content here..."
                  />
                </div>
              )}

              {(submissionType === "file" || submissionType === "both") && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Upload Files
                  </label>
                  <div
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-brand-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">
                      Click to select files or drag and drop
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Allowed types: {assignment.allowedFileTypes.join(", ")}{" "}
                      (Max: {formatFileSize(assignment.maxFileSize)})
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={assignment.allowedFileTypes.join(",")}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-neutral-700">
                        Selected Files:
                      </p>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileIcon className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-700">
                              {file.name}
                            </span>
                            <span className="text-xs text-neutral-500">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmissionForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Not Enrolled Message */}
      {!isEnrolled && (
        <div className="p-6 text-center">
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
            <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-600">
              You need to enroll in this course to submit assignments.
            </p>
          </div>
        </div>
      )}

      {/* Grading Rubric */}
      {assignment.rubric && assignment.rubric.length > 0 && (
        <div className="p-6 border-t border-neutral-200">
          <h4 className="text-lg font-semibold text-neutral-900 mb-3">
            Grading Rubric
          </h4>
          <div className="space-y-3">
            {assignment.rubric.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 bg-neutral-50 rounded-lg"
              >
                <div className="flex-1">
                  <h5 className="font-medium text-neutral-900">
                    {item.criteria}
                  </h5>
                  <p className="text-sm text-neutral-600 mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-neutral-900">
                    {item.points} pts
                  </span>
                </div>
              </div>
            ))}
            <div className="text-right pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-900">
                Total:{" "}
                {assignment.rubric.reduce((sum, item) => sum + item.points, 0)}{" "}
                points
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignment;
