import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { certificateApi } from "@/services/supabase/certificateApi";

const CertificateVerifyPage = () => {
  const { code } = useParams();
  const [searchCode, setSearchCode] = useState(code || "");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-verify if code comes from URL params
  useState(() => {
    if (code) {
      handleVerify(code);
    }
  });

  async function handleVerify(verifyCode) {
    const codeToVerify = verifyCode || searchCode.trim();
    if (!codeToVerify) return;

    setLoading(true);
    setSearched(false);
    try {
      const data = await certificateApi.verifyCertificate(codeToVerify);
      setResult(data || null);
    } catch (err) {
      console.error("Error verifying certificate:", err);
      setResult(null);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <Award className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-black">Verify Certificate</h1>
        <p className="text-muted-foreground">
          Enter a certificate code to verify its authenticity
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="e.g. CA-2026-XK9M4P"
            className="pl-10 rounded-xl border-[2px] font-mono"
          />
        </div>
        <Button
          type="submit"
          className="rounded-xl cartoon-shadow-sm"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
        </Button>
      </form>

      {searched &&
        (result ? (
          <div className="bg-white rounded-2xl border-[3px] border-foreground/10 cartoon-shadow overflow-hidden">
            <div className="gradient-primary p-8 text-center space-y-3">
              {result.status === "active" ? (
                <CheckCircle2 className="w-16 h-16 text-white mx-auto" />
              ) : (
                <XCircle className="w-16 h-16 text-white/50 mx-auto" />
              )}
              <h2 className="text-2xl font-black text-white">
                {result.status === "active"
                  ? "✅ Valid Certificate"
                  : "❌ Certificate Revoked"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Holder</p>
                  <p className="font-bold">{result.profile?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="font-bold">{result.course?.title || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Final Score</p>
                  <p className="font-bold text-primary">
                    {result.final_score}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-bold">
                    {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Code</p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {result.verification_code}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border-[2px] border-foreground/10">
            <XCircle className="w-12 h-12 text-destructive/50 mx-auto mb-3" />
            <h3 className="font-bold text-lg">Certificate Not Found</h3>
            <p className="text-muted-foreground text-sm">
              The code you entered doesn't match any certificate in our system.
            </p>
          </div>
        ))}
    </div>
  );
};

export default CertificateVerifyPage;
