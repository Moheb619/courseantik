import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
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
              {cartItems.map((item) => (
                <li key={item.id} className="flex gap-4 rounded-lg border p-3">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                    <img
                      src={
                        item.image_url ||
                        "/src/assets/images/placeholders/product/default.png"
                      }
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <h3 className="line-clamp-1 text-sm font-medium">
                      {item.title}
                    </h3>
                    <p className="text-sm font-bold">
                      {new Intl.NumberFormat("en-BD", {
                        style: "currency",
                        currency: "BDT",
                      }).format(item.price)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-1">
                        <button
                          className="p-1 hover:text-primary"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="p-1 hover:text-primary"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4 bg-gray-50/50">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-BD", {
                    style: "currency",
                    currency: "BDT",
                  }).format(getCartTotal())}
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
              <span>
                {new Intl.NumberFormat("en-BD", {
                  style: "currency",
                  currency: "BDT",
                }).format(getCartTotal())}
              </span>
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
