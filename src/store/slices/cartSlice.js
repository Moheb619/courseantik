import { createSlice, createSelector } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'course-antik-cart';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        existingItem.quantity += (newItem.quantity || 1);
      } else {
        // Add new item
        state.items.push({ ...newItem, quantity: newItem.quantity || 1 });
      }
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        state.items = state.items.filter(item => item.id !== itemId);
      } else {
        // Update quantity
        const item = state.items.find(item => item.id === itemId);
        if (item) {
          item.quantity = quantity;
        }
      }
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    clearCart: (state) => {
      state.items = [];
      
      // Clear localStorage
      localStorage.removeItem(CART_STORAGE_KEY);
    },
    
    setCartLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  setCartLoading 
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartIsEmpty = (state) => state.cart.items.length === 0;

// Memoized selector to prevent unnecessary re-renders
export const selectCartTotals = createSelector(
  [selectCartItems],
  (cart) => {
    const subtotal = cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const itemCount = cart.reduce((count, item) => {
      return count + item.quantity;
    }, 0);

    return {
      subtotal,
      itemCount,
      formattedSubtotal: new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(subtotal)
    };
  }
);

export const selectIsInCart = (state, itemId) => {
  return state.cart.items.some(item => item.id === itemId);
};

export const selectItemQuantity = (state, itemId) => {
  const item = state.cart.items.find(item => item.id === itemId);
  return item ? item.quantity : 0;
};

export default cartSlice.reducer;
