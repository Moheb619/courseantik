import { DollarSign, TrendingUp, BookOpen } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import coursesData from "@/data/courses.json";

const InstructorRevenuePage = () => {
  const myCourses = coursesData.filter((c) =>
    c.instructors.some((i) => i.id === "inst-1"),
  );

  const revenueBreakdown = myCourses.map((course) => ({
    id: course.id,
    title: course.title,
    students: course.total_students,
    price: course.price,
    grossRevenue: course.price * course.total_students,
    myShare: Math.round(course.price * course.total_students * 0.3), // 30% instructor share
  }));

  const totalRevenue = revenueBreakdown.reduce((sum, r) => sum + r.myShare, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">Revenue</h1>
        <p className="text-muted-foreground text-sm">Your earnings breakdown</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Earnings"
          value={`৳${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-secondary/10 text-secondary"
        />
        <StatCard
          label="This Month"
          value="৳12,400"
          icon={TrendingUp}
          color="bg-primary/10 text-primary"
          trend="+15%"
          trendUp
        />
        <StatCard
          label="Revenue Courses"
          value={revenueBreakdown.filter((r) => r.price > 0).length}
          icon={BookOpen}
          color="bg-accent/10 text-accent"
        />
      </div>

      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Course</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Students
              </th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Price
              </th>
              <th className="text-left p-4 font-semibold hidden lg:table-cell">
                Gross Revenue
              </th>
              <th className="text-left p-4 font-semibold">My Share (30%)</th>
            </tr>
          </thead>
          <tbody>
            {revenueBreakdown.map((row) => (
              <tr
                key={row.id}
                className="border-t hover:bg-muted/20 transition-colors"
              >
                <td className="p-4 font-semibold truncate max-w-[200px]">
                  {row.title}
                </td>
                <td className="p-4 hidden md:table-cell">
                  {row.students.toLocaleString()}
                </td>
                <td className="p-4 hidden md:table-cell">
                  {row.price === 0 ? "Free" : `৳${row.price}`}
                </td>
                <td className="p-4 hidden lg:table-cell">
                  ৳{row.grossRevenue.toLocaleString()}
                </td>
                <td className="p-4 font-bold text-secondary">
                  ৳{row.myShare.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Revenue split: 30% Instructor / 70% Platform. Contact admin for
        questions.
      </p>
    </div>
  );
};

export default InstructorRevenuePage;
