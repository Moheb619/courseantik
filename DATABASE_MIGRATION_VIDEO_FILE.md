# Database Migration: Add video_file Column

## Migration Applied

**Date:** January 10, 2025  
**Migration Name:** `add_video_file_column_to_lessons`

## Changes Made

Added `video_file` column to the `lessons` table to properly support uploaded video file storage.

### SQL Applied

```sql
-- Add video_file column to lessons table to store the storage path
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS video_file TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.lessons.video_file IS 'Storage path for uploaded video files (for deletion/management). The video_url column contains the public playback URL.';
```

## Column Purpose

### Before Migration

- `video_url` - Stored public URL (for YouTube, Vimeo, or uploaded videos)
- `video_type` - Type of video ('youtube', 'vimeo', 'direct', 'uploaded')

### After Migration

- `video_url` - Public playback URL (YouTube, Vimeo, or Supabase Storage public URL)
- `video_file` - **NEW** - Storage path for uploaded files (used for file management and deletion)
- `video_type` - Type of video

## Use Cases

### YouTube/Vimeo Videos

```javascript
{
  video_url: "https://www.youtube.com/watch?v=...",
  video_file: null,
  video_type: "youtube"
}
```

### Uploaded Videos

```javascript
{
  video_url: "https://[project].supabase.co/storage/v1/object/public/course-antik-bucket/courses/.../video.mp4",
  video_file: "courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/videos/1234567890-video.mp4",
  video_type: "uploaded"
}
```

## Benefits

1. **File Management** - Can easily delete files from storage using the path
2. **Migration** - Can move files between locations
3. **Cleanup** - Can clean up orphaned files
4. **Validation** - Can verify file existence in storage
5. **Tracking** - Can track storage usage per course/lesson

## Storage Integration

When uploading a video in LessonBuilder:

```javascript
const result = await storageService.uploadCourseVideo(
  file,
  courseId,
  moduleId,
  lessonId
);

// Result contains:
{
  path: "courses/.../videos/...",  // Stored in video_file
  publicUrl: "https://...",         // Stored in video_url
  fullPath: "..."
}
```

## Backward Compatibility

✅ **Fully backward compatible**

- Existing lessons with only `video_url` will continue to work
- `video_file` is nullable
- Code checks for both fields when displaying videos

## Related Files Updated

- `src/components/admin/LessonBuilder.jsx` - Now saves and loads video_file
- `src/services/courseManagementService.js` - Already supports spreading lessonData
- `src/services/storageService.js` - Handles video uploads with proper paths

---

**Status:** ✅ Applied Successfully  
**Rollback:** `ALTER TABLE public.lessons DROP COLUMN IF EXISTS video_file;`
