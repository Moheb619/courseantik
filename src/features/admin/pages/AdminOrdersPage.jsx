import { useState, useEffect } from "react";
import { Package, Loader2 } from "lucide-react";
import { orderApi } from "@/services/supabase/orderApi";

const statusColors = {
  delivered: "bg-success/10 text-success",
  shipped: "bg-blue-100 text-blue-700",
  processing: "bg-secondary/10 text-secondary",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.getAllOrders();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Update order status inline
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Orders</h1>
        <p className="text-muted-foreground text-sm">
          {orders.length} total orders
        </p>
      </div>

      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Order ID</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Customer
              </th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Items
              </th>
              <th className="text-left p-4 font-semibold">Total</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Payment
              </th>
              <th className="text-left p-4 font-semibold hidden lg:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="font-mono font-semibold text-xs">
                      #{order.id?.slice(0, 8)}
                    </span>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-muted-foreground">
                    {order.profiles?.name || "—"}
                  </span>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-muted-foreground">
                    {order.order_items?.length || 0} item(s)
                  </span>
                </td>
                <td className="p-4 font-bold text-primary">
                  ৳{order.total?.toLocaleString()}
                </td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`text-xs font-bold px-2 py-1 rounded-full capitalize border-0 cursor-pointer ${statusColors[order.status] || ""}`}
                  >
                    {[
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">
                  {order.payment_status || order.payment_method}
                </td>
                <td className="p-4 text-muted-foreground hidden lg:table-cell">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
