import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { orderApi } from "@/services/supabase/orderApi";
import { useAuth } from "@/hooks/useAuth";

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("dhaka"); // 'dhaka' or 'outside'
  const [formError, setFormError] = useState(null);

  // Delivery charges
  const DELIVERY_CHARGES = {
    dhaka: 60,
    outside: 120,
  };

  const subtotal = getCartTotal();
  const deliveryCharge = DELIVERY_CHARGES[location];
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Check authentication
    if (!isAuthenticated || !user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // Get form values
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const phone = formData.get("phone");
    const address = formData.get("address");

    if (!name || !phone || !address) {
      setFormError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // Build order data matching orderApi.createOrder signature
      const orderData = {
        user_id: user.id,
        subtotal,
        delivery_charge: deliveryCharge,
        delivery_location: location,
        total,
        shipping_address: address,
        phone,
        payment_method: "sslcommerz",
      };

      // Build items array
      const items = cartItems.map((item) => ({
        product_id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const order = await orderApi.createOrder(orderData, items);

      // Clear cart after successful order creation
      clearCart();

      // TODO: Redirect to SSLCommerz payment gateway using order.id
      // For now, navigate to order history
      alert(
        `Order #${order.id.slice(0, 8)} created! Payment integration coming soon.`,
      );
      navigate("/dashboard/orders");
    } catch (err) {
      console.error("Error placing order:", err);
      setFormError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-primary/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-4">
          Add some products to your cart first.
        </p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="mb-8 text-3xl font-black">Checkout 💳</h1>

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
          {formError}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Shipping Form */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Shipping Details</h2>
          <form
            onSubmit={handlePlaceOrder}
            className="space-y-4"
            id="checkout-form"
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter your full name"
                defaultValue={user?.user_metadata?.full_name || ""}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                required
                placeholder="017xxxxxxxx"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                name="address"
                required
                placeholder="House, Road, Area, etc."
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label>Delivery Location</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 border-[2px] border-foreground/10 p-3 rounded-xl cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex-1">
                  <input
                    type="radio"
                    name="location"
                    value="dhaka"
                    checked={location === "dhaka"}
                    onChange={() => setLocation("dhaka")}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">
                    Inside Dhaka (৳60)
                  </span>
                </label>
                <label className="flex items-center space-x-2 border-[2px] border-foreground/10 p-3 rounded-xl cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex-1">
                  <input
                    type="radio"
                    name="location"
                    value="outside"
                    checked={location === "outside"}
                    onChange={() => setLocation("outside")}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">
                    Outside Dhaka (৳120)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <div className="rounded-xl bg-warning/10 p-4 text-sm text-warning border border-warning/30">
                <strong>⚠️ Note:</strong> Cash on Delivery is NOT available.
                Full payment required.
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-2xl border-[3px] border-foreground/10 bg-white p-6 cartoon-shadow sticky top-24">
            <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
            <div className="mb-4 max-h-60 overflow-y-auto space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="line-clamp-1">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between border-t border-dashed pt-2 text-lg font-black">
                <span>Total</span>
                <span className="text-primary">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              className="mt-6 w-full rounded-xl font-bold text-lg py-6 cartoon-shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ৳${total.toLocaleString()}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
