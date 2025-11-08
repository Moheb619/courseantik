import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  User,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  RefreshCw,
  CreditCard,
  Package,
  Truck,
  BookOpen,
} from "lucide-react";
import { comprehensiveAdminService } from "../../services/comprehensiveAdminService";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { formatCurrency } from "../../utils/fmt";

const OrderManagementCenter = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders", { status: statusFilter, search: searchTerm }],
    queryFn: () =>
      comprehensiveAdminService.getAllOrders({
        status: statusFilter === "all" ? null : statusFilter,
        limit: 50,
      }),
    staleTime: 2 * 60 * 1000,
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      comprehensiveAdminService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      setIsOrderModalOpen(false);
    },
  });

  const orders = ordersData?.orders || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "pending":
        return Clock;
      case "processing":
        return RefreshCw;
      case "cancelled":
        return XCircle;
      case "refunded":
        return RefreshCw;
      default:
        return Package;
    }
  };

  const handleOrderAction = (action, orderId) => {
    const order = orders.find((o) => o.id === orderId);

    switch (action) {
      case "view":
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
        break;
      case "process":
        updateOrderMutation.mutate({ orderId, status: "processing" });
        break;
      case "complete":
        updateOrderMutation.mutate({ orderId, status: "completed" });
        break;
      case "cancel":
        updateOrderMutation.mutate({ orderId, status: "cancelled" });
        break;
      default:
        console.log(`${action} order ${orderId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Order Management
          </h3>
          <p className="text-sm text-neutral-600">
            Track and manage all platform orders
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Order
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Items
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Total
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            #{order.order_number}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {order.payment_method || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-neutral-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 text-sm">
                            {order.user?.full_name || "Unknown User"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="text-neutral-900">
                          {order.order_items?.length || 0} items
                        </p>
                        <p className="text-neutral-600">
                          {order.order_items
                            ?.map((item) => item.title)
                            .join(", ")
                            .substring(0, 30)}
                          ...
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-neutral-900">
                        {formatCurrency(order.total_amount / 100)}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {order.currency}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-neutral-900">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderAction("view", order.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {order.status === "pending" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleOrderAction("process", order.id)
                            }
                          >
                            Process
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleOrderAction("complete", order.id)
                            }
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-neutral-900">
                  Order #{selectedOrder.order_number}
                </h4>
                <p className="text-sm text-neutral-600">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status}
              </span>
            </div>

            {/* Customer Info */}
            <div>
              <h5 className="font-medium text-neutral-900 mb-3">
                Customer Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Name</p>
                  <p className="font-medium text-neutral-900">
                    {selectedOrder.user?.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Payment Method</p>
                  <p className="font-medium text-neutral-900">
                    {selectedOrder.payment_method || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h5 className="font-medium text-neutral-900 mb-3">Order Items</h5>
              <div className="space-y-3">
                {selectedOrder.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                        {item.item_type === "course" ? (
                          <BookOpen className="w-5 h-5 text-white" />
                        ) : (
                          <Package className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h6 className="font-medium text-neutral-900">
                          {item.title}
                        </h6>
                        <p className="text-sm text-neutral-600">
                          {item.item_type} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">
                        {formatCurrency(item.price_cents / 100)}
                      </p>
                      <p className="text-sm text-neutral-600">
                        Total:{" "}
                        {formatCurrency(
                          (item.price_cents * item.quantity) / 100
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-brand-600">
                  {formatCurrency(selectedOrder.total_amount / 100)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Close
              </Button>
              {selectedOrder.status === "pending" && (
                <Button
                  variant="primary"
                  onClick={() =>
                    updateOrderMutation.mutate({
                      orderId: selectedOrder.id,
                      status: "processing",
                    })
                  }
                  disabled={updateOrderMutation.isPending}
                >
                  Mark as Processing
                </Button>
              )}
              {selectedOrder.status === "processing" && (
                <Button
                  variant="primary"
                  onClick={() =>
                    updateOrderMutation.mutate({
                      orderId: selectedOrder.id,
                      status: "completed",
                    })
                  }
                  disabled={updateOrderMutation.isPending}
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagementCenter;
