// SSLCommerz payment integration
export const sslcommerz = {
  // Initialize payment
  createPayment: async (orderData) => {
    try {
      const response = await fetch('/api/payments/sslcommerz/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      
      if (!response.ok) {
        throw new Error('Payment initialization failed')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('SSLCommerz payment error:', error)
      throw error
    }
  },

  // Verify payment
  verifyPayment: async (tranId, valId) => {
    try {
      const response = await fetch('/api/payments/sslcommerz/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tran_id: tranId, val_id: valId }),
      })
      
      if (!response.ok) {
        throw new Error('Payment verification failed')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('SSLCommerz verification error:', error)
      throw error
    }
  },

  // Get payment status
  getPaymentStatus: async (tranId) => {
    try {
      const response = await fetch(`/api/payments/sslcommerz/status/${tranId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get payment status')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('SSLCommerz status error:', error)
      throw error
    }
  }
}

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
}

// Payment types
export const PAYMENT_TYPE = {
  COURSE: 'course',
  PRODUCT: 'product'
}

export default sslcommerz
