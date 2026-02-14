import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Star, Users, Eye, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseApi } from "@/services/supabase/courseApi";

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Admin needs ALL courses (published + drafts)
        // getCourses only returns published — use Supabase directly or an admin method
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

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Courses</h1>
          <p className="text-muted-foreground text-sm">
            {courses.length} total courses
          </p>
        </div>
        <Button asChild className="rounded-xl cartoon-shadow-sm">
          <Link to="/admin/courses/new">
            <Plus className="w-4 h-4 mr-2" /> New Course
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold">Course</th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">
                  Level
                </th>
                <th className="text-left p-4 font-semibold hidden lg:table-cell">
                  Students
                </th>
                <th className="text-left p-4 font-semibold hidden lg:table-cell">
                  Rating
                </th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-t hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary">
                          {course.modules?.length || 0}M
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate max-w-[200px]">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.instructors?.[0]?.name || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded-full">
                      {course.level}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                      {(course.total_students || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />{" "}
                      {course.rating || "—"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-primary">
                    {course.price === 0
                      ? "Free"
                      : `৳${course.price.toLocaleString()}`}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${course.published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                    >
                      {course.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/courses/${course.id}`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <Link
                        to={`/admin/courses/${course.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoursesPage;
