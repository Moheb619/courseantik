// ============================================================
// Product API — Products, Variants & Image storage
// ============================================================
import { supabase } from './supabaseClient';

const BUCKET = 'course-antik-bucket';

export const productApi = {
  // ─── READ (PUBLIC) ─────────────────────────────────────────

  /**
   * Fetch all active products with category + variants (public view)
   */
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch ALL products with category + variants (admin view)
   */
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch a single product by ID with category + variants
   */
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // ─── CREATE / UPDATE (ADMIN) ───────────────────────────────

  /**
   * Create a new product
   */
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a product
   */
  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ─── DELETE (ADMIN) ────────────────────────────────────────

  /**
   * Soft-delete (set active = false)
   */
  async deleteProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Hard-delete: remove DB row + entire storage folder
   */
  async hardDeleteProduct(id) {
    // 1. Recursively list and delete all files under products/<id>/
    await this._deleteStorageFolder(`products/${id}`);

    // 2. Delete DB row (variants cascade automatically)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ─── VARIANT CRUD (ADMIN) ─────────────────────────────────

  /**
   * Create a variant for a product
   */
  async createVariant(variantData) {
    const { data, error } = await supabase
      .from('product_variants')
      .insert([variantData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a variant
   */
  async updateVariant(variantId, updates) {
    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', variantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a variant + its storage images
   */
  async deleteVariant(productId, variantId) {
    await this._deleteStorageFolder(`products/${productId}/variants/${variantId}`);

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (error) throw error;
  },

  // ─── IMAGE UPLOAD (ADMIN) ─────────────────────────────────

  /**
   * Upload a product image to structured storage
   * @param {string} productId
   * @param {File}   file
   * @param {'main'|'gallery'|'thumbnails'} folder
   * @returns {string} Public URL
   */
  async uploadProductImage(productId, file, folder = 'gallery') {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `products/${productId}/images/${folder}/${timestamp}_${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  /**
   * Upload a variant-specific image
   */
  async uploadVariantImage(productId, variantId, file) {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `products/${productId}/variants/${variantId}/images/${timestamp}_${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  /**
   * Delete a single image from storage by its public URL
   */
  async deleteProductImage(publicUrl) {
    const marker = `/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;

    const filePath = decodeURIComponent(publicUrl.substring(idx + marker.length));
    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (error) throw error;
  },

  // ─── STOCK ─────────────────────────────────────────────────

  /**
   * Update stock (for base product or variant)
   */
  async updateStock(productId, quantityChange, variantId = null) {
    const table = variantId ? 'product_variants' : 'products';
    const id = variantId || productId;

    const { data: current, error: fetchError } = await supabase
      .from(table)
      .select('stock')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newStock = Math.max(0, current.stock + quantityChange);

    const updateData = { stock: newStock };
    if (!variantId) updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ─── REVIEWS ────────────────────────────────────────────────

  /**
   * Fetch all reviews for a product with reviewer profile
   */
  async getProductReviews(productId) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, reviewer:profiles!product_reviews_profile_fk(id, name, avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get rating stats: average, count, distribution (1-5)
   */
  async getProductRatingStats(productId) {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) throw error;

    const reviews = data || [];
    if (reviews.length === 0) return { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] };

    const distribution = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
    let total = 0;
    for (const r of reviews) {
      distribution[r.rating - 1]++;
      total += r.rating;
    }

    return {
      avg: Math.round((total / reviews.length) * 10) / 10,
      count: reviews.length,
      distribution,
    };
  },

  /**
   * Submit a new review (one per user per product enforced by DB)
   * @param {string} productId
   * @param {{ rating: number, comment?: string }} reviewData
   * @param {File[]} imageFiles – optional images
   */
  async submitReview(productId, reviewData, imageFiles = []) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in to submit a review');

    // Insert review first to get ID
    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert([{ product_id: productId, user_id: user.id, ...reviewData }])
      .select('*, reviewer:profiles!product_reviews_profile_fk(id, name, avatar_url)')
      .single();

    if (error) throw error;

    // Upload images if any
    if (imageFiles.length > 0) {
      const urls = [];
      for (const file of imageFiles) {
        const url = await this.uploadReviewImage(productId, review.id, file);
        urls.push(url);
      }
      // Update review with image URLs
      const { data: updated, error: updateErr } = await supabase
        .from('product_reviews')
        .update({ images: urls })
        .eq('id', review.id)
        .select('*, reviewer:profiles!product_reviews_profile_fk(id, name, avatar_url)')
        .single();

      if (updateErr) throw updateErr;
      return updated;
    }

    return review;
  },

  /**
   * Update own review
   */
  async updateReview(reviewId, updates) {
    const { data, error } = await supabase
      .from('product_reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .select('*, reviewer:profiles!product_reviews_profile_fk(id, name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a review + its storage images
   */
  async deleteReview(productId, reviewId) {
    // Clean up storage images
    await this._deleteStorageFolder(`products/${productId}/reviews/${reviewId}`);

    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  /**
   * Upload a review image
   */
  async uploadReviewImage(productId, reviewId, file) {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `products/${productId}/reviews/${reviewId}/images/${timestamp}_${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  // ─── HELPERS (PRIVATE) ─────────────────────────────────────

  /**
   * Recursively delete all files in a storage folder
   */
  async _deleteStorageFolder(folderPath) {
    const { data: files } = await supabase.storage
      .from(BUCKET)
      .list(folderPath);

    if (!files || files.length === 0) return;

    // Separate files from sub-folders
    const filePaths = [];
    for (const item of files) {
      if (item.id) {
        // It's a file
        filePaths.push(`${folderPath}/${item.name}`);
      } else {
        // It's a folder — recurse
        await this._deleteStorageFolder(`${folderPath}/${item.name}`);
      }
    }

    if (filePaths.length > 0) {
      await supabase.storage.from(BUCKET).remove(filePaths);
    }
  },
};
