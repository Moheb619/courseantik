import React, { useEffect, useMemo, useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  BookOpen,
  Store,
  Bell,
  LogOut,
  Settings,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useAuth } from "../../hooks/useAuth";
import { selectCartTotals } from "../../store/slices/cartSlice";
import {
  selectMobileMenuOpen,
  selectScrolled,
  setMobileMenuOpen,
  setScrolled,
} from "../../store/slices/uiSlice";
import { cls } from "../../utils/cls";
import { gsap } from "gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import NotificationCenter from "../ui/NotificationCenter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

const Header = () => {
  const dispatch = useAppDispatch();
  const isScrolled = useAppSelector(selectScrolled);
  const isMobileMenuOpen = useAppSelector(selectMobileMenuOpen);
  const cartTotals = useAppSelector(selectCartTotals);
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Get unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Memoize navigation array to prevent unnecessary re-renders
  const navigation = useMemo(() => {
    const baseNavigation = [
      { name: "Home", href: "/", icon: null },
      { name: "Courses", href: "/courses", icon: BookOpen },
      { name: "Shop", href: "/shop", icon: Store },
    ];

    // Add Dashboard option if user is authenticated
    if (isAuthenticated) {
      baseNavigation.push({
        name: "Dashboard",
        href: "/dashboard",
        icon: User,
      });
    }

    return baseNavigation;
  }, [isAuthenticated]);

  // Memoize isActive function to prevent unnecessary re-renders
  const isActive = useCallback(
    (href) => {
      if (href === "/") {
        return location.pathname === "/";
      }
      return location.pathname.startsWith(href);
    },
    [location.pathname]
  );

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      dispatch(setScrolled(scrolled));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  // GSAP animations
  useEffect(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline();

    if (isScrolled) {
      tl.to(".header", {
        y: 0,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      tl.to(".header", {
        y: 0,
        backgroundColor: "rgba(255, 255, 255, 1)",
        backdropFilter: "blur(0px)",
        boxShadow: "none",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isScrolled, prefersReducedMotion]);

  // Memoize mobile menu toggle handler
  const handleMobileMenuToggle = useCallback(() => {
    dispatch(setMobileMenuOpen(!isMobileMenuOpen));
  }, [dispatch, isMobileMenuOpen]);

  // Memoize mobile menu close handler
  const handleMobileMenuClose = useCallback(() => {
    dispatch(setMobileMenuOpen(false));
  }, [dispatch]);

  // Handle profile dropdown toggle
  const handleProfileToggle = useCallback(() => {
    setProfileDropdownOpen(!profileDropdownOpen);
  }, [profileDropdownOpen]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setProfileDropdownOpen(false);
      // The auth state will be updated automatically by the auth hook
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <header
      className={cls(
        "header fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-neutral-900">Antik</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cls(
                  "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-brand-600 bg-brand-50"
                    : "text-neutral-700 hover:text-brand-600 hover:bg-neutral-50"
                )}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-neutral-700 hover:text-brand-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartTotals.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartTotals.itemCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <button
                onClick={() => setNotificationOpen(true)}
                className="relative p-2 text-neutral-700 hover:text-brand-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={handleProfileToggle}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || user.email}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-neutral-900">
                      {user?.full_name || user?.email}
                    </div>
                    {user?.role && (
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "instructor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </div>
                    )}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center overflow-hidden">
                          {user?.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || user.email}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {user?.full_name || user?.email}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {user?.email}
                          </div>
                          {user?.role && (
                            <div
                              className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "instructor"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Account Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/auth/signin"
                  className="text-neutral-700 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden p-2 rounded-md text-neutral-700 hover:text-brand-600 hover:bg-neutral-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleMobileMenuClose}
                className={cls(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors",
                  isActive(item.href)
                    ? "text-brand-600 bg-brand-50"
                    : "text-neutral-700 hover:text-brand-600 hover:bg-neutral-50"
                )}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span>{item.name}</span>
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-neutral-200">
                <div className="flex items-center space-x-3 px-3 py-2 mb-3">
                  <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || user.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {user?.full_name || user?.email}
                    </div>
                    {user?.role && (
                      <div
                        className={`text-xs px-2 py-1 rounded-full inline-block ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "instructor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={handleMobileMenuClose}
                    className="block px-3 py-2 text-base font-medium text-neutral-700 hover:text-brand-600 hover:bg-neutral-50 rounded-md transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/account"
                    onClick={handleMobileMenuClose}
                    className="block px-3 py-2 text-base font-medium text-neutral-700 hover:text-brand-600 hover:bg-neutral-50 rounded-md transition-colors"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      handleMobileMenuClose();
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-neutral-200 space-y-2">
                <Link
                  to="/auth/signin"
                  onClick={handleMobileMenuClose}
                  className="block px-3 py-2 text-base font-medium text-neutral-700 hover:text-brand-600 hover:bg-neutral-50 rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  onClick={handleMobileMenuClose}
                  className="block px-3 py-2 text-base font-medium bg-brand-500 text-white hover:bg-brand-600 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </header>
  );
};

export default Header;
