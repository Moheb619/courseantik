import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import Button from "./Button";
import storageService from "../../services/storageService";

/**
 * ImageUpload Component
 * Specialized component for uploading images with preview
 * Supports course thumbnails, product images, user avatars, etc.
 */
const ImageUpload = ({
  onUploadComplete,
  onRemove,
  existingImageUrl = null,
  uploadType = "course-thumbnail", // course-thumbnail, product-image, user-avatar
  entityId = null, // courseId, productId, userId
  maxSizeMB = 5,
  aspectRatio = "16/9", // 16/9, 1/1, 4/3
  label = "Upload Image",
  helperText = "",
  required = false,
  disabled = false,
}) => {
  const [preview, setPreview] = useState(existingImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(existingImageUrl);
  }, [existingImageUrl]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateImage = (file) => {
    const validation = storageService.validateFile(
      file,
      storageService.getSupportedImageFormats(),
      maxSizeMB
    );

    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return false;
    }

    return true;
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setError("");
    setSuccess(false);

    if (!validateImage(file)) {
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      let uploadResult;

      // Choose upload method based on type
      switch (uploadType) {
        case "course-thumbnail":
          uploadResult = await storageService.uploadCourseThumbnail(
            file,
            entityId
          );
          break;
        case "product-image":
          uploadResult = await storageService.uploadProductImage(
            file,
            entityId,
            0
          );
          break;
        case "user-avatar":
          uploadResult = await storageService.uploadUserAvatar(file, entityId);
          break;
        default:
          throw new Error("Invalid upload type");
      }

      setSuccess(true);
      onUploadComplete?.(uploadResult.publicUrl, uploadResult.path);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
      setPreview(existingImageUrl); // Revert to existing image on error
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
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
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    if (window.confirm("Are you sure you want to remove this image?")) {
      setPreview(null);
      onRemove?.();
      setSuccess(false);
      setError("");
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "1/1":
        return "aspect-square";
      case "4/3":
        return "aspect-[4/3]";
      case "16/9":
      default:
        return "aspect-video";
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div className="relative">
        {preview ? (
          // Image Preview
          <div className="relative group">
            <div
              className={`relative ${getAspectRatioClass()} w-full rounded-lg overflow-hidden border-2 border-neutral-200`}
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || uploading}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change
                </Button>
                {onRemove && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemove}
                    disabled={disabled || uploading}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>

              {/* Uploading overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Upload Zone
          <div
            className={`relative border-2 border-dashed rounded-lg transition-colors ${
              dragActive
                ? "border-brand-500 bg-brand-50"
                : "border-neutral-300 hover:border-neutral-400"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <div
              className={`${getAspectRatioClass()} flex flex-col items-center justify-center p-6`}
            >
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                {uploading ? (
                  <Loader className="w-8 h-8 text-brand-500 animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-neutral-400" />
                )}
              </div>

              <p className="text-base font-medium text-neutral-900 mb-1">
                {dragActive
                  ? "Drop image here"
                  : uploading
                  ? "Uploading..."
                  : "Click or drag image to upload"}
              </p>
              <p className="text-sm text-neutral-500 mb-2">
                JPG, PNG, GIF or WebP (Max {maxSizeMB}MB)
              </p>
              {helperText && (
                <p className="text-xs text-neutral-400">{helperText}</p>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Image uploaded successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
