import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

const CART_STORAGE_KEY = 'course-antik-cart'

export const useCart = () => {
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
      }
    }
  }, [cart, isLoading])

  // Add item to cart
  const addToCart = useCallback((item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
            : cartItem
        )
      } else {
        // Add new item
        return [...prevCart, { ...item, quantity: item.quantity || 1 }]
      }
    })
    
    toast.success(`${item.title} added to cart!`)
  }, [])

  // Remove item from cart
  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => {
      const item = prevCart.find(cartItem => cartItem.id === itemId)
      const newCart = prevCart.filter(cartItem => cartItem.id !== itemId)
      
      if (item) {
        toast.success(`${item.title} removed from cart!`)
      }
      
      return newCart
    })
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      )
    )
  }, [removeFromCart])

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([])
    toast.success('Cart cleared!')
  }, [])

  // Calculate cart totals
  const cartTotals = useCallback(() => {
    const subtotal = cart.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)

    const itemCount = cart.reduce((count, item) => {
      return count + item.quantity
    }, 0)

    return {
      subtotal,
      itemCount,
      formattedSubtotal: new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(subtotal)
    }
  }, [cart])

  // Check if item is in cart
  const isInCart = useCallback((itemId) => {
    return cart.some(item => item.id === itemId)
  }, [cart])

  // Get item quantity in cart
  const getItemQuantity = useCallback((itemId) => {
    const item = cart.find(item => item.id === itemId)
    return item ? item.quantity : 0
  }, [cart])

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotals: cartTotals(),
    isInCart,
    getItemQuantity,
    isEmpty: cart.length === 0
  }
}

export default useCart
