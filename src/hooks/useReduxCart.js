import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectCartItems,
  selectCartLoading,
  selectCartIsEmpty,
  selectCartTotals,
  selectIsInCart,
  selectItemQuantity,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCartLoading
} from '../store/slices/cartSlice';
import { toast } from 'react-hot-toast';

export const useReduxCart = () => {
  const dispatch = useAppDispatch();
  
  const cart = useAppSelector(selectCartItems);
  const isLoading = useAppSelector(selectCartLoading);
  const isEmpty = useAppSelector(selectCartIsEmpty);
  const cartTotals = useAppSelector(selectCartTotals);

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
    toast.success(`${item.title} added to cart!`);
  };

  const handleRemoveFromCart = (itemId) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    dispatch(removeFromCart(itemId));
    
    if (item) {
      toast.success(`${item.title} removed from cart!`);
    }
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    dispatch(updateQuantity({ itemId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared!');
  };

  const handleSetCartLoading = (loading) => {
    dispatch(setCartLoading(loading));
  };

  // Create selector functions that can be used with itemId
  const createIsInCartSelector = (itemId) => (state) => selectIsInCart(state, itemId);
  const createItemQuantitySelector = (itemId) => (state) => selectItemQuantity(state, itemId);

  return {
    cart,
    isLoading,
    isEmpty,
    cartTotals,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    setCartLoading: handleSetCartLoading,
    isInCart: createIsInCartSelector,
    getItemQuantity: createItemQuantitySelector,
  };
};

export default useReduxCart;
