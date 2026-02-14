import { Link } from "react-router-dom";
import { BookOpen, Star, Users, Eye } from "lucide-react";
import coursesData from "@/data/courses.json";

const InstructorCoursesPage = () => {
  const myCourses = coursesData.filter((c) =>
    c.instructors.some((i) => i.id === "inst-1"),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">My Courses</h1>
        <p className="text-muted-foreground text-sm">
          {myCourses.length} courses assigned
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border-[3px] border-foreground/10 overflow-hidden cartoon-hover"
          >
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary/20" />
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-lg">{course.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {course.total_students}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />{" "}
                  {course.rating}
                </span>
                <span>{course.modules.length} modules</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-primary">
                  {course.price === 0
                    ? "Free"
                    : `৳${course.price.toLocaleString()}`}
                </span>
                <Link
                  to={`/courses/${course.id}`}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorCoursesPage;
