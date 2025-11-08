import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Calendar,
  CreditCard,
  Truck,
  BookOpen,
  ShoppingBag,
  Filter,
  Search,
} from "lucide-react";
import { dummyOrders } from "../../../data/dummyData";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";

const Orders = () => {
  const [orders] = useState(dummyOrders);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Order History
              </h1>
              <p className="text-neutral-600 mt-1">
                Track and manage your orders
              </p>
            </div>
            <Link to="/shop">
              <Button variant="primary">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No orders found
              </h3>
              <p className="text-neutral-600 mb-6">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't placed any orders yet."}
              </p>
              <Link to="/shop">
                <Button variant="primary">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">
                          Order #{order.id}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-neutral-900">
                          {formatCurrency(order.total / 100)}
                        </p>
                        <span
                          className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-medium text-neutral-900 mb-4">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl"
                      >
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-neutral-200">
                          {item.type === "course" ? (
                            <BookOpen className="w-6 h-6 text-brand-600" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-neutral-900">
                            {item.name}
                          </h5>
                          <p className="text-sm text-neutral-600 capitalize">
                            {item.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900">
                            {formatCurrency(item.price / 100)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {order.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </Button>
                    )}
                    {order.status === "pending" && (
                      <Button variant="primary" size="sm">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Complete Payment
                      </Button>
                    )}
                    {order.status === "completed" &&
                      order.items.some((item) => item.type === "course") && (
                        <Link to="/dashboard">
                          <Button variant="primary" size="sm">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Access Courses
                          </Button>
                        </Link>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary Stats */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Order Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-neutral-900">
                  {filteredOrders.length}
                </p>
                <p className="text-sm text-neutral-600">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-neutral-900">
                  {formatCurrency(
                    filteredOrders.reduce(
                      (sum, order) => sum + order.total,
                      0
                    ) / 100
                  )}
                </p>
                <p className="text-sm text-neutral-600">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-neutral-900">
                  {
                    filteredOrders.filter(
                      (order) => order.status === "completed"
                    ).length
                  }
                </p>
                <p className="text-sm text-neutral-600">Completed Orders</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
