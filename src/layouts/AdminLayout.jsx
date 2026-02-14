import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Users,
  Package,
  Award,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navSections = [
    {
      title: "Overview",
      items: [
        {
          to: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      title: "Content",
      items: [
        { to: "/admin/courses", label: "Courses", icon: BookOpen },
        { to: "/admin/products", label: "Products", icon: ShoppingBag },
      ],
    },
    {
      title: "Management",
      items: [
        { to: "/admin/users", label: "Users", icon: Users },
        { to: "/admin/orders", label: "Orders", icon: Package },
        { to: "/admin/certificates", label: "Certificates", icon: Award },
      ],
    },
    {
      title: "System",
      items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
    },
  ];

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            CA
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-bold text-white text-sm truncate">
                Admin Panel
              </h2>
              <p className="text-white/60 text-xs truncate">Course Antik</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 px-3">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive(item.to, item.exact)
                        ? "bg-white text-primary shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-sm font-medium transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col gradient-primary transition-all duration-300 flex-shrink-0
          ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center p-2 m-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 gradient-primary transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b bg-white flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-primary/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <span className="text-sm font-semibold hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
