// ============================================================
// CartContext — Variant-aware cart with localStorage persistence
// ============================================================
import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

/**
 * Build a unique key for a cart line.
 * Same product with different variants = different lines.
 */
const cartKey = (productId, variantId) => `${productId}_${variantId || "base"}`;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ─── ADD TO CART ──────────────────────────────────────────
  /**
   * @param {object} product  – full product object
   * @param {object|null} variant – selected variant (or null for base)
   * @param {number} quantity – how many to add (default 1)
   */
  const addToCart = (product, variant = null, quantity = 1) => {
    const key = cartKey(product.id, variant?.id);
    const effectivePrice = variant?.price_override ?? product.price;
    const maxStock = variant ? variant.stock : product.stock;

    setCartItems((prev) => {
      const existing = prev.find((i) => i._key === key);
      if (existing) {
        // Increase quantity, clamped to stock
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map((i) =>
          i._key === key ? { ...i, quantity: newQty } : i,
        );
      }
      return [
        ...prev,
        {
          _key: key,
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail || product.images?.[0] || null,
          price: effectivePrice,
          basePrice: product.price,
          variantId: variant?.id || null,
          selectedColor: variant?.color || null,
          selectedSize: variant?.size || null,
          maxStock,
          quantity: Math.min(quantity, maxStock),
        },
      ];
    });
  };

  // ─── REMOVE ───────────────────────────────────────────────
  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((i) => i._key !== key));
  };

  // ─── UPDATE QUANTITY ──────────────────────────────────────
  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((i) =>
        i._key === key ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i,
      ),
    );
  };

  // ─── CLEAR ────────────────────────────────────────────────
  const clearCart = () => setCartItems([]);

  // ─── TOTALS ───────────────────────────────────────────────
  const getCartTotal = () =>
    cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const getCartCount = () => cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
