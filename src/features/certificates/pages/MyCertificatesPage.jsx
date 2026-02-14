import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, ExternalLink, Loader2 } from "lucide-react";
import { certificateApi } from "@/services/supabase/certificateApi";
import { useAuth } from "@/hooks/useAuth";

const MyCertificatesPage = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCerts = async () => {
      if (!user) return;
      try {
        const data = await certificateApi.getMyCertificates(user.id);
        setCerts(data);
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError("Failed to load certificates.");
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
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
        <h1 className="text-3xl font-black">My Certificates 🏆</h1>
        <p className="text-muted-foreground">
          Your achievements and proof of completion
        </p>
      </div>

      {certs.length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No certificates yet</h3>
          <p className="text-muted-foreground">
            Complete a course to earn your first certificate!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border-[3px] border-foreground/10 overflow-hidden cartoon-shadow-sm"
            >
              {/* Certificate preview */}
              <div className="gradient-primary p-8 text-center space-y-3 relative">
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10" />
                <Award className="w-12 h-12 text-accent mx-auto" />
                <h3 className="text-white font-bold text-lg">
                  {cert.course?.title || "Course"}
                </h3>
                <p className="text-white/60 text-sm">
                  Awarded to {cert.profile?.name || "Student"}
                </p>
              </div>
              {/* Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-bold text-primary">
                    {cert.final_score}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {new Date(cert.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {cert.verification_code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${cert.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {cert.status}
                  </span>
                </div>
                <Link
                  to={`/certificates/verify/${cert.verification_code}`}
                  className="flex items-center justify-center gap-2 mt-2 text-sm font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" /> Verify Certificate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificatesPage;
