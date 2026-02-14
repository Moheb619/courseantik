import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  ChevronDown,
  ChevronUp,
  FileText,
  Award,
  ShoppingBag,
  Lock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseApi } from "@/services/supabase/courseApi";
import { useAuth } from "@/hooks/useAuth";

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState([0]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseApi.getCourseById(id);
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Course not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Check enrollment status for logged-in users
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (user && id) {
        try {
          const enrolled = await courseApi.checkEnrollment(id, user.id);
          setIsEnrolled(enrolled);
        } catch (err) {
          console.error("Error checking enrollment:", err);
        }
      }
    };
    checkEnrollmentStatus();
  }, [user, id]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/courses/${id}` } });
      return;
    }
    setEnrolling(true);
    try {
      await courseApi.enrollCourse(id, user.id);
      setIsEnrolled(true);
      navigate(`/courses/${id}/learn`);
    } catch (err) {
      console.error("Error enrolling:", err);
      alert("Failed to enroll. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (index) => {
    setExpandedModules((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Link to="/courses" className="text-primary mt-4 inline-block">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const totalLessons = (course.modules || []).reduce(
    (sum, m) => sum + (m.lessons?.length || 0),
    0,
  );

  return (
    <div>
      {/* Hero */}
      <div className="gradient-primary relative overflow-hidden">
        <div className="absolute top-10 right-20 w-48 h-48 rounded-full bg-white/5" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Link
                to="/courses"
                className="hover:text-white transition-colors"
              >
                Courses
              </Link>
              <span>/</span>
              <span>{course.level}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              {course.title}
            </h1>
            <p className="text-white/70 text-lg max-w-2xl">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              {course.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />{" "}
                  {course.rating}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />{" "}
                {(course.total_students || 0).toLocaleString()} students
              </span>
              {course.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {course.duration}
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {totalLessons} lessons
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {(course.instructors || []).map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5"
                >
                  <div className="w-7 h-7 rounded-full gradient-warm flex items-center justify-center text-white text-xs font-bold">
                    {inst.name?.charAt(0)}
                  </div>
                  <span className="text-white text-sm font-medium">
                    {inst.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <svg
          viewBox="0 0 1440 60"
          className="w-full block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C480,60 960,0 1440,30 L1440,60 L0,60 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Curriculum */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trailer */}
            {course.trailer_url && (
              <div className="rounded-2xl overflow-hidden border-[3px] border-foreground/10 cartoon-shadow">
                <div className="aspect-video bg-black flex items-center justify-center relative">
                  <video
                    src={course.trailer_url}
                    controls
                    className="w-full h-full"
                    poster=""
                  />
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div>
              <h2 className="text-2xl font-black mb-4">Curriculum</h2>
              <div className="space-y-3">
                {(course.modules || []).map((module, mIndex) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-2xl border-[2px] border-foreground/10 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleModule(mIndex)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 rounded-lg gradient-primary text-white text-sm font-bold flex items-center justify-center">
                          {mIndex + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{module.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {module.lessons?.length || 0} lessons · Weight:{" "}
                            {module.weight_percentage}%
                          </p>
                        </div>
                      </div>
                      {expandedModules.includes(mIndex) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedModules.includes(mIndex) && (
                      <div className="border-t bg-muted/20">
                        {(module.lessons || []).map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-4 py-3 border-b last:border-0 border-foreground/5"
                          >
                            {lesson.type === "video" ? (
                              <Play className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : lesson.type === "quiz" ? (
                              <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                            )}
                            <span className="text-sm flex-1">
                              {lesson.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {lesson.duration}
                            </span>
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        ))}
                        {/* Quiz row — data comes from module.quizzes array */}
                        {module.quizzes?.[0] && (
                          <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5 bg-primary/5">
                            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm flex-1 font-medium">
                              Module Quiz (
                              {module.quizzes[0].questions_per_attempt}{" "}
                              questions)
                            </span>
                            <span className="text-xs text-primary font-semibold">
                              {module.quiz_percentage}% of grade
                            </span>
                          </div>
                        )}
                        {/* Assignment row — data comes from module.assignments array */}
                        {module.assignments?.[0] && (
                          <div className="flex items-center gap-3 px-4 py-3 bg-secondary/5">
                            <Award className="w-4 h-4 text-secondary flex-shrink-0" />
                            <span className="text-sm flex-1 font-medium">
                              {module.assignments[0].title}
                            </span>
                            <span className="text-xs text-secondary font-semibold">
                              {module.assignment_percentage}% of grade
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Enroll Card */}
            <div className="bg-white rounded-2xl border-[3px] border-foreground/10 p-6 cartoon-shadow sticky top-24 space-y-4">
              <div className="text-3xl font-black text-primary">
                {course.price === 0
                  ? "Free"
                  : `৳${course.price.toLocaleString()}`}
              </div>

              {isEnrolled ? (
                <Button
                  asChild
                  className="w-full rounded-xl font-bold text-lg py-6 cartoon-shadow-sm"
                >
                  <Link to={`/courses/${course.id}/learn`}>
                    Continue Learning →
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full rounded-xl font-bold text-lg py-6 cartoon-shadow-sm"
                >
                  {enrolling ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {course.price === 0 ? "Start Learning" : "Enroll Now"} →
                </Button>
              )}

              <div className="space-y-3 text-sm pt-2">
                {course.duration && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />{" "}
                    <span>{course.duration} of content</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4" />{" "}
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="w-4 h-4" />{" "}
                  <span>
                    {course.certificate_enabled
                      ? "Certificate included"
                      : "No certificate"}
                  </span>
                </div>
                {course.certificate_enabled && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4" />{" "}
                    <span>Requires {course.required_percentage}% to pass</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Products */}
            {course.recommended_products?.length > 0 && (
              <div className="bg-white rounded-2xl border-[2px] border-foreground/10 p-5 space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-secondary" /> Recommended
                  Products
                </h3>
                {course.recommended_products.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 text-secondary/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {p.title}
                      </p>
                      <p className="text-xs text-primary font-bold">
                        ৳{p.price?.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
