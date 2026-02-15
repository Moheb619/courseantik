// ============================================================
// CartSidebar — Slide-out cart with variant display
// ============================================================
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/utils/cn";

const CartSidebar = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const toggleCart = () => setIsOpen(!isOpen);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={toggleCart}
      >
        <ShoppingBag className="h-6 w-6" />
        {getCartCount() > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
            {getCartCount()}
          </span>
        )}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-xl transition-transform duration-300 ease-in-out sm:max-w-md",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold">Your Cart ({getCartCount()})</h2>
          <Button variant="ghost" size="icon" onClick={toggleCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Button
                onClick={toggleCart}
                className="rounded-full border-2 border-black"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => {
                const nearLimit = item.quantity >= item.maxStock;
                return (
                  <li
                    key={item._key}
                    className="flex gap-4 rounded-lg border p-3"
                  >
                    {/* Thumbnail */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <h3 className="line-clamp-1 text-sm font-medium">
                        {item.title}
                      </h3>

                      {/* Variant badges */}
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex gap-1.5 mt-0.5">
                          {item.selectedColor && (
                            <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-[10px] bg-secondary/10 text-secondary font-semibold px-2 py-0.5 rounded-full">
                              {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-sm font-bold">
                        ৳{item.price.toLocaleString()}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-1">
                          <button
                            className="p-1 hover:text-primary"
                            onClick={() =>
                              updateQuantity(item._key, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1 hover:text-primary disabled:opacity-40"
                            onClick={() =>
                              updateQuantity(item._key, item.quantity + 1)
                            }
                            disabled={nearLimit}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._key)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Stock warning */}
                      {nearLimit && (
                        <p className="flex items-center gap-1 text-[10px] text-warning mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          Only {item.maxStock} in stock
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4 bg-gray-50/50">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  ৳{getCartTotal().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Delivery (Estimated)
                </span>
                <span className="font-medium text-muted-foreground">
                  Calculated at checkout
                </span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>৳{getCartTotal().toLocaleString()}</span>
            </div>
            <Button
              className="w-full rounded-full border-2 border-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              asChild
              onClick={toggleCart}
            >
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
