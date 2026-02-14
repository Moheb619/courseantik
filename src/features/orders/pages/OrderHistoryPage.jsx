import { useState, useEffect } from "react";
import { Package, Loader2 } from "lucide-react";
import { orderApi } from "@/services/supabase/orderApi";
import { useAuth } from "@/hooks/useAuth";

const statusColors = {
  delivered: "bg-success/10 text-success",
  shipped: "bg-blue-100 text-blue-700",
  processing: "bg-secondary/10 text-secondary",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const data = await orderApi.getMyOrders(user.id);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Order History 📦</h1>
        <p className="text-muted-foreground">Track your past orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">
            Your order history will appear here after your first purchase.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border-[2px] border-foreground/10 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      Order #{order.id?.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusColors[order.status] || ""}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Order items — from nested order_items join */}
              {order.order_items?.length > 0 && (
                <div className="border-t pt-3 space-y-2">
                  {order.order_items.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ৳{(item.unit_price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    Delivery (
                    {order.delivery_location === "dhaka" ? "Dhaka" : "Outside"}
                    ):
                  </span>
                  <span className="font-semibold ml-2">
                    ৳{order.delivery_charge}
                  </span>
                </div>
                <div className="text-lg font-black text-primary">
                  ৳{order.total?.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
