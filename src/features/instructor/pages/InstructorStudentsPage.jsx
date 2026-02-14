import { Users, TrendingUp, Award } from "lucide-react";
import usersDataFile from "@/data/users.json";
import coursesData from "@/data/courses.json";

const InstructorStudentsPage = () => {
  // Get students enrolled in instructor's courses
  const students = usersDataFile.users.filter(
    (u) =>
      u.role === "student" &&
      u.enrolled_courses?.some((ec) =>
        coursesData
          .find((c) => c.id === ec)
          ?.instructors.some((i) => i.id === "inst-1"),
      ),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Student Performance</h1>
        <p className="text-muted-foreground text-sm">
          {students.length} students in your courses
        </p>
      </div>

      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Student</th>
              <th className="text-left p-4 font-semibold">Enrolled Courses</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Status
              </th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-t hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-warm flex items-center justify-center text-white text-xs font-bold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-primary font-semibold">
                    {student.enrolled_courses?.length || 0}
                  </span>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${student.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">
                  {new Date(student.joined_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorStudentsPage;
