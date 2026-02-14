// ============================================================
// Storage API — Centralized file operations
// ============================================================
import { supabase } from './supabaseClient';
import { STORAGE_BUCKET } from '../../config/supabaseConfig';

export const storageApi = {
  /**
   * Upload a file to the storage bucket
   * @param {string} path - Full path within the bucket (e.g., "courses/uuid/trailer/trailer.mp4")
   * @param {File} file - The File object to upload
   * @param {object} options - Optional config (contentType, upsert, etc.)
   * @returns {Promise<{path: string}>}
   */
  async uploadFile(path, file, options = {}) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: options.upsert || false,
        contentType: options.contentType || file.type,
      });

    if (error) throw error;
    return data;
  },

  /**
   * Get a signed URL for private file access
   * @param {string} path - File path within the bucket
   * @param {number} expiresIn - Seconds until URL expires (default 1 hour)
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Get a public URL (for public-readable files like avatars, trailers)
   * @param {string} path - File path
   * @returns {string}
   */
  getPublicUrl(path) {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   * @param {string|string[]} paths - Single path or array of paths
   */
  async deleteFile(paths) {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(pathArray);

    if (error) throw error;
  },

  /**
   * List files in a folder
   * @param {string} folder - Folder path within the bucket
   */
  async listFiles(folder) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, { sortBy: { column: 'name', order: 'asc' } });

    if (error) throw error;
    return data;
  },
};
