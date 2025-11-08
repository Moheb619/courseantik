import React, { useState, useRef } from "react";
import {
  Upload,
  File,
  X,
  Check,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Send,
  Clock,
  CheckCircle,
} from "lucide-react";
import Button from "./Button";

const StudentFileUpload = ({
  onFileUpload,
  onFileRemove,
  onAssignmentSubmit,
  acceptedTypes = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "jpg",
    "jpeg",
    "png",
    "zip",
    "rar",
  ],
  maxSize = 25 * 1024 * 1024, // 25MB
  multiple = true,
  existingFiles = [],
  assignmentInfo = null,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submittedFiles, setSubmittedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const fileInputRef = useRef(null);

  const getFileIcon = (type) => {
    const fileType = type.toLowerCase();
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("doc")) return "📝";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
    if (fileType.includes("zip") || fileType.includes("rar")) return "📦";
    return "📁";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file) => {
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const isValidType = acceptedTypes.some(
      (type) => fileExtension === type || file.type.includes(type)
    );

    if (!isValidType) {
      setError(
        `File type .${fileExtension} is not allowed. Accepted types: ${acceptedTypes.join(
          ", "
        )}`
      );
      return false;
    }

    if (file.size > maxSize) {
      setError(
        `File size (${formatFileSize(
          file.size
        )}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
      );
      return false;
    }

    return true;
  };

  const handleFiles = async (files) => {
    setError("");
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!validateFile(file)) {
        continue;
      }

      setUploading(true);
      try {
        // Simulate file upload - replace with actual upload logic
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const uploadedFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // In real app, this would be the server URL
          uploadedAt: new Date().toISOString(),
          status: "uploaded", // uploaded, submitted, graded
        };

        setSubmittedFiles((prev) => [...prev, uploadedFile]);
        onFileUpload?.(uploadedFile);
      } catch (err) {
        setError(`Failed to upload ${file.name}: ${err.message}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveFile = (fileId) => {
    if (isSubmitted) return; // Don't allow removal after submission

    setSubmittedFiles((prev) => prev.filter((file) => file.id !== fileId));
    onFileRemove?.(fileId);
  };

  const handleDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitAssignment = () => {
    if (submittedFiles.length === 0) {
      setError("Please upload at least one file before submitting.");
      return;
    }

    // Mark files as submitted
    const submittedAssignment = {
      id: Date.now(),
      files: submittedFiles,
      notes: submissionNotes,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };

    setIsSubmitted(true);
    onAssignmentSubmit?.(submittedAssignment);

    // Update file statuses
    setSubmittedFiles((prev) =>
      prev.map((file) => ({ ...file, status: "submitted" }))
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "uploaded":
        return "text-blue-600 bg-blue-50";
      case "submitted":
        return "text-green-600 bg-green-50";
      case "graded":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-neutral-600 bg-neutral-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploaded":
        return <Upload className="w-4 h-4" />;
      case "submitted":
        return <CheckCircle className="w-4 h-4" />;
      case "graded":
        return <Check className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Assignment Info */}
      {assignmentInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Assignment: {assignmentInfo.title}
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            {assignmentInfo.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-blue-700">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                Due: {new Date(assignmentInfo.dueDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <File className="w-4 h-4" />
              <span>Max {assignmentInfo.maxFiles || 5} files</span>
            </div>
            <div className="flex items-center gap-1">
              <Upload className="w-4 h-4" />
              <span>
                Max {formatFileSize(assignmentInfo.maxSize || maxSize)} per file
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!isSubmitted && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-brand-500 bg-brand-50"
              : "border-neutral-300 hover:border-neutral-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.map((type) => `.${type}`).join(",")}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-neutral-400" />
            </div>

            <div>
              <p className="text-lg font-medium text-neutral-900">
                {dragActive ? "Drop files here" : "Upload Assignment Files"}
              </p>
              <p className="text-sm text-neutral-500">
                Drag and drop files here, or click to select files
              </p>
            </div>

            <div className="text-xs text-neutral-400">
              <p>Accepted formats: {acceptedTypes.join(", ")}</p>
              <p>Maximum size: {formatFileSize(maxSize)} per file</p>
            </div>

            {uploading && (
              <div className="flex items-center justify-center gap-2 text-brand-600">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Submitted Files */}
      {submittedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-700">
            {isSubmitted ? "Submitted Files:" : "Uploaded Files:"}
          </h4>
          <div className="space-y-2">
            {submittedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
              >
                <span className="text-lg">{getFileIcon(file.type)}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(file.size)} •{" "}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        file.status
                      )}`}
                    >
                      {getStatusIcon(file.status)}
                      {file.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {!isSubmitted && (
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Notes */}
      {!isSubmitted && submittedFiles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Submission Notes (Optional)
          </label>
          <textarea
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            rows={3}
            placeholder="Add any notes or comments about your submission..."
          />
        </div>
      )}

      {/* Submit Button */}
      {!isSubmitted && submittedFiles.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSubmitAssignment}
            disabled={uploading}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Assignment
          </Button>
        </div>
      )}

      {/* Submission Confirmation */}
      {isSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">
              Assignment Submitted Successfully!
            </h3>
          </div>
          <p className="text-green-800 text-sm">
            Your assignment has been submitted and is now under review. You will
            receive feedback once it's graded.
          </p>
        </div>
      )}

      {/* Existing Files (from previous submissions) */}
      {existingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-700">
            Previous Submissions:
          </h4>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
              >
                <span className="text-lg">{getFileIcon(file.type)}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(file.size)} •{" "}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        file.status
                      )}`}
                    >
                      {getStatusIcon(file.status)}
                      {file.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFileUpload;
