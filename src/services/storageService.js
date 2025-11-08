import { supabase } from '../lib/supabase';

class StorageService {
  /**
   * Upload a file to Supabase Storage
   * @param {File} file - The file to upload
   * @param {string} bucket - The bucket name
   * @param {string} path - The path within the bucket
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result with public URL
   */
  async uploadFile(file, bucket, path, options = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          ...options
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        publicUrl: urlData.publicUrl,
        fullPath: data.fullPath
      };
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  }

  /**
   * Upload course thumbnail image
   * @param {File} file - Image file
   * @param {string} courseId - Course ID (optional, generates UUID if not provided)
   * @returns {Promise<Object>} Upload result
   */
  async uploadCourseThumbnail(file, courseId = null) {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;
    
    // If no courseId, use temporary folder that can be cleaned up later
    const coursePath = courseId || 'temp';
    const path = `courses/${coursePath}/thumbnails/${fileName}`;
    
    // Validate image file
    const validation = this.validateFile(file, this.getSupportedImageFormats(), 5);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    return await this.uploadFile(file, 'course-antik-bucket', path, {
      upsert: false,
      contentType: file.type
    });
  }

  /**
   * Upload course video file
   * @param {File} file - Video file
   * @param {string} courseId - Course ID
   * @param {string} moduleId - Module ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadCourseVideo(file, courseId, moduleId, lessonId) {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;
    const path = `courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/videos/${fileName}`;
    
    // Validate video file
    const validation = this.validateFile(file, this.getSupportedVideoFormats(), 500);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    return await this.uploadFile(file, 'course-antik-bucket', path);
  }

  /**
   * Upload course resource file
   * @param {File} file - Resource file
   * @param {string} courseId - Course ID
   * @param {string} moduleId - Module ID
   * @param {string} lessonId - Lesson ID
   * @param {string} resourceType - Type of resource (document, image, etc.)
   * @returns {Promise<Object>} Upload result
   */
  async uploadCourseResource(file, courseId, moduleId, lessonId, resourceType = 'documents') {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `resource-${timestamp}.${fileExtension}`;
    const path = `courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/resources/${resourceType}/${fileName}`;
    
    return await this.uploadFile(file, 'course-antik-bucket', path);
  }

  /**
   * Delete a file from storage
   * @param {string} bucket - The bucket name
   * @param {string} path - The file path
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(bucket, path) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  }

  /**
   * Get file info from storage
   * @param {string} bucket - The bucket name
   * @param {string} path - The file path
   * @returns {Promise<Object>} File info
   */
  async getFileInfo(bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      if (error) {
        throw new Error(`Get file info failed: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Storage get file info error:', error);
      throw error;
    }
  }

  /**
   * Get public URL for a file
   * @param {string} bucket - The bucket name
   * @param {string} path - The file path
   * @returns {string} Public URL
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Validate file type and size
   * @param {File} file - The file to validate
   * @param {Array} allowedTypes - Allowed MIME types
   * @param {number} maxSizeMB - Maximum size in MB
   * @returns {Object} Validation result
   */
  validateFile(file, allowedTypes = [], maxSizeMB = 100) {
    const errors = [];

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get supported video formats
   * @returns {Array} Supported video MIME types
   */
  getSupportedVideoFormats() {
    return [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/mkv'
    ];
  }

  /**
   * Get supported document formats
   * @returns {Array} Supported document MIME types
   */
  getSupportedDocumentFormats() {
    return [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];
  }

  /**
   * Get supported image formats
   * @returns {Array} Supported image MIME types
   */
  getSupportedImageFormats() {
    return [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
  }

  /**
   * Upload product image
   * @param {File} file - Image file
   * @param {string} productId - Product ID (optional, generates UUID if not provided)
   * @param {number} imageIndex - Index of the image (for multiple images)
   * @returns {Promise<Object>} Upload result
   */
  async uploadProductImage(file, productId = null, imageIndex = 0) {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${imageIndex}-${sanitizedName}`;
    
    const productPath = productId || 'temp';
    const path = `products/${productPath}/images/${fileName}`;
    
    // Validate image file
    const validation = this.validateFile(file, this.getSupportedImageFormats(), 5);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    return await this.uploadFile(file, 'course-antik-bucket', path, {
      upsert: false,
      contentType: file.type
    });
  }

  /**
   * Upload user avatar/profile picture
   * @param {File} file - Image file
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadUserAvatar(file, userId) {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar-${timestamp}.${fileExtension}`;
    const path = `users/${userId}/avatars/${fileName}`;
    
    // Validate image file - smaller size for avatars
    const validation = this.validateFile(file, this.getSupportedImageFormats(), 2);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    return await this.uploadFile(file, 'course-antik-bucket', path, {
      upsert: false,
      contentType: file.type
    });
  }

  /**
   * Upload assignment submission file
   * @param {File} file - Submission file
   * @param {string} assignmentId - Assignment ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadAssignmentSubmission(file, assignmentId, userId) {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;
    const path = `assignments/${assignmentId}/submissions/${userId}/${fileName}`;
    
    // Validate file - allow documents, images, and archives
    const allowedTypes = [
      ...this.getSupportedDocumentFormats(),
      ...this.getSupportedImageFormats(),
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed'
    ];
    
    const validation = this.validateFile(file, allowedTypes, 50);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    return await this.uploadFile(file, 'course-antik-bucket', path);
  }

  /**
   * Delete old thumbnail and upload new one
   * @param {File} file - New image file
   * @param {string} courseId - Course ID
   * @param {string} oldThumbnailUrl - Old thumbnail URL to delete
   * @returns {Promise<Object>} Upload result
   */
  async replaceCourseThumbnail(file, courseId, oldThumbnailUrl) {
    // Delete old thumbnail if it exists and is in our storage
    if (oldThumbnailUrl && oldThumbnailUrl.includes('course-antik-bucket')) {
      try {
        const oldPath = this.extractPathFromUrl(oldThumbnailUrl);
        await this.deleteFile('course-antik-bucket', oldPath);
      } catch (error) {
        console.warn('Failed to delete old thumbnail:', error);
        // Continue with upload even if deletion fails
      }
    }
    
    return await this.uploadCourseThumbnail(file, courseId);
  }

  /**
   * Extract storage path from public URL
   * @param {string} publicUrl - Public URL from Supabase
   * @returns {string} Storage path
   */
  extractPathFromUrl(publicUrl) {
    // Extract path from Supabase storage URL
    // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const parts = publicUrl.split('/storage/v1/object/public/');
    if (parts.length > 1) {
      const pathParts = parts[1].split('/');
      pathParts.shift(); // Remove bucket name
      return pathParts.join('/');
    }
    return publicUrl;
  }

  /**
   * Move file from temp to permanent location
   * @param {string} tempPath - Temporary file path
   * @param {string} permanentPath - Permanent file path
   * @returns {Promise<Object>} Result with new URL
   */
  async moveFile(tempPath, permanentPath) {
    try {
      // Copy file to new location
      const { data: copyData, error: copyError } = await supabase.storage
        .from('course-antik-bucket')
        .copy(tempPath, permanentPath);

      if (copyError) {
        throw new Error(`Copy failed: ${copyError.message}`);
      }

      // Delete old file
      await this.deleteFile('course-antik-bucket', tempPath);

      // Get public URL for new location
      const { data: urlData } = supabase.storage
        .from('course-antik-bucket')
        .getPublicUrl(permanentPath);

      return {
        path: permanentPath,
        publicUrl: urlData.publicUrl
      };
    } catch (error) {
      console.error('Storage move error:', error);
      throw error;
    }
  }

  /**
   * Clean up temporary uploads
   * @returns {Promise<number>} Number of files deleted
   */
  async cleanupTempUploads() {
    try {
      const { data: files, error } = await supabase.storage
        .from('course-antik-bucket')
        .list('courses/temp/thumbnails');

      if (error) throw error;

      if (files && files.length > 0) {
        const filesToDelete = files.map(file => `courses/temp/thumbnails/${file.name}`);
        await supabase.storage
          .from('course-antik-bucket')
          .remove(filesToDelete);
        
        return filesToDelete.length;
      }

      return 0;
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }

  /**
   * Bulk delete files by folder path
   * @param {string} folderPath - Folder path to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteFolderContents(folderPath) {
    try {
      // List all files in the folder
      const pathParts = folderPath.split('/');
      const { data: files, error: listError } = await supabase.storage
        .from('course-antik-bucket')
        .list(folderPath);

      if (listError) throw listError;

      if (files && files.length > 0) {
        const filesToDelete = files.map(file => `${folderPath}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('course-antik-bucket')
          .remove(filesToDelete);

        if (deleteError) throw deleteError;
      }

      return true;
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  }
}

export default new StorageService();