import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  Download,
  CheckCircle2,
  Circle,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/shared/ProgressRing";
import { courseApi } from "@/services/supabase/courseApi";
import { useAuth } from "@/hooks/useAuth";

const CoursePlayerPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [marking, setMarking] = useState(false);

  // Fetch course and progress data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseData = await courseApi.getCourseById(id);
        setCourse(courseData);

        // Fetch user progress — returns array of completed lesson records
        if (user) {
          try {
            const progress = await courseApi.getProgress(id, user.id);
            const completedIds = new Set(
              (progress || []).map((p) => p.lesson_id),
            );
            setCompletedLessons(completedIds);
          } catch (err) {
            console.error("Error fetching progress:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Course not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  // Mark lesson as complete
  const handleMarkComplete = async (lesson) => {
    if (!user || completedLessons.has(lesson.id) || marking) return;

    // Find the module this lesson belongs to
    const module = course.modules.find((m) =>
      m.lessons.some((l) => l.id === lesson.id),
    );
    if (!module) return;

    setMarking(true);
    try {
      await courseApi.markLessonComplete(id, module.id, lesson.id, user.id);
      setCompletedLessons((prev) => new Set([...prev, lesson.id]));
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <Link to="/courses" className="text-primary mt-4 inline-block">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // Flatten lessons for navigation
  const allLessons = (course.modules || []).flatMap((m) => m.lessons || []);
  const currentLesson = activeLesson || allLessons[0];

  if (!currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No lessons available</h1>
          <Link
            to={`/courses/${id}`}
            className="text-primary mt-4 inline-block"
          >
            ← Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);

  // Calculate progress
  const completedCount = allLessons.filter((l) =>
    completedLessons.has(l.id),
  ).length;
  const progressPercent =
    allLessons.length > 0
      ? Math.round((completedCount / allLessons.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b bg-white flex items-center px-4 gap-4 flex-shrink-0 z-20">
        <Link
          to={`/courses/${course.id}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">{course.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing
            percentage={progressPercent}
            size={36}
            strokeWidth={4}
          />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video */}
          <div className="aspect-video bg-black flex items-center justify-center">
            {currentLesson.type === "video" ? (
              <video
                key={currentLesson.id}
                src={currentLesson.video_url}
                controls
                className="w-full h-full"
              />
            ) : currentLesson.type === "quiz" ? (
              <div className="text-center text-white space-y-4 p-8">
                <FileText className="w-16 h-16 mx-auto text-secondary" />
                <h2 className="text-2xl font-bold">
                  Quiz: {currentLesson.title}
                </h2>
                <Button className="cartoon-shadow-sm">Start Quiz</Button>
              </div>
            ) : (
              <div className="text-center text-white space-y-4 p-8">
                <Award className="w-16 h-16 mx-auto text-accent" />
                <h2 className="text-2xl font-bold">
                  Assignment: {currentLesson.title}
                </h2>
                <Button className="cartoon-shadow-sm">View Assignment</Button>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="p-4 md:p-6 border-b">
            <h2 className="text-xl font-bold">{currentLesson.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Lesson {currentIndex + 1} of {allLessons.length} ·{" "}
              {currentLesson.duration}
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setActiveLesson(allLessons[currentIndex - 1])}
                className="rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              {/* Mark Complete button */}
              {!completedLessons.has(currentLesson.id) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkComplete(currentLesson)}
                  disabled={marking}
                  className="rounded-xl border-success text-success hover:bg-success/10"
                >
                  {marking ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                  )}
                  Mark Complete
                </Button>
              )}

              <Button
                size="sm"
                disabled={currentIndex === allLessons.length - 1}
                onClick={() => setActiveLesson(allLessons[currentIndex + 1])}
                className="rounded-xl cartoon-shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Resources */}
          {(course.modules || []).map((m) => {
            const moduleHasCurrentLesson = (m.lessons || []).some(
              (l) => l.id === currentLesson.id,
            );
            if (!moduleHasCurrentLesson || !m.resources?.length) return null;
            return (
              <div key={m.id} className="p-4 md:p-6">
                <h3 className="font-bold text-sm mb-3">📎 Resources</h3>
                <div className="space-y-2">
                  {m.resources.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Download className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{r.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {r.type?.toUpperCase()}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar - Curriculum */}
        {sidebarOpen && (
          <aside className="w-80 border-l bg-white overflow-y-auto flex-shrink-0 hidden md:block">
            <div className="p-4 border-b">
              <h3 className="font-bold text-sm">Course Content</h3>
              <p className="text-xs text-muted-foreground">
                {completedCount}/{allLessons.length} completed
              </p>
            </div>
            {(course.modules || []).map((module, mIndex) => (
              <div key={module.id} className="border-b">
                <div className="px-4 py-3 bg-muted/30">
                  <p className="text-xs font-bold text-muted-foreground">
                    MODULE {mIndex + 1}
                  </p>
                  <p className="text-sm font-semibold">{module.title}</p>
                </div>
                {(module.lessons || []).map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-foreground/5
                      ${currentLesson.id === lesson.id ? "bg-primary/10 border-l-[3px] border-l-primary" : ""}`}
                  >
                    {completedLessons.has(lesson.id) ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    ) : currentLesson.id === lesson.id ? (
                      <Play className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">
                        {lesson.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {lesson.duration}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
};

export default CoursePlayerPage;
