import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Users,
  Clock,
  Play,
  BookOpen,
  Zap,
  Target,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatCurrency } from "../../../utils/fmt";
import Button from "../../../components/ui/Button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../services/courseService";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const headerRef = useRef(null);
  const searchRef = useRef(null);
  const coursesRef = useRef(null);

  // Fetch courses from database
  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses", { search: searchTerm, filter }],
    queryFn: () =>
      courseService.getCourses({
        search: searchTerm || undefined,
        free: filter === "free" ? true : undefined,
        featured: filter === "featured" ? true : undefined,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Simple header animations with fallback
    if (headerRef.current) {
      const headerElements =
        headerRef.current.querySelectorAll(".header-element");
      if (headerElements.length > 0) {
        gsap.fromTo(
          headerElements,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
        );
      }
    }

    // Simple search animations with fallback
    if (searchRef.current) {
      const searchElements =
        searchRef.current.querySelectorAll(".search-element");
      if (searchElements.length > 0) {
        gsap.fromTo(
          searchElements,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.3,
          }
        );
      }
    }

    // Simple courses grid animations with fallback
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

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h1 className="header-element text-4xl font-bold text-neutral-900 mb-4">
            Explore Our Courses 🎓
          </h1>
          <p className="header-element text-lg text-neutral-600 max-w-2xl mx-auto">
            Master new skills with our comprehensive courses taught by industry
            experts
          </p>
        </div>

        {/* Search and Filters */}
        <div ref={searchRef} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="search-element flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div className="search-element flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-black"
              >
                <option value="all">All Courses</option>
                <option value="free">Free Courses</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div
          ref={coursesRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-neutral-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-600">
                Error loading courses. Please try again.
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-600">
                No courses found matching your criteria.
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="course-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  {/* Cartoon emoji based on course type */}
                  <div className="absolute top-4 left-4 text-2xl">
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
                  {course.isFree && (
                    <span className="absolute top-4 right-4 bg-success-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Free
                    </span>
                  )}
                  {course.isFeatured && (
                    <span className="absolute top-4 right-4 bg-brand-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {course.title}
                  </h3>
                  <div className="text-neutral-600 mb-4 line-clamp-2 prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {course.description}
                    </ReactMarkdown>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolledCount} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.lessonsCount} lessons</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-red-300">
                        {course.rating}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-neutral-900">
                      {course.isFree
                        ? "Free"
                        : formatCurrency(course.priceCents / 100)}
                    </div>
                  </div>

                  <Link to={`/course/${course.slug}`}>
                    <Button variant="primary" fullWidth>
                      <Play className="w-4 h-4 mr-2" />
                      View Course
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
