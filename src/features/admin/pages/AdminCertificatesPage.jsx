import { useState, useEffect } from "react";
import { Award, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { certificateApi } from "@/services/supabase/certificateApi";

const AdminCertificatesPage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const data = await certificateApi.getAllCertificates();
        setCerts(data);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError("Failed to load certificates.");
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  // Toggle certificate status (revoke or restore)
  const handleToggleStatus = async (cert) => {
    try {
      if (cert.status === "active") {
        await certificateApi.revokeCertificate(cert.id);
        setCerts((prev) =>
          prev.map((c) => (c.id === cert.id ? { ...c, status: "revoked" } : c)),
        );
      } else {
        await certificateApi.restoreCertificate(cert.id);
        setCerts((prev) =>
          prev.map((c) => (c.id === cert.id ? { ...c, status: "active" } : c)),
        );
      }
    } catch (err) {
      console.error("Error toggling certificate status:", err);
      alert("Failed to update certificate.");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Certificates</h1>
          <p className="text-muted-foreground text-sm">
            {certs.length} certificates issued
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-[2px] border-foreground/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Student</th>
              <th className="text-left p-4 font-semibold">Course</th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Score
              </th>
              <th className="text-left p-4 font-semibold hidden md:table-cell">
                Code
              </th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-left p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((cert) => (
              <tr
                key={cert.id}
                className="border-t hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {cert.profile?.name?.charAt(0) || "?"}
                    </div>
                    <span className="font-semibold">
                      {cert.profile?.name || "—"}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground truncate max-w-[200px]">
                  {cert.course?.title || "—"}
                </td>
                <td className="p-4 font-bold text-primary hidden md:table-cell">
                  {cert.final_score}%
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {cert.verification_code}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${cert.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {cert.status}
                  </span>
                </td>
                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleToggleStatus(cert)}
                  >
                    {cert.status === "active" ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Revoke
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Restore
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCertificatesPage;
