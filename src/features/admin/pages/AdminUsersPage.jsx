import { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";
import { adminApi } from "@/services/supabase/adminApi";

const roleBadge = {
  admin: "bg-primary/10 text-primary",
  instructor: "bg-secondary/10 text-secondary",
  student: "bg-accent/10 text-accent",
};

const AdminUsersPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminApi.getAllUsers();
        setAllUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update user role.");
    }
  };

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
      <div>
        <h1 className="text-2xl font-black">Users</h1>
        <p className="text-muted-foreground text-sm">
          {allUsers.length} registered users
        </p>
      </div>

      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">User</th>
              <th className="text-left p-4 font-semibold">Role</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Email
              </th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Status
              </th>
              <th className="text-left p-4 font-semibold hidden lg:table-cell">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr
                key={user.id}
                className="border-t hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user.name?.charAt(0) || "?"}
                    </div>
                    <span className="font-semibold">{user.name || "—"}</span>
                  </div>
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-full capitalize border-0 cursor-pointer ${roleBadge[user.role] || "bg-muted"}`}
                  >
                    {["student", "instructor", "admin"].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">
                  {user.email}
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${user.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {user.status || "active"}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground hidden lg:table-cell">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
