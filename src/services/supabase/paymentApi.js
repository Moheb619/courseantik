// ============================================================
// Payment API — SSLCommerz Integration
// ============================================================
import { SSLCOMMERZ_CONFIG } from '../../config/supabaseConfig';

export const paymentApi = {
  /**
   * Initialize SSLCommerz payment session
   * @param {object} params - Payment details
   * @param {string} params.orderId - Internal order UUID
   * @param {number} params.amount - Total in BDT
   * @param {string} params.customerName
   * @param {string} params.customerEmail
   * @param {string} params.customerPhone
   * @param {string} params.shippingAddress
   * @param {string} params.deliveryLocation - 'dhaka' or 'outside'
   * @returns {Promise<string>} Gateway redirect URL
   */
  async initiatePayment({
    orderId,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    deliveryLocation,
  }) {
    const baseUrl = window.location.origin;

    const formData = new URLSearchParams();
    formData.append('store_id', SSLCOMMERZ_CONFIG.store_id);
    formData.append('store_passwd', SSLCOMMERZ_CONFIG.store_passwd);
    formData.append('total_amount', amount.toString());
    formData.append('currency', 'BDT');
    formData.append('tran_id', orderId);
    formData.append('success_url', `${baseUrl}/payment/success`);
    formData.append('fail_url', `${baseUrl}/payment/fail`);
    formData.append('cancel_url', `${baseUrl}/payment/cancel`);
    formData.append('ipn_url', `${baseUrl}/api/payment/ipn`); // IPN callback

    // Customer info
    formData.append('cus_name', customerName);
    formData.append('cus_email', customerEmail);
    formData.append('cus_phone', customerPhone);
    formData.append('cus_add1', shippingAddress);
    formData.append('cus_city', deliveryLocation === 'dhaka' ? 'Dhaka' : 'Other');
    formData.append('cus_country', 'Bangladesh');

    // Shipping info
    formData.append('shipping_method', 'Courier');
    formData.append('ship_name', customerName);
    formData.append('ship_add1', shippingAddress);
    formData.append('ship_city', deliveryLocation === 'dhaka' ? 'Dhaka' : 'Other');
    formData.append('ship_country', 'Bangladesh');

    // Product info
    formData.append('product_name', 'Course Antik Products');
    formData.append('product_category', 'Art Supplies');
    formData.append('product_profile', 'physical-goods');

    try {
      const response = await fetch(SSLCOMMERZ_CONFIG.init_url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const result = await response.json();

      if (result.status === 'SUCCESS') {
        return result.GatewayPageURL;
      } else {
        throw new Error(result.failedreason || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('SSLCommerz Error:', error);
      throw error;
    }
  },

  /**
   * Validate a transaction after payment
   * @param {string} valId - Validation ID from SSLCommerz callback
   * @returns {Promise<object>} Validation response
   */
  async validateTransaction(valId) {
    const url = `${SSLCOMMERZ_CONFIG.validation_url}?val_id=${valId}&store_id=${SSLCOMMERZ_CONFIG.store_id}&store_passwd=${SSLCOMMERZ_CONFIG.store_passwd}&format=json`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('SSLCommerz Validation Error:', error);
      throw error;
    }
  },
};
