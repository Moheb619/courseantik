// ============================================================
// Product API — Product CRUD for shop
// ============================================================
import { supabase } from './supabaseClient';

export const productApi = {
  /**
   * Fetch all active products
   */
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch all products (admin, including inactive)
   */
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new product (admin)
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
   * Update a product (admin)
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

  /**
   * Soft-delete a product (set active = false)
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
   * Update stock after order
   * @param {string} productId
   * @param {number} quantityChange - Negative for decrement
   */
  async updateStock(productId, quantityChange) {
    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    const newStock = Math.max(0, product.stock + quantityChange);

    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
