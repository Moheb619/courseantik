import React, { useState } from "react";
import { Users, BookOpen, ShoppingCart, BarChart3 } from "lucide-react";
import CourseManagement from "../../../components/admin/CourseManagement";
import UserManagement from "../../../components/admin/UserManagement";
import OrderManagement from "../../../components/admin/OrderManagement";
import ProductManagement from "../../../components/admin/ProductManagement";

const ComprehensiveAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "products", label: "Products", icon: ShoppingCart },
  ];

  const OverviewTab = () => (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Admin Dashboard Overview
        </h3>
        <p className="text-neutral-600">
          Use the tabs above to manage courses, users, orders, and products.
        </p>
      </div>
    </div>
  );

  const CoursesTab = () => <CourseManagement />;

  const UsersTab = () => <UserManagement />;

  const OrdersTab = () => <OrderManagement />;

  const ProductsTab = () => <ProductManagement />;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "courses":
        return <CoursesTab />;
      case "users":
        return <UsersTab />;
      case "orders":
        return <OrdersTab />;
      case "products":
        return <ProductsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600">Manage your platform and users</p>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-neutral-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-brand-50 text-brand-700 border border-brand-200"
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;
