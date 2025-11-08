# Storage System Documentation

## Overview

This document outlines the standardized storage structure and best practices for file uploads in the Course Antik application. All uploads are stored in the `course-antik-bucket` Supabase Storage bucket with a well-organized folder structure.

## Folder Structure

The storage system follows a hierarchical folder structure for easy management and cleanup:

```
course-antik-bucket/
├── courses/
│   ├── temp/
│   │   └── thumbnails/          # Temporary uploads before course creation
│   └── {course-id}/
│       ├── thumbnails/           # Course thumbnail images
│       └── modules/
│           └── {module-id}/
│               └── lessons/
│                   └── {lesson-id}/
│                       ├── videos/         # Lesson video files
│                       └── resources/
│                           ├── documents/  # PDF, DOC, etc.
│                           ├── images/     # Lesson images
│                           └── archives/   # ZIP, RAR files
├── products/
│   ├── temp/
│   │   └── images/              # Temporary uploads before product creation
│   └── {product-id}/
│       └── images/               # Product images (multiple)
├── users/
│   └── {user-id}/
│       └── avatars/              # User profile pictures
└── assignments/
    └── {assignment-id}/
        └── submissions/
            └── {user-id}/        # Student assignment submissions
```

## Storage Service API

### Image Uploads

#### Course Thumbnails

```javascript
import storageService from "../services/storageService";

// Upload course thumbnail
const result = await storageService.uploadCourseThumbnail(file, courseId);
// Returns: { path, publicUrl, fullPath }

// Replace existing thumbnail
const result = await storageService.replaceCourseThumbnail(
  file,
  courseId,
  oldThumbnailUrl
);
```

**Specifications:**

- Max size: 5MB
- Allowed formats: JPG, PNG, GIF, WebP, SVG
- Recommended size: 1280x720px (16:9 aspect ratio)
- Location: `courses/{courseId}/thumbnails/{timestamp}-{filename}`

#### Product Images

```javascript
// Upload product image (supports multiple)
const result = await storageService.uploadProductImage(
  file,
  productId,
  imageIndex // 0, 1, 2, etc.
);
```

**Specifications:**

- Max size: 5MB
- Allowed formats: JPG, PNG, GIF, WebP, SVG
- Multiple images supported (indexed)
- Location: `products/{productId}/images/{timestamp}-{index}-{filename}`

#### User Avatars

```javascript
// Upload user avatar
const result = await storageService.uploadUserAvatar(file, userId);
```

**Specifications:**

- Max size: 2MB (smaller for performance)
- Allowed formats: JPG, PNG, GIF, WebP, SVG
- Recommended size: 400x400px (1:1 aspect ratio)
- Location: `users/{userId}/avatars/avatar-{timestamp}.{ext}`

### Video Uploads

#### Course Videos

```javascript
// Upload lesson video
const result = await storageService.uploadCourseVideo(
  file,
  courseId,
  moduleId,
  lessonId
);
```

**Specifications:**

- Max size: 500MB
- Allowed formats: MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV
- Location: `courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/videos/{timestamp}-{filename}`

### Document Uploads

#### Course Resources

```javascript
// Upload course resource
const result = await storageService.uploadCourseResource(
  file,
  courseId,
  moduleId,
  lessonId,
  resourceType // 'documents', 'images', or 'archives'
);
```

**Specifications:**

- Max size: 100MB
- Allowed formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
- Location: `courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/resources/{resourceType}/{timestamp}-{filename}`

#### Assignment Submissions

```javascript
// Upload student assignment submission
const result = await storageService.uploadAssignmentSubmission(
  file,
  assignmentId,
  userId
);
```

**Specifications:**

- Max size: 50MB
- Allowed formats: Documents, Images, ZIP, RAR
- Location: `assignments/{assignmentId}/submissions/{userId}/{timestamp}-{filename}`

## File Management

### Delete Files

```javascript
// Delete a single file
await storageService.deleteFile("course-antik-bucket", filePath);

// Delete all files in a folder
await storageService.deleteFolderContents("courses/temp/thumbnails");
```

### Move Files

```javascript
// Move file from temp to permanent location
const result = await storageService.moveFile(
  "courses/temp/thumbnails/image.jpg",
  "courses/123/thumbnails/image.jpg"
);
```

### Clean Up Temporary Files

```javascript
// Clean up all temporary uploads
const deletedCount = await storageService.cleanupTempUploads();
console.log(`Cleaned up ${deletedCount} files`);
```

## ImageUpload Component

A ready-to-use React component for image uploads with preview.

### Basic Usage

```javascript
import ImageUpload from "../components/ui/ImageUpload";

<ImageUpload
  label="Course Thumbnail"
  helperText="Recommended size: 1280x720px (16:9 aspect ratio)"
  aspectRatio="16/9"
  uploadType="course-thumbnail"
  entityId={courseId}
  existingImageUrl={thumbnailUrl}
  maxSizeMB={5}
  required={true}
  onUploadComplete={(publicUrl, path) => {
    // Handle successful upload
    setThumbnailUrl(publicUrl);
  }}
  onRemove={() => {
    // Handle image removal
    setThumbnailUrl(null);
  }}
/>;
```

### Props

