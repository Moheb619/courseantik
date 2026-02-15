// ============================================================
// Category API — CRUD for product categories
// ============================================================
import { supabase } from './supabaseClient';

export const categoryApi = {
  /**
   * Fetch all categories ordered by sort_order (public)
   */
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new category (admin)
   */
  async createCategory({ name, description = '' }) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Get max sort_order
    const { data: existing } = await supabase
      .from('categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing?.[0]?.sort_order != null
      ? existing[0].sort_order + 1
      : 0;

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, slug, description, sort_order: nextOrder }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a category (admin)
   */
  async updateCategory(id, updates) {
    // Auto-generate slug if name changed
    if (updates.name) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a category (admin)
   * Refuses if products are linked to it
   */
  async deleteCategory(id) {
    // Check for linked products
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count > 0) {
      throw new Error(
        `Cannot delete: ${count} product(s) still use this category. Reassign them first.`
      );
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
