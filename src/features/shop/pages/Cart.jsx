import React from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Package,
  ShoppingCart,
  Truck,
  Shield,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectCartItems,
  selectCartTotals,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../../store/slices/cartSlice";
import Button from "../../../components/ui/Button";
import { formatCurrency } from "../../../utils/fmt";

const Cart = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotals = useAppSelector(selectCartTotals);

  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    dispatch(updateQuantity({ itemId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-neutral-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/shop">
              <Button variant="primary" size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Shopping Cart
          </h1>
          <p className="text-lg text-neutral-600">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  Cart Items ({cartTotals.itemCount})
                </h2>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1 truncate">
                          {item.title}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-2">
                          {item.type === "course" ? "Online Course" : "Product"}
                        </p>
                        <div className="text-lg font-bold text-neutral-900">
                          {formatCurrency(item.price / 100)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 text-black">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors flex items-center justify-center"
                          title="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-full bg-neutral-200 hover:bg-neutral-300 transition-colors flex items-center justify-center"
                          title="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-neutral-400 hover:text-error-500 transition-colors p-2 rounded-full hover:bg-error-50"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Clear Cart */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-neutral-500 hover:text-error-500 transition-colors flex items-center gap-2 hover:bg-error-50 px-3 py-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all items
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-100 sticky top-8">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Subtotal
                    </span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(cartTotals.subtotal / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Items ({cartTotals.itemCount})
                    </span>
                    <span className="font-medium">{cartTotals.itemCount}</span>
                  </div>

                  {/* Free shipping indicator */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Free shipping on orders over ৳5,000
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-neutral-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-neutral-900">
                      {formatCurrency(cartTotals.subtotal / 100)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">
                    Including all taxes and fees
                  </p>
                </div>

                {/* Security badge */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Secure checkout with SSL encryption
                    </span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    className="w-full"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="mt-4 text-center">
                  <Link
                    to="/shop"
                    className="text-sm text-neutral-600 hover:text-brand-600 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
