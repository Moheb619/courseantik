// ============================================================
// Settings API — Delivery charges & Revenue split
// ============================================================
import { supabase } from './supabaseClient';

export const settingsApi = {
  /**
   * Get all delivery charge settings
   * @returns {Promise<Array>} [{ location_key, label, charge }]
   */
  async getDeliveryCharges() {
    const { data, error } = await supabase
      .from('delivery_settings')
      .select('*')
      .order('location_key');

    if (error) throw error;
    return data;
  },

  /**
   * Update a delivery charge (admin)
   * @param {string} locationKey - 'dhaka' or 'outside'
   * @param {number} charge - New charge amount in BDT
   */
  async updateDeliveryCharge(locationKey, charge) {
    const { data, error } = await supabase
      .from('delivery_settings')
      .update({ charge, updated_at: new Date().toISOString() })
      .eq('location_key', locationKey)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get revenue split settings
   * @returns {Promise<object>} { instructor_percentage, platform_percentage }
   */
  async getRevenueSplit() {
    const { data, error } = await supabase
      .from('revenue_settings')
      .select('*');

    if (error) throw error;

    // Transform array into object
    const result = {};
    data.forEach((row) => {
      result[row.key] = row.value;
    });
    return result;
  },

  /**
   * Update revenue split (admin)
   * @param {string} key - e.g. 'instructor_percentage'
   * @param {string} value - e.g. '30'
   */
  async updateRevenueSplit(key, value) {
    const { data, error } = await supabase
      .from('revenue_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
