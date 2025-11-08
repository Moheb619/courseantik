import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  Zap,
  Shield,
  Heart,
  Target,
  Rocket,
  ShoppingBag,
  Tag,
  ShoppingCart,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../../courses/services/courseService";
import { formatCurrency } from "../../../utils/fmt";

// Import images
import antikHead from "../../../assets/img/Antik head.jpg";
import antikHoldingBurger from "../../../assets/img/Antik holding burger.png";
import antikWhiteOversized from "../../../assets/img/antik white oversized.jpg";
import badgeImage from "../../../assets/img/badge.png";
import bundleOffer from "../../../assets/img/Bundle offer.jpg";
import classPromo from "../../../assets/img/class promo.png";
import antikFire from "../../../assets/img/antik fire.png";
import wink from "../../../assets/img/wink.png";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const coursesRef = useRef(null);
  const productsRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  // Fetch featured courses from database
  const { data: featuredCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses", { featured: true, limit: 3 }],
    queryFn: () => courseService.getCourses({ featured: true, limit: 3 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch course statistics
  const { data: courseStats } = useQuery({
    queryKey: ["course-stats"],
    queryFn: () => courseService.getCourseStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    // Simple hero animations with fallback
    if (heroRef.current) {
      const heroTitle = heroRef.current.querySelector(".hero-title");
      const heroSubtitle = heroRef.current.querySelector(".hero-subtitle");
      const heroButtons = heroRef.current.querySelector(".hero-buttons");
      const heroCartoons = heroRef.current.querySelectorAll(".hero-cartoon");

      if (heroTitle) {
        gsap.fromTo(
          heroTitle,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
      }

      if (heroSubtitle) {
        gsap.fromTo(
          heroSubtitle,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.2 }
        );
      }

      if (heroButtons) {
        gsap.fromTo(
          heroButtons,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.4 }
        );
      }

      if (heroCartoons.length > 0) {
        gsap.fromTo(
          heroCartoons,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 0.2,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
            delay: 0.6,
          }
        );
      }
    }

    // Simple scroll animations with fallback
    if (featuresRef.current) {
      const featureCards =
        featuresRef.current.querySelectorAll(".feature-card");
      if (featureCards.length > 0) {
        gsap.fromTo(
          featureCards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }

    if (coursesRef.current) {
      const courseCards = coursesRef.current.querySelectorAll(".course-card");
      if (courseCards.length > 0) {
        gsap.fromTo(
          courseCards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: coursesRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }

    if (productsRef.current) {
      const productCards =
        productsRef.current.querySelectorAll(".product-card");
      if (productCards.length > 0) {
        gsap.fromTo(
          productCards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: productsRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }

    if (statsRef.current) {
      const statItems = statsRef.current.querySelectorAll(".stat-item");
      if (statItems.length > 0) {
        gsap.fromTo(
          statItems,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }

    if (ctaRef.current) {
      const ctaElements = ctaRef.current.querySelectorAll(".cta-element");
      if (ctaElements.length > 0) {
        gsap.fromTo(
          ctaElements,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Background Image Design */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-screen sm:h-screen flex items-center"
      >
        {/* Full background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${antikHoldingBurger})`,
          }}
        ></div>

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/70"></div>

        {/* Additional gradient overlay for better content visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/80"></div>

        {/* Floating Antik elements - Subtle decorative images */}
        <div className="hero-cartoon absolute top-10 right-4 sm:top-20 sm:right-10 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 opacity-10">
          <img
            src={wink}
            alt="Antik Wink"
            className="w-full h-full object-contain animate-bounce"
          />
        </div>
        <div className="hero-cartoon absolute bottom-10 left-4 sm:bottom-20 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 opacity-10">
          <img
            src={antikFire}
            alt="Antik Fire"
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
        <div className="hero-cartoon absolute top-1/2 left-4 sm:left-10 lg:left-20 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 opacity-10">
          <img
            src={badgeImage}
            alt="Antik Badge"
            className="w-full h-full object-contain animate-spin"
          />
        </div>

        {/* Background Antik character - Large decorative element */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/4 opacity-5 hidden lg:block">
          <img
            src={antikHead}
            alt="Antik Character Background"
            className="w-64 h-64 xl:w-80 xl:h-80 object-contain hero-cartoon"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-12 lg:py-20">
          <div className="flex justify-center items-center min-h-[80vh] sm:h-full">
            {/* Modern Hero Content */}
            <div className="text-center relative z-10 max-w-5xl">
              {/* Modern gradient badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 lg:mb-8 border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-xs sm:text-sm font-medium">
                  Welcome to the Future of Learning
                </span>
              </div>

              {/* Main heading with modern typography */}
              <h1
                className="hero-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 lg:mb-8 text-white leading-tight"
                style={{ opacity: 1 }}
              >
                Learn & Shop with
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                  Antik
                </span>
              </h1>

              {/* Modern description */}
              <p
                className="hero-subtitle text-base sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 lg:mb-12 text-white/80 leading-relaxed max-w-4xl mx-auto font-light px-4"
                style={{ opacity: 0.9 }}
              >
                Transform your skills with our premium courses and discover
                <span className="text-yellow-300 font-semibold">
                  {" "}
                  amazing products
                </span>{" "}
                to enhance your learning journey.
              </p>

              {/* Modern button group */}
              <div
                className="hero-buttons flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-6 sm:mb-8 lg:mb-12 px-4"
                style={{ opacity: 1 }}
              >
                <Link to="/courses">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      Explore Courses
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button
                    variant="outline"
                    size="lg"
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white hover:text-neutral-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      Shop Products
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Antik? 🤔
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              We combine the best of digital learning with premium physical
              products to create a complete educational experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Expert-Led Courses 👨‍🏫
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Learn from industry experts with years of experience in their
                fields. Get real-world insights and practical knowledge.
              </p>
            </div>

            <div className="feature-card text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Premium Products ⭐
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                High-quality tools and resources to support your learning
                journey. From books to gadgets, we've got you covered.
              </p>
            </div>

            <div className="feature-card text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
                Community Support 🤝
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Join a community of learners and get support when you need it.
                Connect, collaborate, and grow together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section ref={coursesRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Featured Courses 🎓
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Start your learning journey with our most popular courses
            </p>
          </div>

          {/* Class Promo Banner - Clean Modern Design */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left side - Content */}
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-6">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                    Special Course Promotion!
                  </h3>
                  <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                    Limited time offer on our premium courses. Don't miss out on
                    this amazing opportunity to enhance your skills!
                  </p>
                  <Link to="/courses">
                    <Button
                      variant="primary"
                      size="lg"
                      className="transform hover:scale-105 transition-all"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Browse Courses
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Right side - Image */}
                <div className="relative h-64 lg:h-auto">
                  <img
                    src={classPromo}
                    alt="Course Promotion"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingCourses ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-neutral-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : featuredCourses.length > 0 ? (
              featuredCourses.map((course) => (
                <div
                  key={course.id}
                  className="course-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition-all"
                >
                  <div className="relative">
                    <img
                      src={
                        course.thumbnail ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"
                      }
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 text-3xl">
                      {course.title.includes("React")
                        ? "⚛️"
                        : course.title.includes("Node")
                        ? "🟢"
                        : course.title.includes("Full Stack")
                        ? "🚀"
                        : course.title.includes("Python")
                        ? "🐍"
                        : "📚"}
                    </div>
                    <div className="absolute top-4 right-4 bg-brand-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {course.isFree
                        ? "Free"
                        : formatCurrency(course.priceCents / 100)}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-neutral-600 mb-4">
                      by {course.instructorName || "Course Instructor"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-red-300">
                          {course.rating || 4.5}
                        </span>
                        <span className="text-sm text-neutral-500">
                          ({course.enrolledCount || 0})
                        </span>
                      </div>
                      <Link to={`/course/${course.slug}`}>
                        <Button variant="primary" size="sm">
                          View Course
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">
                  No featured courses available yet.
                </p>
                <Link to="/courses" className="mt-4 inline-block">
                  <Button variant="primary">Browse All Courses</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section ref={productsRef} className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Featured Products 🛍️
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Enhance your learning with our premium products
            </p>
          </div>

          {/* Bundle Offer Banner - Clean Modern Design */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left side - Image */}
                <div className="relative h-64 lg:h-auto order-2 lg:order-1">
                  <img
                    src={bundleOffer}
                    alt="Bundle Offer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                </div>

                {/* Right side - Content */}
                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center order-1 lg:order-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-6">
                    <ShoppingBag className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                    Bundle Offer Available!
                  </h3>
                  <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                    Save more when you buy multiple items together. Get the best
                    value for your money with our exclusive bundles!
                  </p>
                  <Link to="/shop">
                    <Button
                      variant="primary"
                      size="lg"
                      className="transform hover:scale-105 transition-all"
                    >
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Shop Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Premium Laptop Stand",
                price: "৳3,500",
                originalPrice: "৳4,500",
                image:
                  "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
                emoji: "💻",
                rating: 4.8,
                reviews: 156,
                category: "Accessories",
                inStock: true,
              },
              {
                title: "Wireless Keyboard",
                price: "৳8,900",
                image:
                  "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
                emoji: "⌨️",
                rating: 4.6,
                reviews: 89,
                category: "Accessories",
                inStock: true,
              },
              {
                title: "Coding Books Bundle",
                price: "৳2,000",
                originalPrice: "৳2,500",
                image:
                  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
                emoji: "📚",
                rating: 4.9,
                reviews: 234,
                category: "Books",
                inStock: true,
              },
              {
                title: "Developer T-Shirt",
                price: "৳1,200",
                image:
                  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
                emoji: "👕",
                rating: 4.7,
                reviews: 67,
                category: "Merchandise",
                inStock: true,
              },
            ].map((product, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <div className="text-xl bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                      {product.emoji}
                    </div>
                    {product.originalPrice && (
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        -
                        {Math.round(
                          (1 -
                            parseInt(
                              product.price.replace("৳", "").replace(",", "")
                            ) /
                              parseInt(
                                product.originalPrice
                                  .replace("৳", "")
                                  .replace(",", "")
                              )) *
                            100
                        )}
                        % OFF
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="absolute bottom-3 left-3">
                    {product.inStock ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category */}
                  <div className="flex items-center gap-1 mb-2">
                    <Tag className="w-3 h-3 text-brand-500" />
                    <span className="text-xs text-brand-600 font-medium">
                      {product.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-600">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-neutral-900">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-neutral-500 line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                    <Link to="/shop">
                      <Button
                        variant="primary"
                        size="sm"
                        className="px-3 py-1 text-xs group-hover:bg-brand-600 group-hover:scale-105 transition-all"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-20 bg-gradient-to-r from-brand-600 to-brand-700 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="stat-item">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-90">Happy Students</div>
            </div>
            <div className="stat-item">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Courses Available</div>
            </div>
            <div className="stat-item">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Expert Instructors</div>
            </div>
            <div className="stat-item">
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-lg opacity-90">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="py-20 bg-neutral-900 text-white relative overflow-hidden"
      >
        {/* Background Antik elements - Responsive */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 sm:top-10 sm:left-10 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32">
            <img
              src={antikWhiteOversized}
              alt="Antik White"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
            <img
              src={antikHoldingBurger}
              alt="Antik Burger"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="cta-element mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Journey? 🚀
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto mb-8">
              Join thousands of learners who have transformed their careers with
              Antik. Start learning today and unlock your potential!
            </p>
          </div>
          <div className="cta-element flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <Button
                variant="primary"
                size="lg"
                className="transform hover:scale-105 transition-transform"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-black hover:bg-white hover:text-neutral-900 transform hover:scale-105 transition-transform"
              >
                <Heart className="w-5 h-5 mr-2" />
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
