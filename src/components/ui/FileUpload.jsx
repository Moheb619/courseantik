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
} from "lucide-react";
import Button from "./Button";

const FileUpload = ({
  onFileUpload,
  onFileRemove,
  acceptedTypes = [
    "pdf",
    "doc",
    "docx",
    "txt",
    "jpg",
    "jpeg",
    "png",
    "mp4",
    "mp3",
  ],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  existingFiles = [],
  isAdmin = false,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const getFileIcon = (type) => {
    const fileType = type.toLowerCase();
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("doc")) return "📝";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
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
        };

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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
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
              {dragActive ? "Drop files here" : "Upload files"}
            </p>
            <p className="text-sm text-neutral-500">
              Drag and drop files here, or click to select files
            </p>
          </div>

          <div className="text-xs text-neutral-400">
            <p>Accepted formats: {acceptedTypes.join(", ")}</p>
            <p>Maximum size: {formatFileSize(maxSize)}</p>
          </div>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-brand-600">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          )}
        </div>
      </div>

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

      {/* File List */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-700">
            Uploaded Files:
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
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(file.size)} •{" "}
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {isAdmin && (
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

      {/* Admin Controls */}
      {isAdmin && (
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Admin: Manage course materials and assignments
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
