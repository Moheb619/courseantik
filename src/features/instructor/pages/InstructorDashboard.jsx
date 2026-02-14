import { DollarSign, Users, BookOpen, TrendingUp } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import coursesData from "@/data/courses.json";

const InstructorDashboard = () => {
  // Simulate instructor data (courses assigned to inst-1)
  const myCourses = coursesData.filter((c) =>
    c.instructors.some((i) => i.id === "inst-1"),
  );
  const totalStudents = myCourses.reduce((sum, c) => sum + c.total_students, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Welcome, Antik! 🎨</h1>
        <p className="text-muted-foreground">
          Here's your performance overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value="৳65,200"
          icon={DollarSign}
          color="bg-secondary/10 text-secondary"
          trend="+22%"
          trendUp
        />
        <StatCard
          label="Total Students"
          value={totalStudents.toLocaleString()}
          icon={Users}
          color="bg-primary/10 text-primary"
          trend="+8%"
          trendUp
        />
        <StatCard
          label="My Courses"
          value={myCourses.length}
          icon={BookOpen}
          color="bg-accent/10 text-accent"
        />
        <StatCard
          label="Avg. Rating"
          value="4.8"
          icon={TrendingUp}
          color="bg-success/10 text-success"
        />
      </div>

      {/* Courses Performance */}
      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 p-6">
        <h2 className="font-bold text-lg mb-4">My Courses Performance</h2>
        <div className="space-y-4">
          {myCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{course.title}</p>
                <p className="text-xs text-muted-foreground">
                  {course.level} · {course.modules.length} modules
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">
                  {course.total_students.toLocaleString()} students
                </p>
                <p className="text-xs text-muted-foreground">
                  ⭐ {course.rating}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
