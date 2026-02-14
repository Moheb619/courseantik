import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/shared/ProgressRing";
import { courseApi } from "@/services/supabase/courseApi";
import { useAuth } from "@/hooks/useAuth";

const MyCoursesPage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolled = async () => {
      if (!user) return;
      try {
        // getEnrolledCourses returns courses with enrollment data
        const courses = await courseApi.getEnrolledCourses(user.id);

        // For each course, fetch progress to calculate completion
        const enriched = await Promise.all(
          courses.map(async (course) => {
            try {
              const progress = await courseApi.getProgress(course.id, user.id);
              const totalLessons = (course.modules || []).reduce(
                (sum, m) => sum + (m.lessons?.length || 0),
                0,
              );
              const completed = progress?.length || 0;
              const percent =
                totalLessons > 0
                  ? Math.round((completed / totalLessons) * 100)
                  : 0;
              return { ...course, completed, totalLessons, progress: percent };
            } catch {
              return { ...course, completed: 0, totalLessons: 0, progress: 0 };
            }
          }),
        );

        setEnrolledCourses(enriched);
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        setError("Failed to load your courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolled();
  }, [user]);

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
      <div className="mb-8">
        <h1 className="text-3xl font-black">My Courses 📖</h1>
        <p className="text-muted-foreground">Continue where you left off</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-4">
            Explore our catalog and start learning!
          </p>
          <Button asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {enrolledCourses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}/learn`}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white rounded-2xl border-[3px] border-foreground/10 cartoon-hover group"
            >
              {/* Thumbnail */}
              <div className="w-full sm:w-40 aspect-video sm:aspect-auto sm:h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-8 h-8 text-primary/30" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {course.completed}/{course.totalLessons} lessons
                  {course.instructors?.[0] &&
                    ` · ${course.instructors[0].name}`}
                </p>
                {/* Progress bar */}
                <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              {/* Progress ring */}
              <div className="flex items-center gap-4">
                <ProgressRing
                  percentage={course.progress}
                  size={54}
                  strokeWidth={5}
                />
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