| Prop               | Type     | Default            | Description                                              |
| ------------------ | -------- | ------------------ | -------------------------------------------------------- |
| `label`            | string   | "Upload Image"     | Label text                                               |
| `helperText`       | string   | ""                 | Helper text below upload area                            |
| `uploadType`       | string   | "course-thumbnail" | Type: "course-thumbnail", "product-image", "user-avatar" |
| `entityId`         | string   | null               | ID of the entity (courseId, productId, userId)           |
| `existingImageUrl` | string   | null               | URL of existing image                                    |
| `aspectRatio`      | string   | "16/9"             | Aspect ratio: "16/9", "1/1", "4/3"                       |
| `maxSizeMB`        | number   | 5                  | Maximum file size in MB                                  |
| `required`         | boolean  | false              | Is the field required                                    |
| `disabled`         | boolean  | false              | Disable upload                                           |
| `onUploadComplete` | function | null               | Callback: (publicUrl, path) => {}                        |
| `onRemove`         | function | null               | Callback when image removed                              |

### Features

- ✅ Drag and drop support
- ✅ Image preview
- ✅ File validation (type, size)
- ✅ Upload progress indicator
- ✅ Replace existing image
- ✅ Remove image
- ✅ Responsive design
- ✅ Error handling

## Best Practices

### 1. File Naming

- Always sanitize filenames: `filename.replace(/[^a-zA-Z0-9.-]/g, '_')`
- Include timestamps to avoid conflicts: `${timestamp}-${filename}`
- Use descriptive names for resource types

### 2. Temporary Uploads

- Upload to `temp` folder if entity doesn't exist yet
- Move to permanent location after entity creation
- Run cleanup regularly to remove abandoned temp files

### 3. Error Handling

```javascript
try {
  const result = await storageService.uploadCourseThumbnail(file, courseId);
  console.log("Upload successful:", result.publicUrl);
} catch (error) {
  console.error("Upload failed:", error.message);
  // Show user-friendly error message
}
```

### 4. Validation

```javascript
// Validate before upload
const validation = storageService.validateFile(
  file,
  storageService.getSupportedImageFormats(),
  5 // maxSizeMB
);

if (!validation.isValid) {
  console.error("Validation failed:", validation.errors);
  return;
}
```

### 5. Cleanup on Delete

When deleting entities, clean up associated files:

```javascript
// Delete course and all its files
await storageService.deleteFolderContents(`courses/${courseId}`);
await courseService.deleteCourse(courseId);

// Delete product and images
await storageService.deleteFolderContents(`products/${productId}/images`);
await productService.deleteProduct(productId);
```

### 6. Public vs Private Content

The `course-antik-bucket` is configured as **public** for:

- Course thumbnails (publicly visible in catalog)
- Product images (publicly visible in shop)
- User avatars (publicly visible in profiles)

For **private** content (e.g., paid course videos), consider:

- Using signed URLs with expiration
- Creating a separate private bucket
- Implementing Row Level Security (RLS) policies

## Storage Policies

### Current Setup

- Bucket: `course-antik-bucket`
- Public: ✅ Yes
- File size limit: 10GB (configurable per upload)
- Image transformation: ✅ Enabled

### Recommended Policies

Create Supabase Storage policies for access control:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-antik-bucket');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-antik-bucket'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Public read access
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'course-antik-bucket');
```

## Examples

### Complete Course Creation Flow

```javascript
import { useState } from "react";
import ImageUpload from "../components/ui/ImageUpload";
import storageService from "../services/storageService";

function CourseForm() {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async () => {
    // 1. Create course first
    const course = await courseService.create({
      ...formData,
      thumbnail: thumbnailUrl,
    });

    // 2. If thumbnail was uploaded to temp, move it
    if (thumbnailUrl && thumbnailUrl.includes("/temp/")) {
      const tempPath = storageService.extractPathFromUrl(thumbnailUrl);
      const permanentPath = `courses/${course.id}/thumbnails/${Date.now()}.jpg`;
      const result = await storageService.moveFile(tempPath, permanentPath);

      // Update course with new thumbnail URL
      await courseService.update(course.id, {
        thumbnail: result.publicUrl,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ImageUpload
        uploadType="course-thumbnail"
        entityId={null} // Will use temp folder
        existingImageUrl={thumbnailUrl}
        onUploadComplete={(publicUrl) => setThumbnailUrl(publicUrl)}
        onRemove={() => setThumbnailUrl(null)}
      />
      {/* Other form fields */}
      <button type="submit">Create Course</button>
    </form>
  );
}
```

### Bulk File Cleanup

```javascript
// Scheduled cleanup job (run daily)
async function cleanupOldTempFiles() {
  try {
    // Clean up temp thumbnails older than 24 hours
    const deletedCount = await storageService.cleanupTempUploads();
    console.log(`Cleanup completed: ${deletedCount} files deleted`);
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}
```

## Troubleshooting

### Upload Fails

1. Check file size and type
2. Verify bucket permissions
3. Ensure entity ID exists (or use temp folder)
4. Check network connectivity

### Files Not Visible

1. Verify bucket is public
2. Check storage policies
3. Ensure correct public URL format
4. Clear browser cache

### Slow Uploads

1. Compress images before upload
2. Use appropriate file formats (WebP for images)
3. Consider progressive upload for large files
4. Check network speed

## Migration Guide

### Updating Existing Components

If you have existing file upload code, migrate to the new system:

**Before:**

```javascript
// Old manual upload
const uploadImage = async (file) => {
  const { data, error } = await supabase.storage
    .from("course-antik-bucket")
    .upload(`image-${Date.now()}.jpg`, file);
  // ...
};
```

**After:**

```javascript
// New standardized upload
import storageService from "../services/storageService";

const uploadImage = async (file) => {
  const result = await storageService.uploadCourseThumbnail(file, courseId);
  // Automatically handles validation, naming, and structure
};
```

## Support

For issues or questions:

1. Check this documentation
2. Review storage service source code
3. Check Supabase storage logs
4. Contact development team

---

**Last Updated:** January 2025
**Version:** 1.0.0
