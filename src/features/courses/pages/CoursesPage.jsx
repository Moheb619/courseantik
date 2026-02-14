import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  BookOpen,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { courseApi } from "@/services/supabase/courseApi";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseApi.getCourses();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = courses
    .filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase()),
    )
    .filter((c) => levelFilter === "All" || c.level === levelFilter);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-black">Explore Courses 📚</h1>
        <p className="text-muted-foreground">
          Discover {courses.length}+ courses taught by industry experts
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-10 rounded-xl border-[2px] border-foreground/10 focus:border-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {levels.map((level) => (
            <Button
              key={level}
              variant={levelFilter === level ? "default" : "outline"}
              size="sm"
              onClick={() => setLevelFilter(level)}
              className={`rounded-full font-semibold whitespace-nowrap ${
                levelFilter === level
                  ? "cartoon-shadow-sm"
                  : "border-[2px] border-foreground/10"
              }`}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group bg-white rounded-2xl border-[3px] border-foreground/10 overflow-hidden cartoon-hover"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary/20" />
                </div>
                {course.price === 0 && (
                  <span className="absolute top-3 left-3 bg-success text-white text-xs font-bold px-3 py-1 rounded-full">
                    FREE
                  </span>
                )}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full">
                  {course.level}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>

                {/* Instructor */}
                {course.instructors?.[0] && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-bold">
                      {course.instructors[0].name?.charAt(0)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {course.instructors[0].name}
                    </span>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  {course.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />{" "}
                    {(course.total_students || 0).toLocaleString()}
                  </span>
                  {course.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />{" "}
                      {course.rating}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
                  <span className="text-xl font-black text-primary">
                    {course.price === 0
                      ? "Free"
                      : `৳${course.price.toLocaleString()}`}
                  </span>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
