// ============================================================
// Order API — E-commerce order management
// ============================================================
import { supabase } from './supabaseClient';

export const orderApi = {
  /**
   * Create a new order with items
   * @param {object} orderData - { user_id, subtotal, delivery_charge, delivery_location, total, shipping_address, phone, payment_method }
   * @param {Array} items - [{ product_id, title, quantity, unit_price }]
   * @returns {Promise<object>} Created order
   */
  async createOrder(orderData, items) {
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items with order_id
    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  },

  /**
   * Get orders for the current user
   */
  async getMyOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get all orders (admin only)
   */
  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Update order status (admin)
   * @param {string} orderId
   * @param {string} status - pending | processing | shipped | delivered | cancelled
   */
  async updateOrderStatus(orderId, status) {
    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update payment status after SSLCommerz callback
   */
  async updatePaymentStatus(orderId, paymentStatus, transactionId) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        payment_transaction_id: transactionId,
        status: paymentStatus === 'paid' ? 'processing' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
