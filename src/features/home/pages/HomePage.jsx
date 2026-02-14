import { Link } from "react-router-dom";
import { useRef, useLayoutEffect, useState, useEffect } from "react";
import gsap from "gsap";
import {
  BookOpen,
  ShoppingBag,
  Star,
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseApi } from "@/services/supabase/courseApi";
import { productApi } from "@/services/supabase/productApi";

const HomePage = () => {
  const heroRef = useRef();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-title",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
      );
      gsap.fromTo(
        ".hero-subtitle",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2 },
      );
      gsap.fromTo(
        ".hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.4 },
      );
      gsap.fromTo(
        ".hero-stats > div",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.6 },
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courses, products] = await Promise.allSettled([
          courseApi.getCourses(),
          productApi.getProducts(),
        ]);
        if (courses.status === "fulfilled") {
          setFeaturedCourses(courses.value.slice(0, 3));
        }
        if (products.status === "fulfilled") {
          setFeaturedProducts(
            products.value.filter((p) => p.featured).slice(0, 4),
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* ───── HERO ───── */}
      <section
        ref={heroRef}
        className="relative gradient-primary overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white/5 blur-xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary/20 blur-2xl" />
        <div className="absolute top-1/3 left-1/3 w-40 h-40 rounded-full bg-accent/10" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium animate-bounce-in">
              <Sparkles className="w-4 h-4" />
              Bangladesh's #1 Cartoon Learning Platform
            </div>

            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              Learn <span className="text-accent">Cartoon Art</span> from the
              Best
            </h1>

            <p className="hero-subtitle text-lg md:text-xl text-white/70 max-w-xl mx-auto">
              Master cartooning, digital art, and illustration. Shop exclusive
              merch. Join thousands of creative students! 🎨
            </p>

            <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 rounded-xl cartoon-shadow-sm hover:translate-y-[-2px] transition-all"
              >
                <Link to="/courses">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Browse Courses
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-bold text-lg px-8 rounded-xl"
              >
                <Link to="/products">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Merch
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="hero-stats flex flex-wrap justify-center gap-8 pt-8">
              {[
                { icon: Users, value: "5,000+", label: "Students" },
                { icon: BookOpen, value: "20+", label: "Courses" },
                { icon: Trophy, value: "95%", label: "Success Rate" },
                { icon: Star, value: "4.8", label: "Avg Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-white font-black text-2xl">
                    <stat.icon className="w-5 h-5 text-accent" />
                    {stat.value}
                  </div>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cartoon wave bottom */}
        <svg
          viewBox="0 0 1440 100"
          className="w-full block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,30 1440,50 L1440,100 L0,100 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </section>

      {/* ───── FEATURED COURSES ───── */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Popular Courses 🔥</h2>
            <p className="text-muted-foreground mt-1">
              Start your creative journey today
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="text-primary font-semibold"
          >
            <Link to="/courses">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="group bg-white rounded-2xl border-[3px] border-foreground/10 overflow-hidden cartoon-hover"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/30" />
                  </div>
                  {course.price === 0 && (
                    <span className="absolute top-3 left-3 bg-success text-white text-xs font-bold px-3 py-1 rounded-full">
                      FREE
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-bold">{course.rating || "—"}</span>
                      <span className="text-muted-foreground">
                        ({course.total_students || 0})
                      </span>
                    </div>
                    <span className="text-lg font-black text-primary">
                      {course.price === 0
                        ? "Free"
                        : `৳${course.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ───── FEATURED PRODUCTS ───── */}
      <section className="bg-foreground/[0.03] py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black">Exclusive Merch 🛍️</h2>
              <p className="text-muted-foreground mt-1">
                Art supplies & creator merchandise
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-primary font-semibold"
            >
              <Link to="/products">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white rounded-2xl border-[3px] border-foreground/10 overflow-hidden cartoon-hover"
                >
                  <div className="aspect-square bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-secondary/30" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-lg font-black text-primary mt-2">
                      ৳{product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───── CTA SECTION ───── */}
      <section className="container mx-auto px-4 py-16">
        <div className="gradient-primary rounded-3xl p-8 md:p-14 text-center relative overflow-hidden cartoon-shadow">
          <div className="absolute top-5 right-10 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute bottom-5 left-10 w-24 h-24 rounded-full bg-accent/20" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Ready to Start Your Creative Journey? 🚀
            </h2>
            <p className="text-white/70 text-lg">
              Join thousands of students learning cartoon art, illustration, and
              digital design.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-10 rounded-xl cartoon-shadow-sm"
            >
              <Link to="/signup">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
