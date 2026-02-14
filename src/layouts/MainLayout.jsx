import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  Menu,
  X,
  Bell,
  BookOpen,
  ShoppingBag,
  Home,
  LogIn,
  LogOut,
  User,
  Shield,
  GraduationCap,
  ChevronDown,
  Settings,
  Award,
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/shared/PageTransition";

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { cartItems } = useCart();
  const {
    user,
    profile,
    role,
    isAuthenticated,
    isAdmin,
    isInstructor,
    logout,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/products", label: "Merch", icon: ShoppingBag },
    // Admin link — only visible to admins
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  // User initials for avatar fallback
  const getInitials = () => {
    const name =
      profile?.name || user?.user_metadata?.full_name || user?.email || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // Role badge color
  const roleBadge = {
    admin: { label: "Admin", color: "bg-red-500" },
    instructor: { label: "Instructor", color: "bg-blue-500" },
    student: { label: "Student", color: "bg-green-500" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* ───── HEADER ───── */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b-[3px] border-foreground/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center cartoon-shadow-sm text-white font-black text-lg transition-transform group-hover:scale-110">
              CA
            </div>
            <span className="font-extrabold text-xl text-gradient hidden sm:block">
              Course Antik
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
                  ${
                    isActive(link.to)
                      ? "bg-primary text-white cartoon-shadow-sm"
                      : "hover:bg-primary/10 text-foreground/70 hover:text-primary"
                  }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications (only when logged in) */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl hover:bg-primary/10 transition-colors"
              >
                <Bell className="w-5 h-5 text-foreground/70" />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/checkout"
              className="relative p-2 rounded-xl hover:bg-primary/10 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-foreground/70" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ── Auth State ── */}
            {isAuthenticated ? (
              /* User Avatar Dropdown */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-primary/10 transition-all"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {getInitials()}
                    </div>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-foreground/50 transition-transform hidden sm:block ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border-2 border-foreground/10 shadow-xl py-2 z-50 animate-slide-up">
                    {/* Profile Header */}
                    <div className="px-4 py-3 border-b border-foreground/10">
                      <p className="font-bold text-sm truncate">
                        {profile?.name ||
                          user?.user_metadata?.full_name ||
                          "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                      <span
                        className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                          roleBadge[role]?.color || "bg-gray-400"
                        }`}
                      >
                        {roleBadge[role]?.label || "User"}
                      </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      <Link
                        to="/my-courses"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-primary" />
                        My Courses
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors"
                      >
                        <Package className="w-4 h-4 text-primary" />
                        Orders
                      </Link>
                      <Link
                        to="/certificates"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors"
                      >
                        <Award className="w-4 h-4 text-primary" />
                        My Certificates
                      </Link>
                    </div>

                    {/* Admin/Instructor Links */}
                    {(isAdmin || isInstructor) && (
                      <div className="py-1 border-t border-foreground/10">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        {isInstructor && (
                          <Link
                            to="/instructor"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Instructor Panel
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Logout */}
                    <div className="pt-1 border-t border-foreground/10">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login Button */
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm cartoon-shadow-sm hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground)/0.85)] transition-all"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-primary/10"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-md animate-slide-up">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3
                    ${
                      isActive(link.to)
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10 text-foreground/70"
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-courses"
                    className="px-4 py-3 rounded-xl text-sm font-semibold hover:bg-primary/10 text-foreground/70 flex items-center gap-3"
                  >
                    <GraduationCap className="w-5 h-5" />
                    My Courses
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-4 py-3 rounded-xl text-sm font-semibold hover:bg-red-50 text-red-600 flex items-center gap-3"
                    >
                      <Shield className="w-5 h-5" />
                      Admin Dashboard
                    </Link>
                  )}
                  {isInstructor && (
                    <Link
                      to="/instructor"
                      className="px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 text-blue-600 flex items-center gap-3"
                    >
                      <User className="w-5 h-5" />
                      Instructor Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-3"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ───── MAIN CONTENT ───── */}
      <main className="pt-16 flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* ───── FOOTER ───── */}
      <footer className="border-t-[3px] border-foreground/10 bg-foreground/[0.03]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-black text-sm">
                  CA
                </div>
                <span className="font-extrabold text-lg text-gradient">
                  Course Antik
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Learn cartoon art from the best. Shop exclusive merch. Level up
                your creativity! 🎨
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-sm mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link
                  to="/courses"
                  className="hover:text-primary transition-colors"
                >
                  All Courses
                </Link>
                <Link
                  to="/products"
                  className="hover:text-primary transition-colors"
                >
                  Merch Store
                </Link>
                <Link
                  to="/certificates/verify"
                  className="hover:text-primary transition-colors"
                >
                  Verify Certificate
                </Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-bold text-sm mb-3">Account</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link
                  to="/my-courses"
                  className="hover:text-primary transition-colors"
                >
                  My Courses
                </Link>
                <Link
                  to="/orders"
                  className="hover:text-primary transition-colors"
                >
                  Order History
                </Link>
                <Link
                  to="/certificates"
                  className="hover:text-primary transition-colors"
                >
                  My Certificates
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-sm mb-3">Connect</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">
                  YouTube
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Facebook
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Course Antik. All rights reserved.
            Developed by{" "}
            <a
              href="https://www.linkedin.com/in/moheb619/"
              className="hover:text-primary transition-colors"
            >
              Moheb
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
